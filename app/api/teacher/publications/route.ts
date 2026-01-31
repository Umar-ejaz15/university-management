import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
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

    const publications = await prisma.publication.findMany({
      where: { staffId: dbUser.staffId },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json({ publications }, { status: 200 });
  } catch (error) {
    console.error('Get publications error:', error);
    return NextResponse.json({ error: 'Failed to fetch publications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, year, journal } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const publication = await prisma.publication.create({
      data: {
        title: title.trim(),
        year: year || new Date().getFullYear(),
        journal: journal?.trim() || null,
        staffId: dbUser.staffId,
        authors: body.authors?.trim() || 'Unknown',
      },
    });

    return NextResponse.json({ publication }, { status: 201 });
  } catch (error) {
    console.error('Create publication error:', error);
    return NextResponse.json({ error: 'Failed to create publication' }, { status: 500 });
  }
}
