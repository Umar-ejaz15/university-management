import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/faculties-list
 * Get all faculties with their departments and statistics
 * Public endpoint - no authentication required
 */
export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          include: {
            _count: {
              select: {
                staff: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transform data to include calculated statistics
    const facultiesWithStats = faculties.map((faculty) => ({
      id: faculty.id,
      name: faculty.name,
      shortName: faculty.shortName,
      dean: faculty.dean,
      establishedYear: faculty.establishedYear,
      description: faculty.description,
      totalDepartments: faculty.departments.length,
      totalStudents: faculty.departments.reduce(
        (sum: number, dept) => sum + dept.totalStudents,
        0
      ),
      totalStaff: faculty.departments.reduce(
        (sum: number, dept) => sum + dept._count.staff,
        0
      ),
      departments: faculty.departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        head: dept.head,
        establishedYear: dept.establishedYear,
        totalStudents: dept.totalStudents,
        totalStaff: dept._count.staff,
        description: dept.description,
      })),
    }));

    return NextResponse.json({ faculties: facultiesWithStats });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
      { status: 500 }
    );
  }
}
