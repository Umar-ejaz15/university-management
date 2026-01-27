import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
    if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

    const staff = await prisma.staff.findUnique({
      where: { id: dbUser.staffId },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        publications: {
          orderBy: { year: 'desc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
        courses: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return NextResponse.json({ staff }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
    if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

    const body = await request.json();
    const { designation, departmentId, specialization, experienceYears, qualifications, bio, profileImage, teachingLoad, studentsSupervised } = body;

    // If departmentId provided, verify it
    if (departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!dept) return NextResponse.json({ error: 'Invalid department' }, { status: 400 });
    }

    const updated = await prisma.staff.update({
      where: { id: dbUser.staffId },
      data: {
        designation: designation ?? undefined,
        departmentId: departmentId ?? undefined,
        specialization: specialization ?? undefined,
        experienceYears: experienceYears ?? undefined,
        qualifications: qualifications ?? undefined,
        bio: bio ?? undefined,
        profileImage: profileImage ?? undefined,
        teachingLoad: teachingLoad ?? undefined,
        studentsSupervised: studentsSupervised ?? undefined,
      },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
        publications: {
          orderBy: { year: 'desc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
        courses: {
          orderBy: { name: 'asc' },
        },
      },
    });

    return NextResponse.json({ message: 'Profile updated', staff: updated }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
