import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const visit = await prisma.industrialVisit.update({
    where: { id },
    data: {
      visitorName: body.visitorName,
      visitorOrg: body.visitorOrg || null,
      visitDate: body.visitDate ? new Date(body.visitDate) : null,
      agenda: body.agenda || null,
      departmentVisited: body.departmentVisited || null,
      visitType: body.visitType || null,
      outcome: body.outcome || null,
      proofUrl: body.proofUrl || null,
      staffId: body.staffId,
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ visit });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.industrialVisit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
