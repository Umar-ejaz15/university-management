import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/departments
 * Get all departments with faculty info and staff counts
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const departments = await prisma.department.findMany({
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        _count: {
          select: {
            staff: true,
            programs: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

/**
 * POST /api/admin/departments
 * Create a new department
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const body = await request.json();
    const { name, head, establishedYear, totalStudents, description, facultyId } = body;

    if (!name || !head || !establishedYear || !facultyId) {
      return NextResponse.json(
        { error: 'Name, head, establishedYear, and facultyId are required' },
        { status: 400 }
      );
    }

    // Verify faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
    });

    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        head,
        establishedYear: parseInt(establishedYear),
        totalStudents: totalStudents ? parseInt(totalStudents) : 0,
        description: description || null,
        facultyId,
      },
      include: {
        faculty: {
          select: {
            name: true,
          },
        },
      },
    });

    await createAuditLog({
      action: 'CREATE_DEPARTMENT',
      performedBy: user.userId,
      targetType: 'DEPARTMENT',
      targetId: department.id,
      metadata: {
        departmentName: name,
        facultyName: faculty.name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Department created successfully', department }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating department:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A department with this name already exists in this faculty' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
