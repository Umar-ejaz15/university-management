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
  const mou = await prisma.mou.update({
    where: { id },
    data: {
      partyName: body.partyName,
      linkageType: body.linkageType || null,
      partyType: body.partyType || null,
      establishmentDate: body.establishmentDate ? new Date(body.establishmentDate) : null,
      scope: body.scope || 'NATIONAL',
      country: body.country || null,
      duration: body.duration || null,
      status: body.status || null,
      focalPersonMnsuam: body.focalPersonMnsuam || null,
      focalPersonOther: body.focalPersonOther || null,
      scopeOfCollaboration: body.scopeOfCollaboration || null,
      activities: body.activities || null,
      futureInitiatives: body.futureInitiatives || null,
      annexRef: body.annexRef || null,
      documentUrl: body.documentUrl || null,
      staffId: body.staffId,
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ mou });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.mou.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
