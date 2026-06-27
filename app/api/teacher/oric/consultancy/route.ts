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

  const consultancy = await prisma.consultancy.create({
    data: {
      title: body.title.trim(),
      clientName: body.clientName || null,
      clientCountry: body.clientCountry || null,
      clientAddress: body.clientAddress || null,
      executionDate: body.executionDate ? new Date(body.executionDate) : null,
      serviceType: body.serviceType || null,
      deliverables: body.deliverables || null,
      contractValue: body.contractValue ? parseFloat(body.contractValue) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || null,
      remarks: body.remarks || null,
      annexRef: body.annexRef || null,
      documentUrl: body.documentUrl || null,
      staffId: dbUser.staffId,
      verificationStatus: 'PENDING',
    },
  });
  return NextResponse.json({ consultancy }, { status: 201 });
}
