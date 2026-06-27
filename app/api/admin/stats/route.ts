import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';
import { logError } from '@/lib/logger';

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
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

    // Calculate date 7 days ago for recent activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalFaculty,
      pendingCount,
      rejectedCount,
      totalDepartments,
      totalPublications,
      totalProjects,
      recentActivityCount,
      pendingProjectCount,
      pendingClsCount,
      projectGroups,
    ] = await Promise.all([
      // Total approved faculty
      prisma.staff.count({
        where: { status: 'APPROVED' },
      }),

      // Pending faculty count
      prisma.staff.count({
        where: { status: 'PENDING' },
      }),

      // Rejected faculty count
      prisma.staff.count({
        where: { status: 'REJECTED' },
      }),

      // Total departments
      prisma.department.count(),

      // Total publications
      prisma.publication.count(),

      // Total projects
      prisma.project.count(),

      // Recent admin activity (last 7 days)
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Projects awaiting ORIC approval
      prisma.project.count({ where: { verificationStatus: 'PENDING' } }),

      // CLS equipment requests awaiting approval
      prisma.equipmentRequest.count({ where: { status: 'PENDING' } }),

      // Approved projects grouped by kind + status, with budget totals
      prisma.project.groupBy({
        by: ['projectKind', 'status'],
        where: { verificationStatus: 'VERIFIED' },
        _count: { id: true },
        _sum: { budgetAmount: true },
      }),
    ]);

    // Shape the project breakdown into Research/Industry × Ongoing/Completed
    const emptyKind = () => ({
      ongoing: 0,
      completed: 0,
      total: 0,
      budget: 0,
    });
    const breakdown = { RESEARCH: emptyKind(), INDUSTRY: emptyKind() };

    for (const g of projectGroups) {
      const kind = g.projectKind as 'RESEARCH' | 'INDUSTRY';
      const bucket = breakdown[kind];
      if (!bucket) continue;
      const count = g._count.id;
      bucket.total += count;
      if (g.status === 'ONGOING') bucket.ongoing += count;
      if (g.status === 'COMPLETED') bucket.completed += count;
      bucket.budget += Number(g._sum.budgetAmount ?? 0);
    }

    return NextResponse.json({
      totalFaculty,
      pendingCount,
      rejectedCount,
      totalDepartments,
      totalPublications,
      totalProjects,
      recentActivityCount,
      pendingProjectCount,
      pendingClsCount,
      projectBreakdown: breakdown,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    logError('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
