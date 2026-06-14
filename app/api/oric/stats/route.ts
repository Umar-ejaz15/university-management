import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ORIC' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [
      pendingProjects,
      approvedProjects,
      ongoingProjects,
      completedProjects,
      totalPatents,
      totalConsultancies,
      totalMous,
      totalEvents,
      totalVisits,
      totalDisclosures,
    ] = await Promise.all([
      prisma.project.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.project.count({ where: { verificationStatus: 'VERIFIED', status: 'SUBMITTED' } }),
      prisma.project.count({ where: { verificationStatus: 'VERIFIED', status: 'ONGOING' } }),
      prisma.project.count({ where: { verificationStatus: 'VERIFIED', status: 'COMPLETED' } }),
      prisma.patent.count(),
      prisma.consultancy.count(),
      prisma.mou.count(),
      prisma.event.count(),
      prisma.industrialVisit.count(),
      prisma.iPDisclosure.count(),
    ]);

    const budgetAgg = await prisma.project.aggregate({
      where: { verificationStatus: 'VERIFIED', budgetAmount: { not: null } },
      _sum: { budgetAmount: true },
    });

    const consultancyAgg = await prisma.consultancy.aggregate({
      _sum: { contractValue: true },
    });

    return NextResponse.json({
      pendingProjects,
      approvedProjects,
      ongoingProjects,
      completedProjects,
      totalPatents,
      totalConsultancies,
      totalMous,
      totalEvents,
      totalVisits,
      totalDisclosures,
      totalProjectBudget: Number(budgetAgg._sum.budgetAmount ?? 0),
      totalConsultancyValue: Number(consultancyAgg._sum.contractValue ?? 0),
    });
  } catch (error) {
    console.error('ORIC stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
