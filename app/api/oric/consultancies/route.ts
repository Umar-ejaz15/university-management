import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
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
