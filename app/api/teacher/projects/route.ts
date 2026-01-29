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

    const projects = await prisma.project.findMany({
      where: { staffId: dbUser.staffId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    const { title, description, status, startDate, endDate, studentCount } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'ONGOING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        studentCount: typeof studentCount === 'number' ? studentCount : 0,
        staffId: dbUser.staffId,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
