import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createToken, isValidEmail, sanitizeInput } from '@/lib/auth';
import { authLimiter, AUTH_LIMIT } from '@/lib/rate-limit';
import { parseBody, isParsed } from '@/lib/api';
import { LoginSchema } from '@/lib/schemas';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP to mitigate brute-force / credential stuffing.
    // NOTE: in-memory limiter is per-instance; use Upstash Redis for multi-instance.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await authLimiter.check(`login:${ip}`, AUTH_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 900) } }
      );
    }

    const body = await parseBody(request, LoginSchema);
    if (!isParsed(body)) return body;
    const { email, password } = body;

    // Sanitize email (Zod already validated format; sanitize for DB lookup)
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Validate email format (defense-in-depth)
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Use constant-time comparison to prevent timing attacks
    if (!user) {
      // Still hash to prevent timing attacks
      await verifyPassword(password, '$2a$12$fakehashfakehashfakehashfakehashfakehashfakehashfake');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Check if user needs onboarding (FACULTY role without staffId)
    const needsOnboarding = user.role === 'FACULTY' && !user.staffId;

    // Create response with HTTP-only cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          staffId: user.staffId,
          needsOnboarding,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    logError('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
