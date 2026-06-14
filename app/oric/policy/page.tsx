export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import PolicyClient from './PolicyClient';

function fmtDate(d: Date | null | undefined) {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function PolicyPage() {
  const policies = await prisma.policyAdvocacy.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, govtBody: true, areaAdvocated: true, coalitionPartners: true,
      brief: true, advocacyTools: true, createdAt: true,
      staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
    },
  });

  const ser = policies.map(p => ({ ...p, createdAt: fmtDate(p.createdAt) }));

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Header />
      <PolicyClient policies={ser} />
    </div>
  );
}
