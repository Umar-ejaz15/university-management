import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/cls/history
 * Returns per-equipment request counts for the current faculty user.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });
    if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

    const requests = await prisma.equipmentRequest.findMany({
      where: { staffId: dbUser.staffId },
      include: {
        equipment: {
          include: { lab: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate by equipment
    const equipmentMap = new Map<string, {
      equipmentId: string;
      equipmentName: string;
      labName: string;
      totalRequests: number;
      pending: number;
      approved: number;
      rejected: number;
      returned: number;
      lastRequestedAt: string;
    }>();

    for (const req of requests) {
      const eqId = req.equipmentId;
      if (!equipmentMap.has(eqId)) {
        equipmentMap.set(eqId, {
          equipmentId: eqId,
          equipmentName: req.equipment?.name ?? 'Unknown',
          labName: req.equipment?.lab?.name ?? 'Unknown',
          totalRequests: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          returned: 0,
          lastRequestedAt: req.createdAt.toISOString(),
        });
      }
      const entry = equipmentMap.get(eqId)!;
      entry.totalRequests += 1;
      if (req.status === 'PENDING') entry.pending += 1;
      else if (req.status === 'APPROVED') entry.approved += 1;
      else if (req.status === 'REJECTED') entry.rejected += 1;
      else if (req.status === 'RETURNED') entry.returned += 1;
      if (req.createdAt.toISOString() > entry.lastRequestedAt) {
        entry.lastRequestedAt = req.createdAt.toISOString();
      }
    }

    const history = Array.from(equipmentMap.values()).sort(
      (a, b) => b.totalRequests - a.totalRequests
    );

    return NextResponse.json({ history, totalRequests: requests.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching request history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
