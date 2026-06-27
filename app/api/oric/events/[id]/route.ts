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
  const event = await prisma.event.update({
    where: { id },
    data: {
      title: body.title,
      category: body.category || null,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      venue: body.venue || null,
      leadOrganizer: body.leadOrganizer || null,
      arrangedOrParticipated: body.arrangedOrParticipated || null,
      scope: body.scope || 'NATIONAL',
      participants: body.participants ? parseInt(body.participants) : null,
      subjectArea: body.subjectArea || null,
      outcome: body.outcome || null,
      collaborationDeveloped: body.collaborationDeveloped || null,
      sponsoringAgency: body.sponsoringAgency || null,
      grantValue: body.grantValue ? parseFloat(body.grantValue) : null,
      financialSupport: body.financialSupport || null,
      webLinks: body.webLinks || null,
      annexRef: body.annexRef || null,
      staffId: body.staffId || null,
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ event });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
