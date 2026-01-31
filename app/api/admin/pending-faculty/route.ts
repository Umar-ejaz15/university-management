import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/pending-faculty
 * Get all pending faculty members awaiting approval
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

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get all pending faculty
    const [pendingFaculty, total] = await Promise.all([
      prisma.staff.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          department: {
            include: {
              faculty: {
                select: {
                  name: true,
                  shortName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc', // Oldest first (FIFO)
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.staff.count({
        where: {
          status: 'PENDING',
        },
      }),
    ]);

    return NextResponse.json({
      faculty: pendingFaculty.map((staff): {
        id: string;
        name: string;
        email: string;
        designation: string;
        department: {
          name: string;
          faculty: string;
        };
        specialization: string | null;
        experienceYears: string | null;
        qualifications: string | null;
        createdAt: Date;
      } => ({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        designation: staff.designation,
        department: {
          name: staff.department.name,
          faculty: staff.department.faculty.name,
        },
        specialization: staff.specialization,
        experienceYears: staff.experienceYears,
        qualifications: staff.qualifications,
        createdAt: staff.createdAt,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching pending faculty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending faculty' },
      { status: 500 }
    );
  }
}
