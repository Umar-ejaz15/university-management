export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import ConsultanciesClient from './ConsultanciesClient';

function fmtDate(d: Date | null | undefined) {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtPKR(n: number) {
  if (n >= 1_000_000_000) return `PKR ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(2)}M`;
  return `PKR ${n.toLocaleString()}`;
}

export default async function ConsultanciesPage() {
  const consultancies = await prisma.consultancy.findMany({
    orderBy: { startDate: 'desc' },
    select: {
      id: true, title: true, clientName: true, clientCountry: true, serviceType: true,
      contractValue: true, oricOverheadAmount: true, status: true,
      startDate: true, endDate: true, executionDate: true, deliverables: true, remarks: true,
      staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
    },
  });

  const ser = consultancies.map(c => ({
    ...c,
    contractValue: c.contractValue ? fmtPKR(Number(c.contractValue)) : undefined,
    oricOverheadAmount: c.oricOverheadAmount ? fmtPKR(Number(c.oricOverheadAmount)) : undefined,
    contractValueRaw: Number(c.contractValue ?? 0),
    startDate: fmtDate(c.startDate),
    endDate: fmtDate(c.endDate),
    executionDate: fmtDate(c.executionDate),
  }));

  const totalValue = consultancies.reduce((s, c) => s + Number(c.contractValue ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Header />
      <ConsultanciesClient consultancies={ser} totalValue={fmtPKR(totalValue)} />
    </div>
  );
}
