import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ORIC') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  const sections  = (searchParams.get('sections') ?? '').split(',').filter(Boolean);
  const fromDate  = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
  const toDate    = searchParams.get('to')   ? new Date(searchParams.get('to')!)   : undefined;
  const deptId    = searchParams.get('deptId') ?? undefined;
  const staffId   = searchParams.get('staffId') ?? undefined;
  const status    = searchParams.get('status') ?? undefined;   // project status
  const scope     = searchParams.get('scope') ?? undefined;
  const funderType = searchParams.get('funderType') ?? undefined;

  const dateRange = fromDate || toDate
    ? { gte: fromDate, lte: toDate }
    : undefined;

  const all = sections.length === 0;
  const want = (s: string) => all || sections.includes(s);

  // Staff filter helper
  const staffWhere = staffId
    ? { staffId }
    : deptId
    ? { staff: { departmentId: deptId } }
    : undefined;

  const [
    projects,
    patents,
    disclosures,
    licensing,
    consultancies,
    mous,
    visits,
    events,
    policies,
    departments,
    staffList,
  ] = await Promise.all([
    want('projects') ? prisma.project.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(status ? { status: status as 'SUBMITTED' | 'ONGOING' | 'COMPLETED' } : {}),
        ...(scope ? { scope: scope as 'NATIONAL' | 'INTERNATIONAL' } : {}),
        ...(funderType ? { funderType } : {}),
        ...(staffId ? { staffId } : {}),
        ...(deptId ? { staff: { departmentId: deptId } } : {}),
      },
      include: {
        staff: { select: { name: true, designation: true, department: { select: { name: true } } } },
        coPIs: true,
        teamMembers: true,
        installments: true,
      },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve(null),

    want('patents') ? prisma.patent.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
      orderBy: { filingDate: 'desc' },
    }) : Promise.resolve(null),

    want('disclosures') ? prisma.iPDisclosure.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve(null),

    want('licensing') ? prisma.iPLicensing.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve(null),

    want('consultancies') ? prisma.consultancy.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(status ? { status } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, designation: true, department: { select: { name: true } } } } },
      orderBy: { startDate: 'desc' },
    }) : Promise.resolve(null),

    want('mous') ? prisma.mou.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(scope ? { scope: scope as 'NATIONAL' | 'INTERNATIONAL' } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { establishmentDate: 'desc' },
    }) : Promise.resolve(null),

    want('visits') ? prisma.industrialVisit.findMany({
      where: {
        ...(dateRange ? { visitDate: dateRange } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { visitDate: 'desc' },
    }) : Promise.resolve(null),

    want('events') ? prisma.event.findMany({
      where: {
        ...(dateRange ? { eventDate: dateRange } : {}),
        ...(scope ? { scope: scope as 'NATIONAL' | 'INTERNATIONAL' } : {}),
      },
      include: { staff: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { eventDate: 'desc' },
    }) : Promise.resolve(null),

    want('policy') ? prisma.policyAdvocacy.findMany({
      where: {
        ...(dateRange ? { createdAt: dateRange } : {}),
        ...(staffWhere ?? {}),
      },
      include: { staff: { select: { name: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve(null),

    // Always return departments for filter UI
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),

    // Always return staff list for filter UI
    prisma.staff.findMany({
      where: deptId ? { departmentId: deptId } : undefined,
      select: { id: true, name: true, designation: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Aggregated stats for this filtered set
  const projectList = projects ?? [];
  const totalBudget = projectList.reduce((s, p) => s + Number(p.budgetAmount ?? 0), 0);
  const totalOverhead = projectList.reduce((s, p) => s + Number(p.oricOverheadAmount ?? 0), 0);
  const consultancyList = consultancies ?? [];
  const totalConsultancyValue = consultancyList.reduce((s, c) => s + Number(c.contractValue ?? 0), 0);
  const totalConsultancyOverhead = consultancyList.reduce((s, c) => s + Number(c.oricOverheadAmount ?? 0), 0);

  return NextResponse.json({
    meta: {
      generatedAt: new Date().toISOString(),
      filters: { sections: sections.length ? sections : ['all'], fromDate, toDate, deptId, staffId, status, scope, funderType },
    },
    aggregates: {
      totalBudget,
      totalOverhead,
      totalConsultancyValue,
      totalConsultancyOverhead,
      projectCount: projectList.length,
      patentCount: (patents ?? []).length,
      disclosureCount: (disclosures ?? []).length,
      licensingCount: (licensing ?? []).length,
      consultancyCount: consultancyList.length,
      mouCount: (mous ?? []).length,
      visitCount: (visits ?? []).length,
      eventCount: (events ?? []).length,
      policyCount: (policies ?? []).length,
    },
    data: {
      projects,
      patents,
      disclosures,
      licensing,
      consultancies,
      mous,
      visits,
      events,
      policies,
    },
    lookups: { departments, staff: staffList },
  });
}
