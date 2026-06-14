import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [patents, disclosures, licensing] = await Promise.all([
    prisma.patent.findMany({
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
      orderBy: { filingDate: 'desc' },
    }),
    prisma.iPDisclosure.findMany({
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.iPLicensing.findMany({
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return NextResponse.json({ patents, disclosures, licensing });
}
