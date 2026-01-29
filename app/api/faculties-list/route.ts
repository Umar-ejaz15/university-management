import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/faculties-list
 * Get all faculties with their departments
 * Public endpoint
 */
export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
        dean: true,
        establishedYear: true,
        description: true,
        departments: {
          select: {
            id: true,
            name: true,
            head: true,
            establishedYear: true,
            totalStudents: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      faculties,
      total: faculties.length,
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculties' },
      { status: 500 }
    );
  }
}
