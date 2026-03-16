import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';
import { RequestStatus } from '@prisma/client';

/**
 * GET /api/admin/cls/requests
 * Get ALL equipment requests with optional filtering.
 * Query params:
 *   - status: filter by request status (PENDING | APPROVED | REJECTED | RETURNED)
 *   - page:   page number, default 1
 *   - limit:  items per page, default 20
 * Includes equipment + lab info and staff info.
 * Requires ADMIN role.
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get('status');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10) || 20));
    const skip = (page - 1) * limit;

    const validStatuses: RequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED'];
    const upperStatus = statusParam?.toUpperCase() as RequestStatus | undefined;
    const statusFilter = upperStatus && validStatuses.includes(upperStatus) ? upperStatus : undefined;

    const where = statusFilter ? { status: statusFilter } : {};

    const [requests, total] = await Promise.all([
      prisma.equipmentRequest.findMany({
        where,
        include: {
          equipment: {
            include: {
              lab: true,
            },
          },
          staff: true,
        },
        orderBy: { requestedFrom: 'desc' },
        skip,
        take: limit,
      }),
      prisma.equipmentRequest.count({ where }),
    ]);

    return NextResponse.json(
      {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching all equipment requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment requests' },
      { status: 500 }
    );
  }
}
