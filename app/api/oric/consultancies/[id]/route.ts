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
  const consultancy = await prisma.consultancy.update({
    where: { id },
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
    },
    include: {
      staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
    },
  });
  return NextResponse.json({ consultancy });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await prisma.consultancy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
