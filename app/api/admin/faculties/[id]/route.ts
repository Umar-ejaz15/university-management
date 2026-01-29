import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * PUT /api/admin/faculties/[id]
 * Update a faculty
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
    const { name, shortName, dean, establishedYear, description } = body;

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        name,
        shortName,
        dean,
        establishedYear: parseInt(establishedYear),
        description: description || null,
      },
    });

    await createAuditLog({
      action: 'UPDATE_FACULTY',
      performedBy: user.userId,
      targetType: 'FACULTY',
      targetId: faculty.id,
      metadata: { facultyName: name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Faculty updated successfully', faculty });
  } catch (error: any) {
    console.error('Error updating faculty:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/faculties/[id]
 * Delete a faculty
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

    const faculty = await prisma.faculty.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    await prisma.faculty.delete({
      where: { id },
    });

    await createAuditLog({
      action: 'DELETE_FACULTY',
      performedBy: user.userId,
      targetType: 'FACULTY',
      targetId: id,
      metadata: { facultyName: faculty.name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Faculty deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting faculty:', error);

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete faculty with existing departments' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 });
  }
}
