import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchTerm = query.toLowerCase();

    // Search faculties
    const faculties = await prisma.faculty.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { shortName: { contains: searchTerm, mode: 'insensitive' } },
          { dean: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        dean: true,
      },
      take: 10,
    });

    // Search departments
    const departments = await prisma.department.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { head: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        head: true,
        facultyId: true,
        faculty: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
      take: 10,
    });

    // Search staff/people
    const staff = await prisma.staff.findMany({
      where: {
        AND: [
          { status: 'APPROVED' },
          {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { designation: { contains: searchTerm, mode: 'insensitive' } },
              { specialization: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        department: {
          select: {
            name: true,
            faculty: {
              select: {
                shortName: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    // Format results
    const results = [
      ...faculties.map((faculty) => ({
        type: 'faculty' as const,
        id: faculty.id,
        name: faculty.name,
        subtitle: `Dean: ${faculty.dean}`,
        url: `/faculties/${faculty.id}`,
      })),
      ...departments.map((dept) => ({
        type: 'department' as const,
        id: dept.id,
        name: dept.name,
        subtitle: `${dept.faculty.shortName} • Head: ${dept.head}`,
        url: `/faculties/${dept.facultyId}/${dept.id}`,
        facultyId: dept.facultyId,
      })),
      ...staff.map((person) => ({
        type: 'person' as const,
        id: person.id,
        name: person.name,
        subtitle: `${person.designation} • ${person.department.name}`,
        url: `/faculty/${person.id}`,
      })),
    ];

    return NextResponse.json({
      results,
      count: results.length,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
