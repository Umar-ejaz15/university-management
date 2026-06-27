import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { adminActionLimiter, ADMIN_ACTION_LIMIT } from '@/lib/rate-limit';
import { validateFacultyId, validateRejectionReason } from '@/lib/validation';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';
import { parseBody, isParsed } from '@/lib/api';
import { RejectFacultySchema } from '@/lib/schemas';

/**
 * PUT /api/admin/faculty/[id]/reject
 * Reject a pending faculty member
 * Admin only - Rate limited
 * Requires rejection reason
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

    // Get rejection reason from request body — validated by Zod
    const body = await parseBody(request, RejectFacultySchema);
    if (!isParsed(body)) return body;
    const reason = body.reason;

    // Validate rejection reason (defense-in-depth; Zod already validated)
    const reasonValidation = validateRejectionReason(reason);
    if (!reasonValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid rejection reason', details: reasonValidation.errors },
        { status: 400 }
      );
    }

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

    // Check if already rejected
    if (staff.status === 'REJECTED') {
      return NextResponse.json(
        { message: 'Faculty is already rejected' },
        { status: 200 }
      );
    }

    // Update staff status to REJECTED
    const updatedStaff = await prisma.staff.update({
      where: { id: id },
      data: {
        status: 'REJECTED',
      },
    });

    // Create audit log with rejection reason
    await createAuditLog({
      action: 'REJECT_FACULTY',
      performedBy: user.userId,
      targetType: 'STAFF',
      targetId: id,
      metadata: {
        facultyName: staff.name,
        facultyEmail: staff.email,
        rejectionReason: reason,
        previousStatus: staff.status,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      message: 'Faculty rejected successfully',
      faculty: {
        id: updatedStaff.id,
        name: updatedStaff.name,
        email: updatedStaff.email,
        status: updatedStaff.status,
      },
    });
  } catch (error) {
    logError('Error rejecting faculty:', error);
    return NextResponse.json(
      { error: 'Failed to reject faculty' },
      { status: 500 }
    );
  }
}
