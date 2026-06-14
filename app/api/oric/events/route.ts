import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const events = await prisma.event.findMany({
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
    orderBy: { eventDate: 'desc' },
  });
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const { title, category, eventDate, venue, leadOrganizer, staffId, participants, scope, arrangedOrParticipated } = body;
  if (!title || !eventDate) {
    return NextResponse.json({ error: 'title and eventDate are required' }, { status: 400 });
  }
  const event = await prisma.event.create({
    data: {
      title,
      category: category ?? 'Conference',
      eventDate: new Date(eventDate),
      venue: venue ?? null,
      leadOrganizer: leadOrganizer ?? null,
      staffId: staffId ?? null,
      participants: participants ? Number(participants) : null,
      scope: scope ?? 'NATIONAL',
      arrangedOrParticipated: arrangedOrParticipated ?? 'Arranged',
    },
  });
  return NextResponse.json({ event }, { status: 201 });
}
