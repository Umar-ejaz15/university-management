import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is FACULTY and doesn't have staffId
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, staffId: true },
    });

    if (!dbUser || dbUser.role !== 'FACULTY' || dbUser.staffId) {
      return NextResponse.json(
        { error: 'Not eligible for onboarding' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { designation, departmentId, specialization, experienceYears, qualifications } = body;

    // Validate required fields
    if (!designation || !departmentId) {
      return NextResponse.json(
        { error: 'Designation and department are required' },
        { status: 400 }
      );
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Invalid department selected' },
        { status: 400 }
      );
    }

    // Create staff record (store onboarding fields)
    const staff = await prisma.staff.create({
      data: {
        name: user.name,
        email: user.email,
        designation,
        departmentId,
        specialization: specialization ?? null,
        experienceYears: experienceYears ?? null,
        qualifications: qualifications ?? null,
        status: 'PENDING', // Requires admin approval
        studentsSupervised: 0,
      },
    });

    // Update user with staffId
    await prisma.user.update({
      where: { id: user.userId },
      data: { staffId: staff.id },
    });

    return NextResponse.json(
      {
        message: 'Onboarding completed successfully',
        staff: {
          id: staff.id,
          name: staff.name,
          designation: staff.designation,
          department: department.name,
          specialization: staff.specialization,
          experienceYears: staff.experienceYears,
          qualifications: staff.qualifications,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'An error occurred during onboarding' },
      { status: 500 }
    );
  }
}