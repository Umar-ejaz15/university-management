import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, isValidEmail, isStrongPassword, sanitizeInput } from '@/lib/auth';
import { authLimiter, AUTH_LIMIT } from '@/lib/rate-limit';
import { parseBody, isParsed } from '@/lib/api';
import { RegisterSchema } from '@/lib/schemas';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP to mitigate automated account creation.
    // NOTE: in-memory limiter is per-instance; use Upstash Redis for multi-instance.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await authLimiter.check(`register:${ip}`, AUTH_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 900) } }
      );
    }

    const body = await parseBody(request, RegisterSchema);
    if (!isParsed(body)) return body;
    const { email, password, name } = body;

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedName = sanitizeInput(name);

    // Validate email format (defense-in-depth; Zod already validated)
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (Zod checks length+match; this adds complexity rules)
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Public registration always creates FACULTY accounts.
    // (The original `body.role === 'ADMIN'` guard is removed because
    //  RegisterSchema intentionally excludes role — it cannot be 'ADMIN'.)

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create user (always FACULTY role for public registration)
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: sanitizedName,
        role: 'FACULTY', // Public registration only creates FACULTY accounts
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    logError('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
