'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Award,
  Handshake,
  Briefcase,
  CalendarDays,
  FlaskConical,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface OricStats {
  pendingProjects: number;
  approvedProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  totalPatents: number;
  totalConsultancies: number;
  totalMous: number;
  totalEvents: number;
  totalVisits: number;
  totalDisclosures: number;
  totalProjectBudget: number;
  totalConsultancyValue: number;
}

async function fetchOricStats(): Promise<OricStats> {
  const res = await fetch('/api/oric/stats');
  if (!res.ok) throw new Error('Failed to fetch ORIC stats');
  return res.json();
}

function fmtPKR(n: number) {
  if (n >= 1_000_000_000) return `PKR ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  return `PKR ${n.toLocaleString()}`;
}

function StatCard({
  icon, label, value, sub, bg, border, iconBg,
}: {
  icon: React.ReactNode; label: string; value: number | string;
  sub?: string; bg: string; border: string; iconBg: string;
}) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl border ${border} p-5 flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function QuickCard({
  icon, iconBg, title, description, href, badge,
}: {
  icon: React.ReactNode; iconBg: string; title: string; description: string; href: string; badge?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#1a3d2b]/20 hover:shadow-md transition-all duration-200 text-left group w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        {badge && (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold shrink-0">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1a3d2b] transition-colors">{title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#1a3d2b] opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

export default function OricAdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery<OricStats>({
    queryKey: ['oric', 'stats'],
    queryFn: fetchOricStats,
    staleTime: 60_000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['oric', 'stats'] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading ORIC portal…</p>
        </div>
      </div>
    );
  }

  const s = stats;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">
                ORIC Administration
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ORIC Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Office of Research, Innovation &amp; Commercialization — MNSUAM
            </p>
          </div>
          <button
            onClick={refresh}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-medium hover:bg-[#142d20] transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* Projects status strip */}
        {(s?.pendingProjects ?? 0) > 0 && (
          <div
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 cursor-pointer hover:bg-amber-100 transition-colors"
            onClick={() => router.push('/oric-admin/projects')}
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-800 flex-1">
              {s?.pendingProjects} project{(s?.pendingProjects ?? 0) !== 1 ? 's' : ''} awaiting ORIC approval
            </p>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </div>
        )}

        {/* Stats grid — projects */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Project Status</h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-100"
              bg="from-amber-50 to-amber-100/60"
              border="border-amber-100"
              value={s?.pendingProjects ?? 0}
              label="Pending Approval"
              sub="Awaiting ORIC review"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-[#2d6a4f]" />}
              iconBg="bg-[#2d6a4f]/10"
              bg="from-[#2d6a4f]/5 to-[#2d6a4f]/10"
              border="border-[#2d6a4f]/15"
              value={s?.approvedProjects ?? 0}
              label="Approved"
              sub="Ready to commence"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-100"
              bg="from-blue-50 to-blue-100/60"
              border="border-blue-100"
              value={s?.ongoingProjects ?? 0}
              label="Ongoing"
              sub="Currently active"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
              bg="from-emerald-50 to-emerald-100/60"
              border="border-emerald-100"
              value={s?.completedProjects ?? 0}
              label="Completed"
              sub={s ? fmtPKR(s.totalProjectBudget) + ' total budget' : ''}
            />
          </div>
        </div>

        {/* Stats grid — ORIC modules */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">ORIC Records</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { icon: <Award className="w-4 h-4 text-amber-600" />, iconBg: 'bg-amber-100', label: 'Patents', value: s?.totalPatents ?? 0 },
              { icon: <FileText className="w-4 h-4 text-violet-600" />, iconBg: 'bg-violet-100', label: 'IP Disclosures', value: s?.totalDisclosures ?? 0 },
              { icon: <Briefcase className="w-4 h-4 text-sky-600" />, iconBg: 'bg-sky-100', label: 'Consultancies', value: s?.totalConsultancies ?? 0, sub: s ? fmtPKR(s.totalConsultancyValue) : '' },
              { icon: <Handshake className="w-4 h-4 text-teal-600" />, iconBg: 'bg-teal-100', label: 'MoUs', value: s?.totalMous ?? 0 },
              { icon: <CalendarDays className="w-4 h-4 text-rose-600" />, iconBg: 'bg-rose-100', label: 'Events', value: s?.totalEvents ?? 0 },
              { icon: <FlaskConical className="w-4 h-4 text-indigo-600" />, iconBg: 'bg-indigo-100', label: 'Ind. Visits', value: s?.totalVisits ?? 0 },
            ].map(({ icon, iconBg, label, value, sub }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
                  {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Quick Actions</h2>
          <p className="text-xs text-gray-500 mb-4">Navigate to ORIC management sections</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <QuickCard
              icon={<Wallet className="w-5 h-5 text-[#1a3d2b]" />}
              iconBg="bg-[#1a3d2b]/10"
              title="ORIC Projects"
              description="Review, approve, and manage research & industry project submissions with installment scheduling."
              href="/oric-admin/projects"
              badge={(s?.pendingProjects ?? 0) > 0 ? `${s?.pendingProjects} pending` : undefined}
            />
            <QuickCard
              icon={<Award className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-50"
              title="Patents & IP Disclosures"
              description="Track patent filings, IP disclosures, and licensing activity across MNSUAM."
              href="/oric-admin/patents"
            />
            <QuickCard
              icon={<Briefcase className="w-5 h-5 text-sky-600" />}
              iconBg="bg-sky-50"
              title="Consultancies"
              description="Manage faculty consultancy agreements, contract values, and ORIC overhead."
              href="/oric-admin/consultancies"
            />
            <QuickCard
              icon={<Handshake className="w-5 h-5 text-teal-600" />}
              iconBg="bg-teal-50"
              title="MoUs & Linkages"
              description="Manage memoranda of understanding and academic/industry collaboration agreements."
              href="/oric-admin/mous"
            />
            <QuickCard
              icon={<CalendarDays className="w-5 h-5 text-rose-600" />}
              iconBg="bg-rose-50"
              title="Events & Outreach"
              description="Innovation fairs, workshops, conferences, seminars and policy advocacy activities."
              href="/oric-admin/events"
            />
            <QuickCard
              icon={<FlaskConical className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50"
              title="Industrial Visits"
              description="Log and review industry delegation visits, government outreach, and community engagement."
              href="/oric-admin/visits"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
