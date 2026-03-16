import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/cls/stats
 * Return Central Lab System statistics:
 *   - totalEquipment:    total number of equipment items across all labs
 *   - totalLabs:         total number of labs
 *   - pendingRequests:   requests with PENDING status
 *   - activeLoans:       requests with APPROVED status (equipment currently on loan)
 *   - completedReturns:  requests with RETURNED status
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

    const [
      totalEquipment,
      totalLabs,
      pendingRequests,
      activeLoans,
      completedReturns,
    ] = await Promise.all([
      prisma.equipment.count(),
      prisma.lab.count(),
      prisma.equipmentRequest.count({ where: { status: 'PENDING' } }),
      prisma.equipmentRequest.count({ where: { status: 'APPROVED' } }),
      prisma.equipmentRequest.count({ where: { status: 'RETURNED' } }),
    ]);

    return NextResponse.json(
      {
        totalEquipment,
        totalLabs,
        pendingRequests,
        activeLoans,
        completedReturns,
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching CLS stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CLS statistics' },
      { status: 500 }
    );
  }
}
