import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/departments/[id]
 * Get a single department with programs
 * Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        programs: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ department });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/departments/[id]
 * Update a department
 * Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const body = await request.json();
    const { name, head, establishedYear, totalStudents, description, facultyId, programs } = body;

    // Verify faculty exists if facultyId is being changed
    if (facultyId) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
      });

      if (!faculty) {
        return NextResponse.json(
          { error: 'Faculty not found' },
          { status: 404 }
        );
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        head,
        establishedYear: parseInt(establishedYear),
        totalStudents: totalStudents !== undefined ? parseInt(totalStudents) : undefined,
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

    // Update programs if provided
    if (programs && Array.isArray(programs)) {
      // Delete existing programs
      await prisma.program.deleteMany({
        where: { departmentId: id },
      });

      // Create new programs
      if (programs.length > 0) {
        await prisma.program.createMany({
          data: programs.map((programName: string) => ({
            name: programName,
            departmentId: id,
          })),
          skipDuplicates: true,
        });
      }
    }

    await createAuditLog({
      action: 'UPDATE_DEPARTMENT',
      performedBy: user.userId,
      targetType: 'DEPARTMENT',
      targetId: department.id,
      metadata: {
        departmentName: name,
        facultyName: department.faculty.name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Department updated successfully', department });
  } catch (error: unknown) {
    console.error('Error updating department:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A department with this name already exists in this faculty' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/departments/[id]
 * Delete a department
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const department = await prisma.department.findUnique({
      where: { id },
      select: {
        name: true,
        faculty: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    await prisma.department.delete({
      where: { id },
    });

    await createAuditLog({
      action: 'DELETE_DEPARTMENT',
      performedBy: user.userId,
      targetType: 'DEPARTMENT',
      targetId: id,
      metadata: {
        departmentName: department.name,
        facultyName: department.faculty.name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting department:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete department with existing staff or programs' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
