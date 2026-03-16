import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * PUT /api/cls/requests/[id]/return
 * Mark an approved equipment request as RETURNED.
 * Sets returnedAt to the current timestamp.
 * Only the staff member who owns the request can return it.
 * The request must have APPROVED status.
 * Requires FACULTY role.
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

    const authResult = await requireRole(user, ['FACULTY']);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.reason || 'Forbidden' },
        { status: 403 }
      );
    }

    // Resolve staffId from the database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (!dbUser?.staffId) {
      return NextResponse.json(
        { error: 'No staff profile associated with this account' },
        { status: 404 }
      );
    }

    // Fetch the request to verify ownership and status
    const equipmentRequest = await prisma.equipmentRequest.findUnique({
      where: { id },
      select: {
        id: true,
        staffId: true,
        status: true,
      },
    });

    if (!equipmentRequest) {
      return NextResponse.json(
        { error: 'Equipment request not found' },
        { status: 404 }
      );
    }

    // Enforce ownership — only the requesting staff member may mark it returned
    if (equipmentRequest.staffId !== dbUser.staffId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only return your own equipment requests' },
        { status: 403 }
      );
    }

    // Only APPROVED requests can be returned
    if (equipmentRequest.status !== 'APPROVED') {
      return NextResponse.json(
        {
          error: `Cannot return a request with status '${equipmentRequest.status}'. Only APPROVED requests can be returned.`,
        },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
      },
      include: {
        equipment: {
          include: {
            lab: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Equipment returned successfully', request: updatedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error returning equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to process return' },
      { status: 500 }
    );
  }
}
