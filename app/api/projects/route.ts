import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || 'all';

  const where: Record<string, unknown> = { verificationStatus: 'VERIFIED' };

  if (status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { staff: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (department !== 'all') {
    where.staff = { ...(where.staff as object ?? {}), departmentId: department };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          designation: true,
          profileImage: true,
          department: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  });

  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ projects, departments });
}
