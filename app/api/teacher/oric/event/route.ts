import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { staffId: true } });
  if (!dbUser?.staffId) return NextResponse.json({ error: 'No staff profile' }, { status: 404 });

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const event = await prisma.event.create({
    data: {
      title: body.title.trim(),
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
      staffId: dbUser.staffId,
      verificationStatus: 'PENDING',
    },
  });
  return NextResponse.json({ event }, { status: 201 });
}
