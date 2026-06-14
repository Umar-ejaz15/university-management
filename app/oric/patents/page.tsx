export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import PatentsClient from './PatentsClient';

function fmtDate(d: Date | null | undefined) {
  if (!d) return undefined;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function PatentsPage() {
  const [patents, disclosures, licensing] = await Promise.all([
    prisma.patent.findMany({
      orderBy: { filingDate: 'desc' },
      select: {
        id: true, title: true, patentStatus: true, ipCategory: true,
        leadInventor: true, filedWith: true, filingDate: true, applicationNumber: true,
        ipoStatus: true, ipoExaminer: true,
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
    }),
    prisma.iPDisclosure.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, ipCategory: true, developmentStatus: true,
        leadInventor: true, scope: true, commercialPartner: true, financialSupport: true, createdAt: true,
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
    }),
    prisma.iPLicensing.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, ipCategory: true, negotiationStatus: true,
        licenseeName: true, fieldOfUse: true, agreementDuration: true, scope: true, createdAt: true,
        leadInventor: true,
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
      },
    }),
  ]);

  // Serialize dates
  const patentsSer = patents.map(p => ({ ...p, filingDate: fmtDate(p.filingDate) }));
  const disclosuresSer = disclosures.map(d => ({ ...d, createdAt: fmtDate(d.createdAt) }));
  const licensingSer = licensing.map(l => ({ ...l, createdAt: fmtDate(l.createdAt) }));

  const granted = patents.filter(p => p.patentStatus === 'Granted').length;
  const signed  = licensing.filter(l => l.negotiationStatus === 'Agreement Signed').length;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Header />
      <Suspense>
        <PatentsClient
          patents={patentsSer}
          disclosures={disclosuresSer}
          licensing={licensingSer}
          stats={{ granted, signed }}
        />
      </Suspense>
    </div>
  );
}
