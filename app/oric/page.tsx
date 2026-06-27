export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  FlaskConical,
  Building2,
  Briefcase,
  Handshake,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  Users,
  FileText,
  Lightbulb,
  BarChart2,
  Mail,
  ExternalLink,
  Shield,
  FileSearch,
  Eye,
  MapPin,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

function fmtPKR(n: number) {
  if (n >= 1_000_000_000) return `PKR ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  return `PKR ${n.toLocaleString()}`;
}
function fmtDate(d: Date | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function shortDeptName(name: string) {
  return name.replace('Department of ', 'Dept. of ').replace('Institute of ', 'Inst. of ').slice(0, 32);
}

export default async function OricPublicPage() {
  // ── Fetch all live counts ──────────────────────────────────────────────────
  const [
    totalResearch, ongoingResearch, completedResearch,
    totalIndustry, totalProjects,
    totalPatents, grantedPatents,
    totalDisclosures, totalLicensing,
    totalConsultancies,
    totalMous, activeMous,
    totalEvents,
    totalVisits,
    totalPolicy,
  ] = await Promise.all([
    prisma.project.count({ where: { projectKind: 'RESEARCH', verificationStatus: 'VERIFIED' } }),
    prisma.project.count({ where: { projectKind: 'RESEARCH', verificationStatus: 'VERIFIED', status: 'ONGOING' } }),
    prisma.project.count({ where: { projectKind: 'RESEARCH', verificationStatus: 'VERIFIED', status: 'COMPLETED' } }),
    prisma.project.count({ where: { projectKind: 'INDUSTRY', verificationStatus: 'VERIFIED' } }),
    prisma.project.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.patent.count(),
    prisma.patent.count({ where: { patentStatus: 'Granted' } }),
    prisma.iPDisclosure.count(),
    prisma.iPLicensing.count(),
    prisma.consultancy.count(),
    prisma.mou.count(),
    prisma.mou.count({ where: { status: 'Active' } }),
    prisma.event.count(),
    prisma.industrialVisit.count(),
    prisma.policyAdvocacy.count(),
  ]);

  // ── Financial aggregations ─────────────────────────────────────────────────
  const [projectBudgetAgg, consultancyAgg] = await Promise.all([
    prisma.project.aggregate({
      where: { verificationStatus: 'VERIFIED', budgetAmount: { not: null } },
      _sum: { budgetAmount: true },
    }),
    prisma.consultancy.aggregate({ _sum: { contractValue: true } }),
  ]);
  const totalProjectBudget = Number(projectBudgetAgg._sum.budgetAmount ?? 0);
  const totalConsultancyValue = Number(consultancyAgg._sum.contractValue ?? 0);

  // ── Funding by department ──────────────────────────────────────────────────
  const fundingByDept = await prisma.project.findMany({
    where: { verificationStatus: 'VERIFIED', budgetAmount: { not: null } },
    select: { budgetAmount: true, staff: { select: { department: { select: { name: true } } } } },
  });
  const deptFundingMap: Record<string, number> = {};
  for (const p of fundingByDept) {
    const d = p.staff?.department?.name ?? 'Other';
    deptFundingMap[d] = (deptFundingMap[d] ?? 0) + Number(p.budgetAmount ?? 0);
  }
  const sortedDeptFunding = Object.entries(deptFundingMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxFunding = sortedDeptFunding[0]?.[1] ?? 1;
  const totalFunding = Object.values(deptFundingMap).reduce((a, b) => a + b, 0);

  // ── Funder breakdown ───────────────────────────────────────────────────────
  const funderGroups = await prisma.project.groupBy({
    by: ['funderType'],
    where: { verificationStatus: 'VERIFIED', funderType: { not: null } },
    _count: { id: true },
  });

  // ── Recent data previews ───────────────────────────────────────────────────
  const [recentProjects, recentPatents, recentMous, recentEvents, recentVisits, recentConsultancies] = await Promise.all([
    prisma.project.findMany({
      where: { verificationStatus: 'VERIFIED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, title: true, projectKind: true, status: true,
        budgetAmount: true, fundingAgency: true, thematicArea: true,
        staff: { select: { name: true, department: { select: { name: true } } } },
      },
    }),
    prisma.patent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, patentStatus: true, ipCategory: true, leadInventor: true, filedWith: true, filingDate: true },
    }),
    prisma.mou.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, partyName: true, partyType: true, scope: true, status: true, country: true, establishmentDate: true, linkageType: true },
    }),
    prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
      take: 5,
      select: { id: true, title: true, category: true, eventDate: true, venue: true, participants: true, scope: true, arrangedOrParticipated: true },
    }),
    prisma.industrialVisit.findMany({
      orderBy: { visitDate: 'desc' },
      take: 4,
      select: { id: true, visitorName: true, visitorOrg: true, visitDate: true, visitType: true, departmentVisited: true },
    }),
    prisma.consultancy.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, title: true, clientName: true, serviceType: true, contractValue: true, status: true, startDate: true },
    }),
  ]);

  const DEPT_BAR_COLORS = ['bg-[#2d6a4f]', 'bg-emerald-500', 'bg-[#c9a961]', 'bg-violet-500', 'bg-sky-500', 'bg-rose-400'];

  const patentStatusCls: Record<string, string> = {
    Granted: 'bg-emerald-100 text-emerald-700',
    'Under Examination': 'bg-amber-100 text-amber-700',
    Published: 'bg-blue-100 text-blue-700',
    Filed: 'bg-gray-100 text-gray-600',
    Rejected: 'bg-red-100 text-red-700',
  };
  const mouStatusCls: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Expired: 'bg-gray-100 text-gray-600',
    'Under Renewal': 'bg-amber-100 text-amber-700',
    Terminated: 'bg-red-100 text-red-700',
  };
  const projectStatusCls: Record<string, string> = {
    ONGOING: 'bg-emerald-100 text-emerald-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    SUBMITTED: 'bg-amber-100 text-amber-700',
  };
  const consultancyStatusCls: Record<string, string> = {
    Ongoing: 'bg-emerald-100 text-emerald-700',
    Completed: 'bg-gray-100 text-gray-600',
    Pending: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="relative bg-[#1a3d2b] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#c9a961]/10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute left-1/2 bottom-0 w-72 h-72 rounded-full bg-[#2d6a4f]/40 -translate-x-1/4 translate-y-1/2" />
        </div>
        <div className="relative px-6 sm:px-8 py-14 w-full">
          <div className="inline-flex items-center gap-2 bg-[#c9a961]/15 border border-[#c9a961]/30 rounded-full px-4 py-1.5 mb-6">
            <FlaskConical className="w-4 h-4 text-[#c9a961]" />
            <span className="text-[#c9a961] text-xs font-semibold tracking-wide uppercase">MNSUAM · ORIC · Public Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Office of Research, Innovation<br />
            <span className="text-[#c9a961]">&amp; Commercialization</span>
          </h1>
          <p className="text-green-200 text-base max-w-2xl leading-relaxed mb-8">
            Muhammad Nawaz Sharif University of Agriculture, Multan — consolidated public view of all
            research projects, patents, industry linkages and innovation outcomes for the reporting period 2024–25.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: FlaskConical, text: `${totalProjects} Verified Projects` },
              { icon: Award, text: `${totalPatents} Patents & IP` },
              { icon: Handshake, text: `${activeMous} Active MoUs` },
              { icon: Briefcase, text: `${totalConsultancies} Consultancies` },
              { icon: CalendarDays, text: `${totalEvents} Events` },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                <Icon className="w-4 h-4 text-[#c9a961]" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="px-6 sm:px-8 py-10 space-y-12">

        {/* ── Metrics Grid ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<BarChart2 className="w-4 h-4 text-[#c9a961]" />} title="Key Performance Metrics" sub="Live data across all ORIC portfolios" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[
              { icon: FlaskConical, label: 'Research Projects', value: totalResearch, sub: `${ongoingResearch} ongoing`, iconBg: 'bg-sky-100 text-sky-700', href: '/uni-dashboard/project' },
              { icon: Building2, label: 'Industry Projects', value: totalIndustry, sub: 'Industry-funded', iconBg: 'bg-[#2d6a4f]/10 text-[#2d6a4f]', href: '/uni-dashboard/project' },
              { icon: Award, label: 'Patents Filed', value: totalPatents, sub: `${grantedPatents} granted`, iconBg: 'bg-amber-100 text-amber-700', href: '/oric/patents' },
              { icon: FileSearch, label: 'IP Disclosures', value: totalDisclosures, sub: 'Submitted to ORIC', iconBg: 'bg-violet-100 text-violet-700', href: '/oric/ip-disclosures' },
              { icon: Shield, label: 'IP Licensing', value: totalLicensing, sub: 'Tech transfer deals', iconBg: 'bg-teal-100 text-teal-700', href: '/oric/ip-licensing' },
              { icon: Briefcase, label: 'Consultancies', value: totalConsultancies, sub: fmtPKR(totalConsultancyValue), iconBg: 'bg-orange-100 text-orange-700', href: '/oric/consultancies' },
              { icon: Handshake, label: 'Total MoUs', value: totalMous, sub: `${activeMous} active`, iconBg: 'bg-indigo-100 text-indigo-700', href: '/oric/mous' },
              { icon: CalendarDays, label: 'Events & Outreach', value: totalEvents, sub: 'Conferences, fairs', iconBg: 'bg-rose-100 text-rose-700', href: '/oric/events' },
              { icon: Globe, label: 'Industrial Visits', value: totalVisits, sub: 'Delegations received', iconBg: 'bg-cyan-100 text-cyan-700', href: '/oric/events' },
              { icon: FileText, label: 'Policy Advocacy', value: totalPolicy, sub: 'Govt. briefings', iconBg: 'bg-green-100 text-green-700', href: '/oric/policy' },
              { icon: TrendingUp, label: 'Research Funding', value: fmtPKR(totalProjectBudget), sub: 'Total mobilised', iconBg: 'bg-emerald-100 text-emerald-700', href: '/uni-dashboard/project' },
              { icon: Users, label: 'Completed Projects', value: completedResearch, sub: 'Successfully closed', iconBg: 'bg-gray-100 text-gray-600', href: '/uni-dashboard/project' },
            ].map(({ icon: Icon, label, value, sub, iconBg, href }) => (
              <Link key={label} href={href}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Projects preview ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<FlaskConical className="w-4 h-4 text-sky-600" />}
            title="Research & Industry Projects"
            sub={`${totalProjects} verified projects · ${fmtPKR(totalProjectBudget)} total funding`}
            viewAllHref="/uni-dashboard/project"
            viewAllLabel="View All Projects"
          />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentProjects.map((p, i) => (
                <div key={p.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                  <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate max-w-lg">{p.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${projectStatusCls[p.status] ?? 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-700">{p.projectKind}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      <span>PI: <span className="text-gray-700 font-medium">{p.staff?.name ?? '—'}</span></span>
                      {p.staff?.department?.name && <span>{shortDeptName(p.staff.department.name)}</span>}
                      {p.fundingAgency && <span>Funder: {p.fundingAgency}</span>}
                      {p.budgetAmount && <span className="font-semibold text-[#2d6a4f]">{fmtPKR(Number(p.budgetAmount))}</span>}
                      {p.thematicArea && <span>{p.thematicArea}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ViewAllFooter href="/uni-dashboard/project" label="View All Projects" count={totalProjects} />
          </div>
        </section>

        {/* ── Patents & IP preview ──────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Award className="w-4 h-4 text-amber-600" />}
            title="Patents &amp; Intellectual Property"
            sub={`${totalPatents} patents · ${totalDisclosures} disclosures · ${totalLicensing} licensing deals`}
            viewAllHref="/oric/patents"
            viewAllLabel="View Full IP Register"
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Patents mini */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-600" />Patents</span>
                <Link href="/oric/patents" className="text-[10px] font-semibold text-[#2d6a4f] hover:underline flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentPatents.map(p => (
                  <div key={p.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <span className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">{p.title}</span>
                      <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${patentStatusCls[p.patentStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>{p.patentStatus ?? '—'}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 space-y-0.5">
                      {p.leadInventor && <div>{p.leadInventor}</div>}
                      <div className="flex gap-2">{p.ipCategory && <span>{p.ipCategory}</span>}{p.filedWith && <span>· {p.filedWith}</span>}{p.filingDate && <span>· {fmtDate(p.filingDate)}</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IP Disclosures mini */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><FileSearch className="w-3.5 h-3.5 text-violet-600" />IP Disclosures</span>
                <Link href="/oric/ip-disclosures" className="text-[10px] font-semibold text-[#2d6a4f] hover:underline flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="px-5 py-4 text-center">
                <p className="text-4xl font-extrabold text-gray-900">{totalDisclosures}</p>
                <p className="text-xs text-gray-500 mt-1">Total IP disclosures filed</p>
                <Link href="/oric/ip-disclosures" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Browse Disclosures
                </Link>
              </div>
              <div className="px-5 pb-5">
                <div className="bg-violet-50 rounded-xl p-3 flex items-center justify-between">
                  <div><p className="text-xs font-semibold text-violet-800">IP Licensing Agreements</p><p className="text-2xl font-extrabold text-violet-900 mt-0.5">{totalLicensing}</p></div>
                  <Link href="/oric/ip-licensing" className="px-3 py-1.5 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-colors">View</Link>
                </div>
              </div>
            </div>

            {/* IP stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <p className="text-xs font-bold text-gray-700">IP Portfolio Breakdown</p>
              {[
                { label: 'Patents Filed', value: totalPatents, color: 'bg-amber-400', pct: totalPatents },
                { label: 'Granted', value: grantedPatents, color: 'bg-emerald-500', pct: grantedPatents },
                { label: 'IP Disclosures', value: totalDisclosures, color: 'bg-violet-500', pct: totalDisclosures },
                { label: 'Licensing Deals', value: totalLicensing, color: 'bg-sky-500', pct: totalLicensing },
              ].map(row => {
                const maxVal = Math.max(totalPatents, totalDisclosures, totalLicensing, 1);
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{row.label}</span>
                      <span className="font-bold text-gray-900">{row.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.round((row.pct / maxVal) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── MoUs preview ──────────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Handshake className="w-4 h-4 text-indigo-600" />}
            title="MoUs &amp; Collaboration Linkages"
            sub={`${totalMous} total agreements · ${activeMous} active`}
            viewAllHref="/oric/mous"
            viewAllLabel="View All MoUs"
          />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentMous.map((m, i) => (
                <div key={m.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                  <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{m.partyName}</span>
                      {m.status && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mouStatusCls[m.status] ?? 'bg-gray-100 text-gray-600'}`}>{m.status}</span>}
                      {m.partyType && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">{m.partyType}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      {m.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.country}</span>}
                      <span>Scope: {m.scope}</span>
                      {m.linkageType && <span>{m.linkageType}</span>}
                      {m.establishmentDate && <span>Est. {fmtDate(m.establishmentDate)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ViewAllFooter href="/oric/mous" label="View All MoUs" count={totalMous} />
          </div>
        </section>

        {/* ── Events + Visits side by side ──────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<CalendarDays className="w-4 h-4 text-rose-600" />}
            title="Events, Outreach &amp; Industrial Visits"
            sub={`${totalEvents} events · ${totalVisits} industrial visits`}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-rose-600" /> Recent Events
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">{totalEvents}</span>
                </h3>
                <Link href="/oric/events" className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentEvents.map(ev => (
                  <div key={ev.id} className="px-6 py-3 hover:bg-gray-50/60 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">{ev.title}</span>
                      {ev.category && <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold">{ev.category}</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-3">
                      {ev.eventDate && <span>{fmtDate(ev.eventDate)}</span>}
                      {ev.venue && <span>{ev.venue}</span>}
                      {ev.participants != null && <span>{ev.participants} participants</span>}
                      {ev.arrangedOrParticipated && <span>{ev.arrangedOrParticipated}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Industrial Visits */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-600" /> Industrial Visits
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-bold">{totalVisits}</span>
                </h3>
                <Link href="/oric/events" className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentVisits.map(v => (
                  <div key={v.id} className="px-6 py-3 hover:bg-gray-50/60 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">{v.visitorName}</span>
                      {v.visitType && <span className="px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-semibold">{v.visitType}</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-3">
                      {v.visitorOrg && <span>{v.visitorOrg}</span>}
                      {v.visitDate && <span>{fmtDate(v.visitDate)}</span>}
                      {v.departmentVisited && <span>{v.departmentVisited}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Consultancies preview ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Briefcase className="w-4 h-4 text-orange-600" />}
            title="Faculty Consultancies"
            sub={`${totalConsultancies} agreements · ${fmtPKR(totalConsultancyValue)} total contract value`}
            viewAllHref="/oric/consultancies"
            viewAllLabel="View All Consultancies"
          />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentConsultancies.map((c, i) => (
                <div key={c.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                  <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{c.title}</span>
                      {c.status && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${consultancyStatusCls[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      {c.clientName && <span>Client: <span className="text-gray-700 font-medium">{c.clientName}</span></span>}
                      {c.serviceType && <span>{c.serviceType}</span>}
                      {c.contractValue && <span className="font-semibold text-[#2d6a4f]">{fmtPKR(Number(c.contractValue))}</span>}
                      {c.startDate && <span>{fmtDate(c.startDate)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ViewAllFooter href="/oric/consultancies" label="View All Consultancies" count={totalConsultancies} />
          </div>
        </section>

        {/* ── Policy Advocacy ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<FileText className="w-4 h-4 text-green-600" />}
            title="Policy Advocacy"
            sub={`${totalPolicy} government briefings & advocacy activities`}
            viewAllHref="/oric/policy"
            viewAllLabel="View All Policy Records"
          />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-center px-6 py-4 bg-green-50 rounded-2xl shrink-0">
              <p className="text-5xl font-extrabold text-green-700">{totalPolicy}</p>
              <p className="text-xs font-semibold text-green-600 mt-1">Policy Advocacy Records</p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                MNSUAM faculty actively engages government bodies and ministries with evidence-based policy proposals spanning Agriculture, Food Security, Environment, and Economic Development. Advocacy activities include parliamentary briefings, ministerial working group participation, and joint policy papers.
              </p>
              <Link href="/oric/policy"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white text-sm font-semibold rounded-xl hover:bg-[#142d20] transition-colors">
                <Eye className="w-4 h-4" /> Browse All Policy Records <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Funding Analytics ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<BarChart2 className="w-4 h-4 text-[#2d6a4f]" />} title="Funding Analytics" sub="Research funding distribution across departments and funder types" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Dept chart */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-gray-900">Funding by Department</h3>
                <span className="text-xs text-[#c9a961] font-semibold">{fmtPKR(totalFunding)} total</span>
              </div>
              {sortedDeptFunding.length === 0
                ? <p className="text-sm text-gray-400 py-8 text-center">No funding data available.</p>
                : (
                  <div className="space-y-3.5">
                    {sortedDeptFunding.map(([dept, amount], i) => (
                      <div key={dept}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-700 font-medium truncate max-w-[65%]">{shortDeptName(dept)}</span>
                          <span className="text-gray-500 font-semibold shrink-0 ml-2">{fmtPKR(amount)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${DEPT_BAR_COLORS[i % DEPT_BAR_COLORS.length]}`} style={{ width: `${Math.round((amount / maxFunding) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Funder types */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5">
                <Award className="w-4 h-4 text-[#c9a961]" /> Funder Type Breakdown
              </h3>
              <div className="space-y-2">
                {funderGroups.sort((a, b) => b._count.id - a._count.id).map((f, i) => (
                  <div key={f.funderType ?? 'Other'} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="w-6 h-6 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-700 font-medium">{f.funderType ?? 'Other'}</span>
                    <span className="shrink-0 text-xs font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 px-2.5 py-1 rounded-full">{f._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Links ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-1 h-6 bg-[#2d6a4f] rounded-full block" />
            <h2 className="text-lg font-bold text-gray-900">Quick Access</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: FlaskConical, label: 'All Projects', href: '/uni-dashboard/project', color: 'text-sky-600', bg: 'bg-sky-50' },
              { icon: Award, label: 'Patents', href: '/oric/patents', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: Handshake, label: 'MoUs', href: '/oric/mous', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { icon: Briefcase, label: 'Consultancies', href: '/oric/consultancies', color: 'text-orange-600', bg: 'bg-orange-50' },
              { icon: CalendarDays, label: 'Events', href: '/oric/events', color: 'text-rose-600', bg: 'bg-rose-50' },
              { icon: Globe, label: 'Visits', href: '/oric/events', color: 'text-cyan-600', bg: 'bg-cyan-50' },
              { icon: FileSearch, label: 'IP Disclosures', href: '/oric/ip-disclosures', color: 'text-violet-600', bg: 'bg-violet-50' },
              { icon: Shield, label: 'IP Licensing', href: '/oric/ip-licensing', color: 'text-teal-600', bg: 'bg-teal-50' },
              { icon: FileText, label: 'Policy', href: '/oric/policy', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: BookOpen, label: 'Publications', href: '/uni-dashboard', color: 'text-[#2d6a4f]', bg: 'bg-[#2d6a4f]/10' },
              { icon: Users, label: 'Faculty', href: '/staff', color: 'text-gray-700', bg: 'bg-gray-100' },
              { icon: Mail, label: 'Contact ORIC', href: 'mailto:oric@mnsuam.edu.pk', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ icon: Icon, label, href, color, bg }) => (
              <Link key={label} href={href}
                className="flex items-center gap-2.5 bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-xs font-semibold text-gray-800 group-hover:text-[#2d6a4f] transition-colors leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer strip */}
        <div className="bg-[#1a3d2b] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3 className="text-white font-bold text-base mb-1">Office of Research, Innovation &amp; Commercialization</h3>
            <p className="text-green-200 text-sm">Muhammad Nawaz Sharif University of Agriculture, Multan · Old Shujabad Road, Multan 66000</p>
            <p className="text-green-300 text-xs mt-1">oric@mnsuam.edu.pk · +92-61-9201327</p>
          </div>
          <Link href="/uni-dashboard/project"
            className="shrink-0 flex items-center gap-2 bg-[#c9a961] hover:bg-[#b8985a] text-[#1a3d2b] font-bold text-sm px-5 py-3 rounded-xl transition-colors">
            Browse All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────
function SectionHeader({
  icon, title, sub, viewAllHref, viewAllLabel,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-6 bg-[#c9a961] rounded-full block shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#1a3d2b] text-white text-xs font-semibold rounded-xl hover:bg-[#142d20] transition-colors">
          <Eye className="w-3.5 h-3.5" /> {viewAllLabel}
        </Link>
      )}
    </div>
  );
}

function ViewAllFooter({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
      <span className="text-xs text-gray-400">{count} total records</span>
      <Link href={href}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#2d6a4f] hover:text-[#1a3d2b] transition-colors">
        <Eye className="w-3.5 h-3.5" /> {label} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
