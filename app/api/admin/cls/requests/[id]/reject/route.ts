import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * PUT /api/admin/cls/requests/[id]/reject
 * Reject a pending equipment request.
 * Sets status to REJECTED and stores the rejection reason in adminNotes.
 * Body: { reason } — required
 * Requires ADMIN role.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

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

    // Rejection reason is mandatory
    const body = await request.json().catch(() => null);

    if (!body || !body.reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason cannot be empty' },
        { status: 400 }
      );
    }

    // Verify the request exists
    const equipmentRequest = await prisma.equipmentRequest.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!equipmentRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    if (equipmentRequest.status === 'REJECTED') {
      return NextResponse.json(
        { message: 'Equipment request is already rejected' },
        { status: 200 }
      );
    }

    if (equipmentRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `Cannot reject a request with status '${equipmentRequest.status}'. Only PENDING requests can be rejected.`,
        },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNotes: reason,
      },
      include: {
        equipment: {
          include: {
            lab: true,
          },
        },
        staff: true,
      },
    });

    return NextResponse.json(
      { message: 'Equipment request rejected successfully', request: updatedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error rejecting equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to reject equipment request' },
      { status: 500 }
    );
  }
}
