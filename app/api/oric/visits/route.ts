import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const visits = await prisma.industrialVisit.findMany({
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
    orderBy: { visitDate: 'desc' },
  });
  return NextResponse.json({ visits });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.visitorName) return NextResponse.json({ error: 'visitorName is required' }, { status: 400 });
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const visit = await prisma.industrialVisit.create({
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
      verificationStatus: 'VERIFIED',
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ visit }, { status: 201 });
}
