import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/cls/history
 * Returns per-equipment, per-teacher request count history.
 * Requires ADMIN role.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const authResult = await requireAdmin(
      user,
      request.url,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );
    if (!authResult.authorized) return NextResponse.json({ error: authResult.reason || 'Forbidden' }, { status: 403 });

    const requests = await prisma.equipmentRequest.findMany({
      include: {
        equipment: {
          include: { lab: { select: { name: true } } },
        },
        staff: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate: per teacher + per equipment
    const key = (staffId: string, equipmentId: string) => `${staffId}::${equipmentId}`;
    const map = new Map<string, {
      staffId: string;
      teacherName: string;
      teacherEmail: string;
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
      const k = key(req.staffId, req.equipmentId);
      if (!map.has(k)) {
        map.set(k, {
          staffId: req.staffId,
          teacherName: req.staff?.name ?? 'Unknown',
          teacherEmail: req.staff?.email ?? '',
          equipmentId: req.equipmentId,
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
      const entry = map.get(k)!;
      entry.totalRequests += 1;
      if (req.status === 'PENDING') entry.pending += 1;
      else if (req.status === 'APPROVED') entry.approved += 1;
      else if (req.status === 'REJECTED') entry.rejected += 1;
      else if (req.status === 'RETURNED') entry.returned += 1;
      if (req.createdAt.toISOString() > entry.lastRequestedAt) {
        entry.lastRequestedAt = req.createdAt.toISOString();
      }
    }

    const history = Array.from(map.values()).sort(
      (a, b) => b.totalRequests - a.totalRequests
    );

    return NextResponse.json({ history, totalRequests: requests.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
