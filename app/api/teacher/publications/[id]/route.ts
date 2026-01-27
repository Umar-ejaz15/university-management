import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const publication = await prisma.publication.findUnique({
      where: { id },
    });

    if (!publication || publication.staffId !== dbUser.staffId) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    await prisma.publication.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Publication deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete publication error:', error);
    return NextResponse.json({ error: 'Failed to delete publication' }, { status: 500 });
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
    const body = await request.json();
    const { title, year, journal } = body;

    // Verify ownership
    const existing = await prisma.publication.findUnique({
      where: { id },
    });

    if (!existing || existing.staffId !== dbUser.staffId) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    const publication = await prisma.publication.update({
      where: { id },
      data: {
        title: title?.trim() ?? existing.title,
        year: year ?? existing.year,
        journal: journal?.trim() ?? existing.journal,
      },
    });

    return NextResponse.json({ publication }, { status: 200 });
  } catch (error) {
    console.error('Update publication error:', error);
    return NextResponse.json({ error: 'Failed to update publication' }, { status: 500 });
  }
}
