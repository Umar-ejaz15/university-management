import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * PUT /api/admin/cls/requests/[id]/approve
 * Approve a pending equipment request.
 * Sets status to APPROVED and records approvedAt timestamp.
 * Body: { notes? }
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

    // Optional notes from request body
    const body = await request.json().catch(() => ({}));
    const notes: string | undefined =
      body.notes && typeof body.notes === 'string' ? body.notes.trim() : undefined;

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

    if (equipmentRequest.status === 'APPROVED') {
      return NextResponse.json(
        { message: 'Equipment request is already approved' },
        { status: 200 }
      );
    }

    if (equipmentRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `Cannot approve a request with status '${equipmentRequest.status}'. Only PENDING requests can be approved.`,
        },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        ...(notes !== undefined && { adminNotes: notes }),
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
      { message: 'Equipment request approved successfully', request: updatedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to approve equipment request' },
      { status: 500 }
    );
  }
}
