import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { adminActionLimiter, ADMIN_ACTION_LIMIT } from '@/lib/rate-limit';
import { validateFacultyId } from '@/lib/validation';
import { prisma } from '@/lib/db';

/**
 * PUT /api/admin/faculty/[id]/approve
 * Approve a pending faculty member
 * Admin only - Rate limited
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const { id } = await params;

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify admin role
    const authResult = await requireAdmin(
      user,
      request.url,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.reason || 'Forbidden' },
        { status: 403 }
      );
    }

    // Rate limit check
    const identifier = `${user.userId}:${request.headers.get('x-forwarded-for') || 'unknown'}`;
    const rateLimitResult = await adminActionLimiter.check(identifier, ADMIN_ACTION_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': (rateLimitResult.retryAfter || 60).toString(),
          },
        }
      );
    }

    // Validate faculty ID
    const validation = validateFacultyId(id);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid faculty ID', details: validation.errors },
        { status: 400 }
      );
    }

    // Get request body (optional notes)
    const body = await request.json().catch(() => ({}));
    const notes = body.notes || '';

    // Check if faculty exists
    const staff = await prisma.staff.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }

    // Check if already approved
    if (staff.status === 'APPROVED') {
      return NextResponse.json(
        { message: 'Faculty is already approved' },
        { status: 200 }
      );
    }

    // Update staff status to APPROVED
    const updatedStaff = await prisma.staff.update({
      where: { id: id },
      data: {
        status: 'APPROVED',
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'APPROVE_FACULTY',
      performedBy: user.userId,
      targetType: 'STAFF',
      targetId: id,
      metadata: {
        facultyName: staff.name,
        facultyEmail: staff.email,
        notes,
        previousStatus: staff.status,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      message: 'Faculty approved successfully',
      faculty: {
        id: updatedStaff.id,
        name: updatedStaff.name,
        email: updatedStaff.email,
        status: updatedStaff.status,
      },
    });
  } catch (error) {
    console.error('Error approving faculty:', error);
    return NextResponse.json(
      { error: 'Failed to approve faculty' },
      { status: 500 }
    );
  }
}
