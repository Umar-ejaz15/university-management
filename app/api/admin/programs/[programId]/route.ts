import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/admin/programs/[programId]
 * Delete a program
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    await prisma.program.delete({
      where: { id: programId },
    });

    await createAuditLog({
      action: 'DELETE_PROGRAM',
      performedBy: user.userId,
      targetType: 'PROGRAM',
      targetId: programId,
      metadata: {
        programName: program.name,
        departmentName: program.department.name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/programs/[programId]
 * Update a program name
 * Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const authResult = await requireAdmin(user, request.url);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.reason }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Program name is required' },
        { status: 400 }
      );
    }

    const program = await prisma.program.update({
      where: { id: programId },
      data: { name: name.trim() },
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    await createAuditLog({
      action: 'UPDATE_PROGRAM',
      performedBy: user.userId,
      targetType: 'PROGRAM',
      targetId: programId,
      metadata: {
        programName: program.name,
        departmentName: program.department.name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'Program updated successfully', program });
  } catch (error: any) {
    console.error('Error updating program:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
  }
}
