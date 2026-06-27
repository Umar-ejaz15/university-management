import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireRole } from '@/lib/authorization';
import { prisma } from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

const PROJECT_INCLUDE = {
  staff: {
    select: {
      id: true, name: true, designation: true, email: true,
      department: { select: { name: true } },
    },
  },
  installments: { orderBy: { installmentNo: 'asc' as const } },
  reports: { orderBy: { dueDate: 'asc' as const } },
  milestones: { orderBy: { targetDate: 'asc' as const } },
  coPIs: { orderBy: { createdAt: 'asc' as const } },
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireRole(user, ['ADMIN', 'ORIC']);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, include: PROJECT_INCLUDE });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireRole(user, ['ADMIN', 'ORIC']);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      reportingFrequency: body.reportingFrequency,
      monitoringPlan: body.monitoringPlan,
      remarks: body.remarks,
    },
    include: PROJECT_INCLUDE,
  });
  return NextResponse.json({ project });
}
