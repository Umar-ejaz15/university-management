import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
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
