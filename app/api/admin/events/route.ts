import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const events = await prisma.event.findMany({
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
    orderBy: { eventDate: 'desc' },
  });
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const event = await prisma.event.create({
    data: {
      title: body.title,
      category: body.category ?? 'Conference',
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      venue: body.venue ?? null,
      leadOrganizer: body.leadOrganizer ?? null,
      participants: body.participants ? Number(body.participants) : null,
      scope: body.scope ?? 'NATIONAL',
      arrangedOrParticipated: body.arrangedOrParticipated ?? 'Arranged',
      verificationStatus: 'VERIFIED',
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ event }, { status: 201 });
}
