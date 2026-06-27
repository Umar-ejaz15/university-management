import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { requireAdmin } from '@/lib/authorization';
import { prisma } from '@/lib/db';

export type MonitoringHealth = 'GREEN' | 'YELLOW' | 'RED';

export interface MonitoringProject {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  reportingFrequency: string | null;
  budgetAmount: string | null;
  currency: string | null;
  fundingAgency: string | null;
  staff: { id: string; name: string; designation: string | null; department: { name: string } | null };
  installments: { status: string; dueDate: string | null }[];
  reports: { dueDate: string | null; submissionDate: string | null; status: string }[];
  milestones: { status: string; targetDate: string; completedDate: string | null }[];
  _health: MonitoringHealth;
  _daysRemaining: number | null;
  _budgetReleased: number;
  _budgetTotal: number;
  _lastReportDate: string | null;
  _overdueInstallments: number;
  _milestoneProgress: number;
}

function computeHealth(project: {
  endDate: Date | null;
  reports: { dueDate: Date | null; submissionDate: Date | null }[];
  installments: { status: string; dueDate: Date | null }[];
}): MonitoringHealth {
  const now = new Date();
  const daysRemaining = project.endDate
    ? Math.ceil((project.endDate.getTime() - now.getTime()) / 86_400_000)
    : null;

  const overdueInstallments = project.installments.filter(
    i => i.status === 'PENDING' && i.dueDate && new Date(i.dueDate) < now
  ).length;

  const lastReport = project.reports
    .filter(r => r.submissionDate)
    .sort((a, b) => new Date(b.submissionDate!).getTime() - new Date(a.submissionDate!).getTime())[0];

  const daysSinceReport = lastReport?.submissionDate
    ? Math.floor((now.getTime() - new Date(lastReport.submissionDate).getTime()) / 86_400_000)
    : null;

  // RED conditions
  if (daysRemaining !== null && daysRemaining < 0) return 'RED';
  if (overdueInstallments >= 2) return 'RED';
  if (daysSinceReport !== null && daysSinceReport > 90) return 'RED';
  if (project.reports.length > 0 && daysSinceReport === null) return 'RED'; // reports exist but none submitted

  // YELLOW conditions
  if (daysRemaining !== null && daysRemaining <= 60) return 'YELLOW';
  if (overdueInstallments === 1) return 'YELLOW';
  if (daysSinceReport !== null && daysSinceReport > 45) return 'YELLOW';

  return 'GREEN';
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authResult = await requireAdmin(user);
  if (!authResult.authorized) return NextResponse.json({ error: authResult.reason }, { status: 403 });

  const projects = await prisma.project.findMany({
    where: { verificationStatus: 'VERIFIED', status: { in: ['ONGOING', 'SUBMITTED'] } },
    include: {
      staff: { select: { id: true, name: true, designation: true, department: { select: { name: true } } } },
      installments: { select: { status: true, dueDate: true, amount: true, releaseDate: true } },
      reports: { select: { dueDate: true, submissionDate: true, status: true } },
      milestones: { select: { status: true, targetDate: true, completedDate: true } },
    },
    orderBy: { endDate: 'asc' },
  });

  const now = new Date();

  const result: MonitoringProject[] = projects.map(p => {
    const health = computeHealth(p);
    const daysRemaining = p.endDate
      ? Math.ceil((p.endDate.getTime() - now.getTime()) / 86_400_000)
      : null;

    const budgetTotal = Number(p.budgetAmount ?? 0);
    const budgetReleased = p.installments
      .filter(i => i.status === 'RELEASED')
      .reduce((s, i) => s + Number(i.amount), 0);

    const lastReport = p.reports
      .filter(r => r.submissionDate)
      .sort((a, b) => new Date(b.submissionDate!).getTime() - new Date(a.submissionDate!).getTime())[0];

    const overdueInstallments = p.installments.filter(
      i => i.status === 'PENDING' && i.dueDate && new Date(i.dueDate) < now
    ).length;

    const completedMilestones = p.milestones.filter(m => m.status === 'COMPLETED').length;
    const milestoneProgress = p.milestones.length > 0
      ? Math.round((completedMilestones / p.milestones.length) * 100)
      : 0;

    return {
      id: p.id,
      title: p.title,
      status: p.status,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
      reportingFrequency: p.reportingFrequency,
      budgetAmount: p.budgetAmount?.toString() ?? null,
      currency: p.currency,
      fundingAgency: p.fundingAgency,
      staff: p.staff,
      installments: p.installments.map(i => ({
        status: i.status,
        dueDate: i.dueDate?.toISOString() ?? null,
      })),
      reports: p.reports.map(r => ({
        dueDate: r.dueDate?.toISOString() ?? null,
        submissionDate: r.submissionDate?.toISOString() ?? null,
        status: r.status,
      })),
      milestones: p.milestones.map(m => ({
        status: m.status,
        targetDate: m.targetDate.toISOString(),
        completedDate: m.completedDate?.toISOString() ?? null,
      })),
      _health: health,
      _daysRemaining: daysRemaining,
      _budgetReleased: budgetReleased,
      _budgetTotal: budgetTotal,
      _lastReportDate: lastReport?.submissionDate?.toISOString() ?? null,
      _overdueInstallments: overdueInstallments,
      _milestoneProgress: milestoneProgress,
    };
  });

  const summary = {
    total: result.length,
    green: result.filter(p => p._health === 'GREEN').length,
    yellow: result.filter(p => p._health === 'YELLOW').length,
    red: result.filter(p => p._health === 'RED').length,
  };

  return NextResponse.json({ projects: result, summary });
}
