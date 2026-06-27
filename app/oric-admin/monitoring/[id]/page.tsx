'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock,
  CalendarDays, Wallet, FileText, Plus, Trash2, Building2,
  Mail, Target, Activity, ChevronRight, Loader2, Save, RefreshCw,
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string;
  completedDate: string | null;
  status: string;
}
interface Report {
  id: string;
  reportType: string;
  dueDate: string | null;
  submissionDate: string | null;
  status: string;
  fileUrl: string | null;
}
interface Installment {
  id: string;
  installmentNo: number;
  amount: string;
  dueDate: string | null;
  releaseDate: string | null;
  status: string;
  note: string | null;
}
interface Project {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budgetAmount: string | null;
  currency: string | null;
  fundingAgency: string | null;
  reportingFrequency: string | null;
  monitoringPlan: string | null;
  remarks: string | null;
  staff: { id: string; name: string; designation: string | null; email: string | null; department: { name: string } | null };
  installments: Installment[];
  reports: Report[];
  milestones: Milestone[];
  coPIs: { id: string; name: string; designation: string | null }[];
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function computeHealth(p: Project): 'GREEN' | 'YELLOW' | 'RED' {
  const now = new Date();
  const daysRemaining = p.endDate ? Math.ceil((new Date(p.endDate).getTime() - now.getTime()) / 86_400_000) : null;
  const overdue = p.installments.filter(i => i.status === 'PENDING' && i.dueDate && new Date(i.dueDate) < now).length;
  const lastSub = p.reports.filter(r => r.submissionDate).sort((a, b) => new Date(b.submissionDate!).getTime() - new Date(a.submissionDate!).getTime())[0];
  const daysSince = lastSub?.submissionDate ? Math.floor((now.getTime() - new Date(lastSub.submissionDate).getTime()) / 86_400_000) : null;
  if ((daysRemaining !== null && daysRemaining < 0) || overdue >= 2 || (daysSince !== null && daysSince > 90)) return 'RED';
  if ((daysRemaining !== null && daysRemaining <= 60) || overdue === 1 || (daysSince !== null && daysSince > 45)) return 'YELLOW';
  return 'GREEN';
}

const HEALTH_CONFIG = {
  GREEN:  { label: 'On Track',  bg: 'from-emerald-700 to-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  YELLOW: { label: 'At Risk',   bg: 'from-amber-700 to-amber-500',     badge: 'bg-amber-50 text-amber-700 border-amber-200',       icon: AlertTriangle },
  RED:    { label: 'Overdue',   bg: 'from-red-800 to-red-600',         badge: 'bg-red-50 text-red-700 border-red-200',             icon: XCircle },
};

const FREQ_OPTIONS = ['Monthly', 'Bi-Monthly', 'Quarterly', 'Every 4 Months', 'Every 6 Months', 'Annual'];

export default function ProjectMonitoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery<{ project: Project }>({
    queryKey: ['monitoring', id],
    queryFn: () => fetch(`/api/admin/monitoring/${id}`).then(r => r.json()),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const project = data?.project;

  // Milestone form
  const [mForm, setMForm] = useState({ title: '', description: '', targetDate: '' });
  const [mError, setMError] = useState('');

  // Settings edit
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [freq, setFreq] = useState('');
  const [monPlan, setMonPlan] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const addMilestone = useMutation({
    mutationFn: (body: typeof mForm) =>
      fetch(`/api/admin/monitoring/${id}/milestones`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: (d) => {
      if (d.error) { setMError(d.error); return; }
      qc.invalidateQueries({ queryKey: ['monitoring', id] });
      setMForm({ title: '', description: '', targetDate: '' });
      setMError('');
    },
  });

  const updateMilestone = useMutation({
    mutationFn: ({ mid, ...body }: { mid: string; status: string; completedDate?: string | null }) =>
      fetch(`/api/admin/monitoring/${id}/milestones/${mid}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitoring', id] }),
  });

  const deleteMilestone = useMutation({
    mutationFn: (mid: string) =>
      fetch(`/api/admin/monitoring/${id}/milestones/${mid}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitoring', id] }),
  });

  const saveSettings = async () => {
    setSettingsSaving(true);
    await fetch(`/api/admin/monitoring/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportingFrequency: freq, monitoringPlan: monPlan }),
    });
    await qc.invalidateQueries({ queryKey: ['monitoring', id] });
    setSettingsSaving(false);
    setSettingsOpen(false);
  };

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const health = computeHealth(project);
  const hc = HEALTH_CONFIG[health];
  const HealthIcon = hc.icon;

  const now = new Date();
  const startTs = project.startDate ? new Date(project.startDate).getTime() : null;
  const endTs   = project.endDate   ? new Date(project.endDate).getTime()   : null;
  const nowTs   = now.getTime();
  const totalDuration = startTs && endTs ? endTs - startTs : null;
  const elapsed = startTs && totalDuration ? Math.min(Math.max(nowTs - startTs, 0), totalDuration) : null;
  const timelinePct = elapsed !== null && totalDuration ? Math.round((elapsed / totalDuration) * 100) : null;

  const budgetTotal    = Number(project.budgetAmount ?? 0);
  const budgetReleased = project.installments.filter(i => i.status === 'RELEASED').reduce((s, i) => s + Number(i.amount), 0);
  const budgetPct      = budgetTotal > 0 ? Math.round((budgetReleased / budgetTotal) * 100) : 0;

  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
  const milestonePct = project.milestones.length > 0
    ? Math.round((completedMilestones / project.milestones.length) * 100)
    : 0;

  const daysRemaining = project.endDate
    ? Math.ceil((new Date(project.endDate).getTime() - now.getTime()) / 86_400_000)
    : null;

  function fmtCurrency(n: number) {
    const c = project!.currency ?? 'PKR';
    if (n >= 1_000_000) return `${c} ${(n / 1_000_000).toFixed(2)}M`;
    return `${c} ${n.toLocaleString()}`;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f4]">

      {/* Hero */}
      <div className={`bg-gradient-to-br ${hc.bg} text-white px-8 py-10`}>
        <Link href="/oric-admin/monitoring" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Monitoring
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${hc.badge}`}>
                <HealthIcon className="w-3.5 h-3.5" /> {hc.label}
              </span>
              <span className="text-xs text-white/50 bg-white/10 px-2.5 py-1 rounded-full">{project.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight max-w-3xl">{project.title}</h1>
            <div className="flex flex-wrap gap-5 mt-5 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-white/40" />{project.staff.department?.name ?? '—'}</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-white/40" />{fmtDate(project.startDate)} → {fmtDate(project.endDate)}</span>
              {budgetTotal > 0 && <span className="flex items-center gap-1.5"><Wallet className="w-4 h-4 text-white/40" />{fmtCurrency(budgetTotal)}</span>}
              {project.reportingFrequency && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-white/40" />{project.reportingFrequency} reporting</span>}
            </div>
          </div>

          {/* Days remaining pill */}
          {daysRemaining !== null && (
            <div className="bg-white/15 border border-white/20 rounded-2xl px-5 py-4 text-center shrink-0">
              <p className={`text-3xl font-extrabold ${daysRemaining < 0 ? 'text-red-200' : 'text-white'}`}>
                {Math.abs(daysRemaining)}
              </p>
              <p className="text-xs text-white/60 mt-0.5">{daysRemaining < 0 ? 'days overdue' : 'days remaining'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7">

          {/* ── LEFT ───────────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Timeline Progress */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1a3d2b]" /> Project Timeline
              </h2>
              {timelinePct !== null ? (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{fmtDate(project.startDate)}</span>
                    <span className="font-bold text-gray-600">{timelinePct}% elapsed</span>
                    <span>{fmtDate(project.endDate)}</span>
                  </div>
                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${health === 'RED' ? 'bg-red-500' : health === 'YELLOW' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(timelinePct, 100)}%` }}
                    />
                    {/* Today marker */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-gray-800/40" style={{ left: `${Math.min(timelinePct, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Today: {fmtDate(now.toISOString())}
                    {daysRemaining !== null && daysRemaining > 0 && ` · ${daysRemaining} days until end date`}
                    {daysRemaining !== null && daysRemaining < 0 && ` · ${Math.abs(daysRemaining)} days past end date`}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Start or end date not set — cannot compute timeline progress.</p>
              )}
            </section>

            {/* Progress Reports */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1a3d2b]" /> Progress Reports
                  <span className="text-sm font-normal text-gray-400">({project.reports.length})</span>
                </h2>
                <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              {project.reports.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400">No reports scheduled yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <th className="text-left px-6 py-3">Type</th>
                      <th className="text-left px-4 py-3">Due Date</th>
                      <th className="text-left px-4 py-3">Submitted</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {project.reports.map((r, i) => {
                      const isLate = r.dueDate && !r.submissionDate && new Date(r.dueDate) < now;
                      const statusColor = r.submissionDate
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isLate
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';
                      const statusLabel = r.submissionDate ? 'Submitted' : isLate ? 'Overdue' : r.status;
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5 font-medium text-gray-800">#{i + 1} {r.reportType}</td>
                          <td className="px-4 py-3.5 text-gray-500">{fmtDate(r.dueDate)}</td>
                          <td className="px-4 py-3.5 text-gray-500">{fmtDate(r.submissionDate)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {r.fileUrl && (
                              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-[#1a3d2b] hover:underline font-medium">
                                View file
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            {/* Milestones */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#1a3d2b]" /> Milestones
                  {project.milestones.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">{milestonePct}% complete</span>
                  )}
                </h2>
              </div>

              {/* Milestone list */}
              {project.milestones.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {project.milestones.map(m => {
                    const isDelayed = m.status === 'PENDING' && new Date(m.targetDate) < now;
                    const statusColor =
                      m.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                      isDelayed               ? 'text-red-600 bg-red-50 border-red-200' :
                                                'text-amber-600 bg-amber-50 border-amber-200';
                    const displayStatus = m.status === 'COMPLETED' ? 'Completed' : isDelayed ? 'Delayed' : 'Pending';

                    return (
                      <div key={m.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                        <button
                          onClick={() => updateMilestone.mutate({
                            mid: m.id,
                            status: m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
                            completedDate: m.status === 'COMPLETED' ? null : new Date().toISOString(),
                          })}
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            m.status === 'COMPLETED'
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-gray-300 hover:border-emerald-400'
                          }`}
                        >
                          {m.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${m.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {m.title}
                          </p>
                          {m.description && <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="text-xs text-gray-400">Target: {fmtDate(m.targetDate)}</span>
                            {m.completedDate && <span className="text-xs text-emerald-600">Completed: {fmtDate(m.completedDate)}</span>}
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{displayStatus}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMilestone.mutate(m.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add milestone form */}
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Add Milestone</p>
                {mError && <p className="text-xs text-red-600 mb-2">{mError}</p>}
                <div className="flex flex-wrap gap-3">
                  <input
                    value={mForm.title}
                    onChange={e => setMForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Milestone title…"
                    className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]"
                  />
                  <input
                    value={mForm.description}
                    onChange={e => setMForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]"
                  />
                  <input
                    type="date"
                    value={mForm.targetDate}
                    onChange={e => setMForm(f => ({ ...f, targetDate: e.target.value }))}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]"
                  />
                  <button
                    onClick={() => addMilestone.mutate(mForm)}
                    disabled={addMilestone.isPending || !mForm.title.trim() || !mForm.targetDate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a3d2b] text-white text-sm font-semibold rounded-xl hover:bg-[#0f2419] disabled:opacity-50 transition-colors"
                  >
                    {addMilestone.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* ── RIGHT SIDEBAR ──────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* PI Card */}
            <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Principal Investigator</p>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d6a4f] to-[#0c1f12] flex items-center justify-center text-white font-bold shrink-0">
                  {project.staff.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0">
                  <Link href={`/faculty/${project.staff.id}`} className="font-bold text-gray-900 hover:text-[#1a3d2b] transition-colors text-sm">
                    {project.staff.name}
                  </Link>
                  {project.staff.designation && <p className="text-xs text-gray-500 mt-0.5">{project.staff.designation}</p>}
                  {project.staff.department && <p className="text-xs text-gray-400">{project.staff.department.name}</p>}
                  {project.staff.email && (
                    <a href={`mailto:${project.staff.email}`} className="text-xs text-[#1a3d2b] flex items-center gap-1 mt-1 hover:underline">
                      <Mail className="w-3 h-3" /> {project.staff.email}
                    </a>
                  )}
                </div>
              </div>
            </aside>

            {/* Financial Summary */}
            <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#1a3d2b]" /> Financial Summary
                </h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">Budget released</span>
                    <span className="font-bold text-gray-800">{budgetPct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${budgetPct >= 75 ? 'bg-emerald-500' : budgetPct >= 40 ? 'bg-amber-400' : 'bg-blue-400'}`}
                      style={{ width: `${Math.min(budgetPct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Released: {fmtCurrency(budgetReleased)}</span>
                    <span>Total: {fmtCurrency(budgetTotal)}</span>
                  </div>
                </div>

                {project.installments.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Installments</p>
                    <div className="space-y-2">
                      {project.installments.map(inst => {
                        const isOverdue = inst.status === 'PENDING' && inst.dueDate && new Date(inst.dueDate) < now;
                        return (
                          <div key={inst.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-xs font-semibold text-gray-800">#{inst.installmentNo} — {project.currency ?? 'PKR'} {Number(inst.amount).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">Due: {fmtDate(inst.dueDate)}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              inst.status === 'RELEASED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isOverdue
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {inst.status === 'RELEASED' ? 'Released' : isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Monitoring Settings */}
            <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1a3d2b]" /> Monitoring Settings
                </h3>
                <button
                  onClick={() => {
                    setFreq(project.reportingFrequency ?? 'Quarterly');
                    setMonPlan(project.monitoringPlan ?? '');
                    setSettingsOpen(s => !s);
                  }}
                  className="text-xs font-semibold text-[#1a3d2b] hover:underline"
                >
                  {settingsOpen ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="px-5 py-4 space-y-3">
                {settingsOpen ? (
                  <>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Reporting Frequency</p>
                      <select
                        value={freq}
                        onChange={e => setFreq(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]"
                      >
                        {FREQ_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Monitoring Plan</p>
                      <textarea
                        rows={3}
                        value={monPlan}
                        onChange={e => setMonPlan(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] resize-none"
                        placeholder="Describe how this project will be monitored…"
                      />
                    </div>
                    <button
                      onClick={saveSettings}
                      disabled={settingsSaving}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a3d2b] text-white text-sm font-semibold rounded-xl hover:bg-[#0f2419] disabled:opacity-50 transition-colors"
                    >
                      {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Settings
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Reporting Frequency</p>
                      <p className="text-sm font-semibold text-gray-800">{project.reportingFrequency ?? 'Not set'}</p>
                    </div>
                    {project.monitoringPlan && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Monitoring Plan</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{project.monitoringPlan}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>

            {/* Co-PIs */}
            {project.coPIs.length > 0 && (
              <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Co-PIs ({project.coPIs.length})</p>
                <div className="space-y-2.5">
                  {project.coPIs.map(c => (
                    <div key={c.id} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                        {c.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{c.name}</p>
                        {c.designation && <p className="text-xs text-gray-400">{c.designation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            )}

            {/* View full project link */}
            <Link
              href={`/uni-dashboard/project/${project.id}`}
              className="flex items-center justify-between w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-[#1a3d2b] hover:bg-[#1a3d2b]/5 transition-colors shadow-sm"
            >
              View Full Project Page <ChevronRight className="w-4 h-4" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
