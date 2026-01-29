import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * POST /api/faculty/reapply
 * Allow rejected faculty to reapply (status changes from REJECTED to PENDING)
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify user is FACULTY
    if (user.role !== 'FACULTY') {
      return NextResponse.json(
        { error: 'Only faculty members can reapply' },
        { status: 403 }
      );
    }

    // Get user's staff record
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (!dbUser?.staffId) {
      return NextResponse.json(
        { error: 'No staff record found' },
        { status: 404 }
      );
    }

    // Get staff status
    const staff = await prisma.staff.findUnique({
      where: { id: dbUser.staffId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff record not found' },
        { status: 404 }
      );
    }

    // Only allow reapply if currently REJECTED
    if (staff.status !== 'REJECTED') {
      return NextResponse.json(
        { error: `Cannot reapply with status: ${staff.status}` },
        { status: 400 }
      );
    }

    // Update status to PENDING
    const updatedStaff = await prisma.staff.update({
      where: { id: staff.id },
      data: {
        status: 'PENDING',
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'REAPPLY_FACULTY',
      performedBy: user.userId,
      targetType: 'STAFF',
      targetId: staff.id,
      metadata: {
        facultyName: staff.name,
        facultyEmail: staff.email,
        previousStatus: 'REJECTED',
        newStatus: 'PENDING',
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      message: 'Reapplication submitted successfully',
      staff: {
        id: updatedStaff.id,
        status: updatedStaff.status,
      },
    });
  } catch (error) {
    console.error('Error processing reapply:', error);
    return NextResponse.json(
      { error: 'Failed to process reapplication' },
      { status: 500 }
    );
  }
}
