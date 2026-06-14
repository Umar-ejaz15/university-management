export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import MousClient from './MousClient';

function fmtDate(d: Date | null | undefined) {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function MousPage() {
  const mous = await prisma.mou.findMany({
    orderBy: { establishmentDate: 'desc' },
    select: {
      id: true, partyName: true, partyType: true, linkageType: true,
      country: true, scope: true, status: true, duration: true,
      establishmentDate: true, focalPersonMnsuam: true, focalPersonOther: true,
      scopeOfCollaboration: true, activities: true,
      staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
    },
  });

  const ser = mous.map(m => ({ ...m, establishmentDate: fmtDate(m.establishmentDate) }));

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Header />
      <MousClient mous={ser} />
    </div>
  );
}
