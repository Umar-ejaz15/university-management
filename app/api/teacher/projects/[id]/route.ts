import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { parseBody, isParsed } from '@/lib/api';
import { UpdateProjectSchema } from '@/lib/schemas';
import { logError } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (!dbUser?.staffId) {
      return NextResponse.json({ error: 'No staff profile' }, { status: 404 });
    }

    const { id } = await params;

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.staffId !== dbUser.staffId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error) {
    logError('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });

    if (!dbUser?.staffId) {
      return NextResponse.json({ error: 'No staff profile' }, { status: 404 });
    }

    const { id } = await params;
    const body = await parseBody(request, UpdateProjectSchema);
    if (!isParsed(body)) return body;
    const data = body;

    // Verify ownership
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing || existing.staffId !== dbUser.staffId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        description: data.description !== undefined ? (data.description ?? null) : existing.description,
        objectives: data.objectives !== undefined ? (data.objectives ?? null) : existing.objectives,
        methodology: data.methodology !== undefined ? (data.methodology ?? null) : existing.methodology,
        outcomes: data.outcomes !== undefined ? (data.outcomes ?? null) : existing.outcomes,
        collaborators: data.collaborators !== undefined ? (data.collaborators ?? null) : existing.collaborators,
        projectUrl: data.projectUrl !== undefined ? (data.projectUrl ?? null) : existing.projectUrl,
        projectKind: data.projectKind ?? existing.projectKind,
        scope: data.scope ?? existing.scope,
        startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
        endDate: data.endDate ? new Date(data.endDate) : existing.endDate,
        studentCount: data.studentCount ?? existing.studentCount,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl ?? null) : existing.imageUrl,
        // Editing a project sends it back through ORIC review.
        // Budget/funding fields are intentionally NOT writable here (admin-only).
        status: 'SUBMITTED',
        verificationStatus: 'PENDING',
        rejectionReason: null,
      },
    });

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    logError('Update project error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
