import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * GET /api/cls/requests
 * Get the current faculty user's own equipment requests.
 * Includes equipment and lab information.
 * Requires FACULTY or ADMIN role.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const authResult = await requireRole(user, ['FACULTY', 'ADMIN']);
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

    const requests = await prisma.equipmentRequest.findMany({
      where: { staffId: dbUser.staffId },
      include: {
        equipment: {
          include: {
            lab: true,
          },
        },
      },
      orderBy: { requestedFrom: 'desc' },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Error fetching equipment requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cls/requests
 * Create a new equipment request.
 * Body: { equipmentId, purpose, requestedFrom, requestedTo }
 * Requires FACULTY role. Staff must have a staffId.
 * Validates that requestedFrom is in the future and requestedTo is after requestedFrom.
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const { equipmentId, purpose, studentInfo, requestedFrom, requestedTo } = body;

    // Validate required fields
    if (!equipmentId || typeof equipmentId !== 'string') {
      return NextResponse.json(
        { error: 'equipmentId is required' },
        { status: 400 }
      );
    }

    if (!purpose || typeof purpose !== 'string' || !purpose.trim()) {
      return NextResponse.json(
        { error: 'purpose is required' },
        { status: 400 }
      );
    }

    if (!requestedFrom) {
      return NextResponse.json(
        { error: 'requestedFrom date is required' },
        { status: 400 }
      );
    }

    if (!requestedTo) {
      return NextResponse.json(
        { error: 'requestedTo date is required' },
        { status: 400 }
      );
    }

    const fromDate = new Date(requestedFrom);
    const toDate = new Date(requestedTo);

    if (isNaN(fromDate.getTime())) {
      return NextResponse.json(
        { error: 'requestedFrom is not a valid date' },
        { status: 400 }
      );
    }

    if (isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: 'requestedTo is not a valid date' },
        { status: 400 }
      );
    }

    // Compare at day granularity — today is valid, only past dates are rejected
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const fromDateStart = new Date(fromDate);
    fromDateStart.setHours(0, 0, 0, 0);
    if (fromDateStart < todayStart) {
      return NextResponse.json(
        { error: 'requestedFrom cannot be a past date' },
        { status: 400 }
      );
    }

    if (toDate <= fromDate) {
      return NextResponse.json(
        { error: 'requestedTo must be after requestedFrom' },
        { status: 400 }
      );
    }

    // Verify the equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { id: true, name: true },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    const equipmentRequest = await prisma.equipmentRequest.create({
      data: {
        equipmentId,
        staffId: dbUser.staffId,
        purpose: purpose.trim(),
        studentInfo: studentInfo?.trim() || null,
        requestedFrom: fromDate,
        requestedTo: toDate,
        status: 'PENDING',
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
      { message: 'Equipment request submitted successfully', request: equipmentRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating equipment request:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment request' },
      { status: 500 }
    );
  }
}
