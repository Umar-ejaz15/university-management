'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Activity, CheckCircle2, AlertTriangle, XCircle,
  Search, Building2, ChevronRight, RefreshCw,
  CalendarDays, Wallet, FileText, Clock,
} from 'lucide-react';

interface MonitoringProject {
  id: string;
  title: string;
  fundingAgency: string | null;
  currency: string | null;
  staff: { id: string; name: string; designation: string | null; department: { name: string } | null };
  endDate: string | null;
  reportingFrequency: string | null;
  _health: 'GREEN' | 'YELLOW' | 'RED';
  _daysRemaining: number | null;
  _budgetReleased: number;
  _budgetTotal: number;
  _lastReportDate: string | null;
  _overdueInstallments: number;
  _milestoneProgress: number;
  reports: { submissionDate: string | null }[];
  installments: { status: string }[];
  milestones: { status: string }[];
}

interface Summary { total: number; green: number; yellow: number; red: number }

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtPKR(n: number, currency = 'PKR') {
  if (n === 0) return '—';
  if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`;
  return `${currency} ${n.toLocaleString()}`;
}

const HEALTH_CONFIG = {
  GREEN:  { label: 'On Track',  dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2,  iconColor: 'text-emerald-500' },
  YELLOW: { label: 'At Risk',   dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200',       icon: AlertTriangle, iconColor: 'text-amber-500' },
  RED:    { label: 'Overdue',   dot: 'bg-red-500',      badge: 'bg-red-50 text-red-700 border-red-200',             icon: XCircle,       iconColor: 'text-red-500' },
};

export default function MonitoringPage() {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');

  const { data, isLoading, refetch, isFetching } = useQuery<{ projects: MonitoringProject[]; summary: Summary }>({
    queryKey: ['monitoring'],
    queryFn: () => fetch('/api/admin/monitoring').then(r => r.json()),
    staleTime: 60_000,
  });

  const projects = data?.projects ?? [];
  const summary = data?.summary ?? { total: 0, green: 0, yellow: 0, red: 0 };

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (healthFilter !== 'ALL' && p._health !== healthFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.staff.name.toLowerCase().includes(q) || p.staff.department?.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [projects, healthFilter, search]);

  return (
    <div className="min-h-screen bg-[#f5f6f4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Monitoring</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track health, reports, and milestones for all ongoing projects</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Active', value: summary.total, icon: Activity,      color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
            { label: 'On Track',     value: summary.green,  icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'At Risk',      value: summary.yellow, icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
            { label: 'Overdue',      value: summary.red,    icon: XCircle,       color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => setHealthFilter(
                  card.label === 'Total Active' ? 'ALL'
                  : card.label === 'On Track'   ? 'GREEN'
                  : card.label === 'At Risk'    ? 'YELLOW'
                  : 'RED'
                )}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${card.bg} ${card.border} hover:opacity-80 transition-opacity text-left w-full`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
                  <p className="text-xs font-medium text-gray-500">{card.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project or PI…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map(h => (
            <button
              key={h}
              onClick={() => setHealthFilter(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                healthFilter === h
                  ? 'bg-[#1a3d2b] text-white border-[#1a3d2b]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {h === 'ALL' ? 'All' : HEALTH_CONFIG[h].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-8 pb-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Activity className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No projects match the current filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const h = HEALTH_CONFIG[p._health];
              const HealthIcon = h.icon;
              const pct = p._budgetTotal > 0 ? Math.round((p._budgetReleased / p._budgetTotal) * 100) : 0;

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5 flex items-start gap-5">
                    {/* Health indicator */}
                    <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0">
                      <HealthIcon className={`w-6 h-6 ${h.iconColor}`} />
                      <div className={`w-1.5 h-12 rounded-full ${h.dot} opacity-30`} />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">{p.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="text-sm text-gray-500">{p.staff.name}</span>
                            {p.staff.department && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Building2 className="w-3 h-3" /> {p.staff.department.name}
                              </span>
                            )}
                            {p.fundingAgency && (
                              <span className="text-xs text-gray-400">{p.fundingAgency}</span>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${h.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.dot}`} />
                          {h.label}
                        </span>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        {/* Days remaining */}
                        <div className="flex items-start gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Deadline</p>
                            {p._daysRemaining === null ? (
                              <p className="text-sm text-gray-400">Not set</p>
                            ) : p._daysRemaining < 0 ? (
                              <p className="text-sm font-bold text-red-600">{Math.abs(p._daysRemaining)}d overdue</p>
                            ) : (
                              <p className={`text-sm font-semibold ${p._daysRemaining <= 30 ? 'text-amber-600' : 'text-gray-800'}`}>
                                {p._daysRemaining}d left
                              </p>
                            )}
                            <p className="text-xs text-gray-400">{fmtDate(p.endDate)}</p>
                          </div>
                        </div>

                        {/* Budget */}
                        <div className="flex items-start gap-2">
                          <Wallet className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Budget Released</p>
                            <p className="text-sm font-semibold text-gray-800">{pct}%</p>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-blue-400'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{fmtPKR(p._budgetReleased, p.currency ?? 'PKR')} / {fmtPKR(p._budgetTotal, p.currency ?? 'PKR')}</p>
                          </div>
                        </div>

                        {/* Last report */}
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Report</p>
                            <p className={`text-sm font-semibold ${!p._lastReportDate ? 'text-red-500' : 'text-gray-800'}`}>
                              {p._lastReportDate ? fmtDate(p._lastReportDate) : 'None submitted'}
                            </p>
                            <p className="text-xs text-gray-400">{p.reports.length} report{p.reports.length !== 1 ? 's' : ''} total</p>
                          </div>
                        </div>

                        {/* Milestones */}
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Milestones</p>
                            {p.milestones.length === 0 ? (
                              <p className="text-sm text-gray-400">Not set</p>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-gray-800">{p._milestoneProgress}% done</p>
                                <p className="text-xs text-gray-400">
                                  {p.milestones.filter(m => m.status === 'COMPLETED').length}/{p.milestones.length} completed
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Overdue installment warning */}
                      {p._overdueInstallments > 0 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {p._overdueInstallments} overdue installment{p._overdueInstallments > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* View button */}
                    <Link
                      href={`/oric-admin/monitoring/${p.id}`}
                      className="shrink-0 inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#1a3d2b] border border-[#1a3d2b]/25 rounded-xl hover:bg-[#1a3d2b]/5 transition-colors"
                    >
                      Monitor <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
