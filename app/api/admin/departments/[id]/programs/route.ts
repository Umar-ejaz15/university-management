import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin } from '@/lib/authorization';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/departments/[id]/programs
 * Add a program to a department
 * Admin only
 */
export async function POST(
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

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Program name is required' },
        { status: 400 }
      );
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if program already exists in this department
    const existingProgram = await prisma.program.findFirst({
      where: {
        name: name.trim(),
        departmentId: id,
      },
    });

    if (existingProgram) {
      return NextResponse.json(
        { error: 'This program already exists in this department' },
        { status: 409 }
      );
    }

    const program = await prisma.program.create({
      data: {
        name: name.trim(),
        departmentId: id,
      },
    });

    await createAuditLog({
      action: 'CREATE_PROGRAM',
      performedBy: user.userId,
      targetType: 'PROGRAM',
      targetId: program.id,
      metadata: {
        programName: program.name,
        departmentName: department.name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json(
      { message: 'Program added successfully', program },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/departments/[id]/programs/[programId]
 * Remove a program from a department (handled in separate endpoint)
 */
