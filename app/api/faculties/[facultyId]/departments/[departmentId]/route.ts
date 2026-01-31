import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    facultyId: string;
    departmentId: string;
  }>;
}

/**
 * GET /api/faculties/[facultyId]/departments/[departmentId]
 * Get a specific department with its staff and statistics
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { facultyId, departmentId } = await params;

    // Fetch department with faculty and staff
    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
        facultyId: facultyId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            shortName: true,
            dean: true,
          },
        },
        staff: {
          where: {
            status: 'APPROVED',
          },
          include: {
            _count: {
              select: {
                publications: true,
                projects: true,
                courses: true,
              },
            },
          },
        },
        programs: {
          select: {
            id: true,
            name: true,
          },
        },
        researchAreas: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            staff: true,
            programs: true,
            researchAreas: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Transform staff data
    const staffWithStats = department.staff.map((staff) => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      designation: staff.designation,
      bio: staff.bio,
      experienceYears: staff.experienceYears,
      profileImage: staff.profileImage,
      qualifications: staff.qualifications,
      specialization: staff.specialization,
      studentsSupervised: staff.studentsSupervised,
      totalPublications: staff._count.publications,
      totalProjects: staff._count.projects,
      totalCourses: staff._count.courses,
    }));

    // Calculate totals
    const totalPublications = staffWithStats.reduce(
      (sum, staff) => sum + staff.totalPublications,
      0
    );
    const totalProjects = staffWithStats.reduce(
      (sum, staff) => sum + staff.totalProjects,
      0
    );

    const departmentData = {
      id: department.id,
      name: department.name,
      head: department.head,
      establishedYear: department.establishedYear,
      totalStudents: department.totalStudents,
      description: department.description,
      faculty: department.faculty,
      staff: staffWithStats,
      programs: department.programs,
      researchAreas: department.researchAreas,
      totalStaff: department._count.staff,
      totalPrograms: department._count.programs,
      totalResearchAreas: department._count.researchAreas,
      totalPublications,
      totalProjects,
    };

    return NextResponse.json({ department: departmentData });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}
