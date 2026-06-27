import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const mous = await prisma.mou.findMany({
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
    orderBy: { establishmentDate: 'desc' },
  });
  return NextResponse.json({ mous });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.partyName) return NextResponse.json({ error: 'partyName is required' }, { status: 400 });
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const mou = await prisma.mou.create({
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
      verificationStatus: 'VERIFIED',
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ mou }, { status: 201 });
}
