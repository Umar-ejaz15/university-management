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

    const courses = await prisma.course.findMany({
      where: { staffId: dbUser.staffId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
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
    const { name, credits, students } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    }

    // Check for duplicate course name
    const existing = await prisma.course.findFirst({
      where: {
        name: name.trim(),
        staffId: dbUser.staffId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Course already exists' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        credits: credits || 3,
        students: students || 0,
        staffId: dbUser.staffId,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
