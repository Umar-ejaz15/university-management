import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status   = searchParams.get('status')   || 'all';
  const kind     = searchParams.get('kind')      || 'all';
  const scope    = searchParams.get('scope')     || 'all';
  const search   = searchParams.get('search')    || '';
  const dept     = searchParams.get('department')|| 'all';
  const dateFrom = searchParams.get('dateFrom')  || '';
  const dateTo   = searchParams.get('dateTo')    || '';

  const where: Prisma.ProjectWhereInput = {};

  if (status !== 'all') where.status = status as Prisma.EnumProjectStatusFilter;
  if (kind   !== 'all') where.projectKind = kind as Prisma.EnumProjectKindFilter;
  if (scope  !== 'all') where.scope = scope as Prisma.EnumProjectScopeFilter;

  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) where.startDate.gte = new Date(dateFrom);
    if (dateTo)   where.startDate.lte = new Date(dateTo + 'T23:59:59Z');
  }

  if (search) {
    where.OR = [
      { title:       { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { staff: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (dept !== 'all') {
    where.staff = { departmentId: dept };
  }

  const [projects, departments] = await Promise.all([
    prisma.project.findMany({
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
    }),
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return NextResponse.json({ projects, departments });
}
