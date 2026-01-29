import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/staff/all
 * Get all approved staff members with their counts
 * Public endpoint
 */
export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        specialization: true,
        experienceYears: true,
        department: {
          select: {
            name: true,
            faculty: {
              select: {
                name: true,
                shortName: true,
              },
            },
          },
        },
        _count: {
          select: {
            publications: true,
            projects: true,
            courses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      staff,
      total: staff.length,
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}
