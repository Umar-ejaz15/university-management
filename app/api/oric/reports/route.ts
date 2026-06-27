import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    totalProjects,
    ongoingProjects,
    completedProjects,
    totalPatents,
    grantedPatents,
    totalDisclosures,
    totalLicensing,
    totalConsultancies,
    consultancyAgg,
    totalMous,
    activeMous,
    totalVisits,
    totalEvents,
    totalPolicy,
    projectBudgetAgg,
  ] = await Promise.all([
    prisma.project.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.project.count({ where: { verificationStatus: 'VERIFIED', status: 'ONGOING' } }),
    prisma.project.count({ where: { verificationStatus: 'VERIFIED', status: 'COMPLETED' } }),
    prisma.patent.count(),
    prisma.patent.count({ where: { patentStatus: 'Granted' } }),
    prisma.iPDisclosure.count(),
    prisma.iPLicensing.count(),
    prisma.consultancy.count(),
    prisma.consultancy.aggregate({ _sum: { contractValue: true } }),
    prisma.mou.count(),
    prisma.mou.count({ where: { status: 'Active' } }),
    prisma.industrialVisit.count(),
    prisma.event.count(),
    prisma.policyAdvocacy.count(),
    prisma.project.aggregate({ where: { verificationStatus: 'VERIFIED' }, _sum: { budgetAmount: true } }),
  ]);

  // HEC Scorecard KPIs (simplified scoring)
  const researchOutput = Math.min(25, Math.round((ongoingProjects + completedProjects) * 1.5));
  const innovationIp   = Math.min(20, Math.round((totalPatents * 3) + (totalDisclosures * 1.5) + (totalLicensing * 2)));
  const industryLink   = Math.min(20, Math.round((activeMous * 1) + (totalVisits * 0.5) + (totalConsultancies * 1)));
  const hrDevelopment  = Math.min(15, Math.round(totalEvents * 0.5));
  const fundingGrants  = Math.min(10, Math.round(((projectBudgetAgg._sum.budgetAmount?.toNumber() ?? 0) / 1_000_000) * 0.1));
  const total = researchOutput + innovationIp + industryLink + hrDevelopment + fundingGrants;

  return NextResponse.json({
    kpi: {
      researchOutput:  { score: researchOutput,  max: 25, label: 'Research Output' },
      innovationIp:    { score: innovationIp,    max: 20, label: 'Innovation & IP' },
      industryLink:    { score: industryLink,    max: 20, label: 'Industry Linkages' },
      hrDevelopment:   { score: hrDevelopment,   max: 15, label: 'HR Development' },
      fundingGrants:   { score: fundingGrants,   max: 10, label: 'Funding & Grants' },
      total:           { score: total,           max: 90 },
    },
    summary: {
      totalProjects,
      ongoingProjects,
      completedProjects,
      totalPatents,
      grantedPatents,
      totalDisclosures,
      totalLicensing,
      totalConsultancies,
      totalConsultancyValue: consultancyAgg._sum.contractValue?.toNumber() ?? 0,
      totalMous,
      activeMous,
      totalVisits,
      totalEvents,
      totalPolicy,
      totalBudget: projectBudgetAgg._sum.budgetAmount?.toNumber() ?? 0,
    },
  });
}
