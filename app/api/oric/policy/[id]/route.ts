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
  const policy = await prisma.policyAdvocacy.update({
    where: { id },
    data: {
      govtBody: body.govtBody,
      areaAdvocated: body.areaAdvocated || null,
      brief: body.brief || null,
      coalitionPartners: body.coalitionPartners || null,
      advocacyTools: body.advocacyTools || null,
      annexRef: body.annexRef || null,
      staffId: body.staffId,
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ policy });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.policyAdvocacy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
