import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

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
    ]);

    return NextResponse.json({
      totalFaculty,
      pendingCount,
      rejectedCount,
      totalDepartments,
      totalPublications,
      totalProjects,
      recentActivityCount,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
