import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const policies = await prisma.policyAdvocacy.findMany({
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ policies });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.govtBody) return NextResponse.json({ error: 'govtBody is required' }, { status: 400 });
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const policy = await prisma.policyAdvocacy.create({
    data: {
      govtBody: body.govtBody,
      areaAdvocated: body.areaAdvocated || null,
      brief: body.brief || null,
      coalitionPartners: body.coalitionPartners || null,
      advocacyTools: body.advocacyTools || null,
      annexRef: body.annexRef || null,
      staffId: body.staffId,
      verificationStatus: 'VERIFIED',
    },
    include: {
      staff: { select: { name: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ policy }, { status: 201 });
}
