import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const consultancies = await prisma.consultancy.findMany({
    include: {
      staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
    },
    orderBy: { startDate: 'desc' },
  });
  return NextResponse.json({ consultancies });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
  if (!body.staffId) return NextResponse.json({ error: 'Faculty (staffId) is required' }, { status: 400 });
  const consultancy = await prisma.consultancy.create({
    data: {
      title: body.title,
      clientName: body.clientName || null,
      clientCountry: body.clientCountry || null,
      clientAddress: body.clientAddress || null,
      executionDate: body.executionDate ? new Date(body.executionDate) : null,
      serviceType: body.serviceType || null,
      deliverables: body.deliverables || null,
      contractValue: body.contractValue ? parseFloat(body.contractValue) : null,
      oricOverheadPercent: body.oricOverheadPercent ? parseFloat(body.oricOverheadPercent) : null,
      oricOverheadAmount: body.oricOverheadAmount ? parseFloat(body.oricOverheadAmount) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || null,
      annexRef: body.annexRef || null,
      documentUrl: body.documentUrl || null,
      remarks: body.remarks || null,
      staffId: body.staffId,
      verificationStatus: 'VERIFIED',
    },
    include: {
      staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ consultancy }, { status: 201 });
}
