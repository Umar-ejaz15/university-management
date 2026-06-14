'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, FileText, Sparkles, CheckCircle2,
  Settings2, Printer, RefreshCw,
  FlaskConical, Award, Handshake, Briefcase, CalendarDays,
  Globe, Shield, FileSearch, Building2, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KpiEntry { score: number; max: number; label?: string }
interface ReportData {
  kpi: { researchOutput: KpiEntry; innovationIp: KpiEntry; industryLink: KpiEntry; hrDevelopment: KpiEntry; fundingGrants: KpiEntry; total: KpiEntry };
  summary: {
    totalProjects: number; ongoingProjects: number; completedProjects: number;
    totalPatents: number; grantedPatents: number; totalDisclosures: number; totalLicensing: number;
    totalConsultancies: number; totalConsultancyValue: number;
    totalMous: number; activeMous: number; totalVisits: number; totalEvents: number; totalPolicy: number; totalBudget: number;
  };
}
interface Dept { id: string; name: string }
interface StaffItem { id: string; name: string; designation: string }
interface ReportResponse {
  meta: { generatedAt: string; filters: Record<string, unknown> };
  aggregates: Record<string, number>;
  data: Record<string, unknown[] | null>;
  lookups: { departments: Dept[]; staff: StaffItem[] };
}

// ─── Section definitions ──────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { key: 'projects',      label: 'Research & Industry Projects', icon: FlaskConical,  color: 'text-sky-600',    bg: 'bg-sky-50' },
  { key: 'patents',       label: 'Patents',                      icon: Award,         color: 'text-amber-600',  bg: 'bg-amber-50' },
  { key: 'disclosures',   label: 'IP Disclosures',               icon: FileSearch,    color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'licensing',     label: 'IP Licensing',                 icon: Shield,        color: 'text-teal-600',   bg: 'bg-teal-50' },
  { key: 'consultancies', label: 'Consultancies',                icon: Briefcase,     color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'mous',          label: 'MoUs & Linkages',              icon: Handshake,     color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'visits',        label: 'Industrial Visits',            icon: Globe,         color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  { key: 'events',        label: 'Events & Outreach',            icon: CalendarDays,  color: 'text-rose-600',   bg: 'bg-rose-50' },
  { key: 'policy',        label: 'Policy Advocacy',              icon: FileText,      color: 'text-green-600',  bg: 'bg-green-50' },
];

const PRESET_REPORTS = [
  { id: 'hec',        label: 'HEC ORIC Scorecard',        desc: 'All KPIs with evidence for HEC annual submission', sections: ALL_SECTIONS.map(s => s.key), icon: BarChart3,   color: 'bg-blue-600' },
  { id: 'annual',     label: 'Annual Progress Report',    desc: 'Full year research, IP, linkages & events summary', sections: ALL_SECTIONS.map(s => s.key), icon: FileText,   color: 'bg-emerald-600' },
  { id: 'ip',         label: 'IP & Innovation Report',    desc: 'Patents, disclosures and licensing portfolio', sections: ['patents', 'disclosures', 'licensing'], icon: Award, color: 'bg-amber-600' },
  { id: 'projects',   label: 'Projects Status Report',    desc: 'All funded projects with budget and installments',  sections: ['projects'],                 icon: FlaskConical, color: 'bg-sky-600' },
  { id: 'linkages',   label: 'Industry Linkages Report',  desc: 'MoUs, consultancies, visits and events',           sections: ['mous', 'consultancies', 'visits', 'events'], icon: Handshake, color: 'bg-indigo-600' },
  { id: 'finance',    label: 'Financial Summary',         desc: 'Budget utilisation, overhead and consultancy revenue', sections: ['projects', 'consultancies'], icon: Building2, color: 'bg-rose-600' },
];

const KPI_COLORS = [
  { bar: 'bg-blue-500',    track: 'bg-blue-100',    text: 'text-blue-700',    badge: 'bg-blue-50' },
  { bar: 'bg-violet-500',  track: 'bg-violet-100',  text: 'text-violet-700',  badge: 'bg-violet-50' },
  { bar: 'bg-teal-500',    track: 'bg-teal-100',    text: 'text-teal-700',    badge: 'bg-teal-50' },
  { bar: 'bg-amber-500',   track: 'bg-amber-100',   text: 'text-amber-700',   badge: 'bg-amber-50' },
  { bar: 'bg-emerald-500', track: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-50' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPKR(n: number) {
  if (n >= 1_000_000_000) return `PKR ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `PKR ${(n / 1_000_000).toFixed(2)}M`;
  return `PKR ${n.toLocaleString()}`;
}
function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Fetch hooks ──────────────────────────────────────────────────────────────
async function fetchKpi(): Promise<ReportData> {
  const res = await fetch('/api/oric/reports');
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useQuery({ queryKey: ['oric', 'reports'], queryFn: fetchKpi });

  // Builder state
  const [selectedSections, setSelectedSections] = useState<string[]>(ALL_SECTIONS.map(s => s.key));
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterScope, setFilterScope]   = useState('');
  const [filterFunder, setFilterFunder] = useState('');
  const [reportTitle, setReportTitle]   = useState('ORIC Annual Report 2024–25');
  const [showBuilder, setShowBuilder]   = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Lookups query (always fetch for filter UI)
  const { data: lookups } = useQuery({
    queryKey: ['oric', 'report-lookups'],
    queryFn: async () => {
      const res = await fetch('/api/oric/report-data?sections=');
      const j = await res.json() as ReportResponse;
      return j.lookups;
    },
  });

  const toggleSection = (key: string) =>
    setSelectedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const applyPreset = (sections: string[]) => {
    setSelectedSections(sections);
    setShowBuilder(true);
  };

  const buildQueryString = useCallback(() => {
    const p = new URLSearchParams();
    if (selectedSections.length < ALL_SECTIONS.length) p.set('sections', selectedSections.join(','));
    if (fromDate)      p.set('from', fromDate);
    if (toDate)        p.set('to', toDate);
    if (filterDept)    p.set('deptId', filterDept);
    if (filterStaff)   p.set('staffId', filterStaff);
    if (filterStatus)  p.set('status', filterStatus);
    if (filterScope)   p.set('scope', filterScope);
    if (filterFunder)  p.set('funderType', filterFunder);
    return p.toString();
  }, [selectedSections, fromDate, toDate, filterDept, filterStaff, filterStatus, filterScope, filterFunder]);

  const openPrintReport = async () => {
    setPreviewLoading(true);
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/oric/report-data?${qs}`);
      const report = await res.json() as ReportResponse;
      const html = buildReportHtml(reportTitle, report, selectedSections, kpiData);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const s = kpiData?.summary;
  const kpi = kpiData?.kpi;
  const kpiEntries = kpi ? [kpi.researchOutput, kpi.innovationIp, kpi.industryLink, kpi.hrDevelopment, kpi.fundingGrants] : [];
  const totalScore = kpi?.total.score ?? 0;
  const totalMax   = kpi?.total.max ?? 90;
  const totalPct   = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Build, customize and print reports for HEC, VC, F&amp;PC and other authorities</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <button onClick={() => setShowBuilder(b => !b)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#1a3d2b] text-[#1a3d2b] rounded-xl text-sm font-semibold hover:bg-[#1a3d2b]/5 transition-colors">
              <Settings2 className="w-4 h-4" /> {showBuilder ? 'Hide Builder' : 'Custom Report'}
            </button>
            <button onClick={openPrintReport} disabled={previewLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-semibold hover:bg-[#142d20] transition-colors disabled:opacity-60">
              {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              {previewLoading ? 'Building...' : 'Print / Export PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* ── Custom Report Builder ─────────────────────────────────────────── */}
        {showBuilder && (
          <div className="bg-white rounded-2xl border border-[#1a3d2b]/20 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#1a3d2b]/5">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#1a3d2b]" />
                <h2 className="text-sm font-bold text-[#1a3d2b]">Custom Report Builder</h2>
              </div>
              <button onClick={() => setShowBuilder(false)} className="p-1 hover:bg-black/10 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-6">

              {/* Report title */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Report Title</label>
                <input value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                  className="w-full max-w-lg px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
              </div>

              {/* Sections to include */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2.5">Sections to Include</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SECTIONS.map(({ key, label, icon: Icon, color, bg }) => {
                    const active = selectedSections.includes(key);
                    return (
                      <button key={key} onClick={() => toggleSection(key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active ? `${bg} ${color} border-current` : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                        {active && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setSelectedSections(ALL_SECTIONS.map(s => s.key))} className="text-[10px] font-semibold text-[#2d6a4f] hover:underline">Select All</button>
                  <span className="text-gray-300">·</span>
                  <button onClick={() => setSelectedSections([])} className="text-[10px] font-semibold text-red-500 hover:underline">Clear All</button>
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2.5">Filters</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">From Date</label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">To Date</label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Department</label>
                    <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]">
                      <option value="">All Departments</option>
                      {lookups?.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Faculty Member (PI)</label>
                    <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]">
                      <option value="">All Faculty</option>
                      {lookups?.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Project Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]">
                      <option value="">All Statuses</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Scope</label>
                    <select value={filterScope} onChange={e => setFilterScope(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]">
                      <option value="">National & International</option>
                      <option value="NATIONAL">National Only</option>
                      <option value="INTERNATIONAL">International Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Funder Type</label>
                    <select value={filterFunder} onChange={e => setFilterFunder(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b]">
                      <option value="">All Funders</option>
                      {['HEC','PSF','PARB','PARC','USDA','USAID','INDUSTRY','INTERNATIONAL','OTHER'].map(f =>
                        <option key={f} value={f}>{f}</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button onClick={openPrintReport} disabled={previewLoading || selectedSections.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3d2b] text-white rounded-xl text-sm font-semibold hover:bg-[#142d20] transition-colors disabled:opacity-50">
                  {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                  Generate &amp; Print Report
                </button>
                <p className="self-center text-xs text-gray-400">{selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Preset Report Templates ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 bg-[#c9a961] rounded-full block" />
            <h2 className="text-base font-bold text-gray-900">Preset Report Templates</h2>
            <span className="text-xs text-gray-400 ml-auto">Click to customize then print</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_REPORTS.map(r => {
              const Icon = r.icon;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{r.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.sections.slice(0, 4).map(sec => {
                      const def = ALL_SECTIONS.find(s => s.key === sec);
                      return def ? (
                        <span key={sec} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${def.bg} ${def.color}`}>{def.label}</span>
                      ) : null;
                    })}
                    {r.sections.length > 4 && <span className="text-[10px] text-gray-400">+{r.sections.length - 4} more</span>}
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                    <button onClick={() => { setReportTitle(r.label); applyPreset(r.sections); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1a3d2b] text-[#1a3d2b] rounded-lg text-xs font-semibold hover:bg-[#1a3d2b]/5 transition-colors">
                      <Settings2 className="w-3.5 h-3.5" /> Customize
                    </button>
                    <button onClick={async () => {
                      setPreviewLoading(true);
                      try {
                        const qs = r.sections.length < ALL_SECTIONS.length ? `sections=${r.sections.join(',')}` : '';
                        const res = await fetch(`/api/oric/report-data?${qs}`);
                        const report = await res.json() as ReportResponse;
                        const html = buildReportHtml(r.label, report, r.sections, kpiData);
                        const win = window.open('', '_blank');
                        if (win) { win.document.write(html); win.document.close(); }
                      } finally { setPreviewLoading(false); }
                    }} disabled={previewLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a3d2b] text-white rounded-lg text-xs font-semibold hover:bg-[#142d20] transition-colors disabled:opacity-50">
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {kpiLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" />
          </div>
        )}
        {kpiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
            Failed to load KPI data. Make sure you are logged in as ORIC.
          </div>
        )}

        {kpiData && (
          <>
            {/* ── HEC KPI Scorecard ─────────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1 h-5 bg-[#c9a961] rounded-full block" />
                <h2 className="text-base font-bold text-gray-900">Live HEC ORIC KPI Scorecard</h2>
                <span className="ml-auto text-xs text-gray-400">Calculated from live database</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">HEC ORIC Performance Indicators</h3>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Total Score</p>
                      <p className="text-lg font-extrabold text-gray-900">{totalScore}<span className="text-xs text-gray-400 font-normal">/{totalMax}</span></p>
                    </div>
                    <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center shrink-0 ${totalPct >= 70 ? 'border-emerald-200' : totalPct >= 50 ? 'border-amber-200' : 'border-red-200'}`}>
                      <span className={`text-sm font-extrabold ${totalPct >= 70 ? 'text-emerald-600' : totalPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{totalPct}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {kpiEntries.map((entry, idx) => {
                    const pct = entry.max ? Math.round((entry.score / entry.max) * 100) : 0;
                    const c = KPI_COLORS[idx % KPI_COLORS.length];
                    return (
                      <div key={entry.label ?? idx}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg ${c.badge} ${c.text} flex items-center justify-center text-xs font-bold shrink-0`}>{idx + 1}</span>
                            <span className="text-sm font-semibold text-gray-700">{entry.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${c.text}`}>{entry.score}</span>
                            <span className="text-xs text-gray-400">/ {entry.max} pts</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${c.badge} ${c.text}`}>{pct}%</span>
                          </div>
                        </div>
                        <div className={`h-2.5 ${c.track} rounded-full overflow-hidden`}>
                          <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── Evidence Summary ──────────────────────────────────────────── */}
            {s && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1 h-5 bg-[#c9a961] rounded-full block" />
                  <h2 className="text-base font-bold text-gray-900">Evidence Summary</h2>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Total Projects',       value: s.totalProjects },
                      { label: 'Ongoing Projects',     value: s.ongoingProjects },
                      { label: 'Completed Projects',   value: s.completedProjects },
                      { label: 'Total Budget',         value: fmtPKR(s.totalBudget) },
                      { label: 'Patents Filed',        value: s.totalPatents },
                      { label: 'Patents Granted',      value: s.grantedPatents },
                      { label: 'IP Disclosures',       value: s.totalDisclosures },
                      { label: 'IP Licensing',         value: s.totalLicensing },
                      { label: 'Consultancies',        value: s.totalConsultancies },
                      { label: 'Consultancy Revenue',  value: fmtPKR(s.totalConsultancyValue) },
                      { label: 'Active MoUs',          value: s.activeMous },
                      { label: 'Total MoUs',           value: s.totalMous },
                      { label: 'Industrial Visits',    value: s.totalVisits },
                      { label: 'Events & Outreach',    value: s.totalEvents },
                      { label: 'Policy Advocacy',      value: s.totalPolicy },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Info */}
        <div className="bg-[#1a3d2b]/5 border border-[#1a3d2b]/15 rounded-2xl px-5 py-4 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1a3d2b] leading-relaxed">
            <strong>How it works:</strong> All reports pull live data from the database. Use the Custom Report Builder to filter by date range, department, faculty, status, scope, or funder. Click &quot;Print / Export PDF&quot; to open a print-ready page — use your browser&apos;s Print to PDF to save the file. All numeric KPIs are calculated from real records.
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Report HTML builder (generates a complete printable page) ────────────────
function buildReportHtml(title: string, report: ReportResponse, sections: string[], kpiData?: ReportData): string {
  const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const agg = report.aggregates;
  const d   = report.data;

  const fmtN = (n: number) => {
    if (n >= 1_000_000_000) return `PKR ${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000)     return `PKR ${(n / 1_000_000).toFixed(2)}M`;
    return `PKR ${n.toLocaleString()}`;
  };
  const fd = (v?: string | null) => v ? new Date(v).toLocaleDateString('en-GB') : '—';
  const v  = (val: unknown) => (val !== null && val !== undefined && val !== '') ? String(val) : '—';

  const cell = (txt: unknown, cls = '') => `<td style="padding:6px 10px;border:1px solid #e5e7eb;font-size:12px;${cls}">${v(txt)}</td>`;
  const th   = (txt: string, cls = '') => `<th style="padding:7px 10px;border:1px solid #d1d5db;background:#f9fafb;font-size:11px;font-weight:700;text-align:left;${cls}">${txt}</th>`;

  const sectionTitle = (t: string, count?: number) => `
    <div style="background:#1a3d2b;color:white;padding:10px 16px;border-radius:8px 8px 0 0;margin-top:28px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:14px;font-weight:700;">${t}</span>
      ${count !== undefined ? `<span style="background:rgba(255,255,255,0.2);padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;">${count} records</span>` : ''}
    </div>`;

  const tableWrap = (rows: string, head: string) => `
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;margin-bottom:8px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  // Summary boxes
  const summaryBoxes = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
      ${[
        ['Projects', agg.projectCount, '#dbeafe', '#1d4ed8'],
        ['Patents & IP', (agg.patentCount ?? 0) + (agg.disclosureCount ?? 0) + (agg.licensingCount ?? 0), '#fef3c7', '#b45309'],
        ['MoUs', agg.mouCount, '#ede9fe', '#7c3aed'],
        ['Consultancies', agg.consultancyCount, '#d1fae5', '#065f46'],
        ['Total Budget', fmtN(agg.totalBudget), '#e0f2fe', '#0369a1'],
        ['Consultancy Revenue', fmtN(agg.totalConsultancyValue), '#fce7f3', '#be185d'],
        ['Events', agg.eventCount, '#fff7ed', '#c2410c'],
        ['Visits', agg.visitCount, '#ecfdf5', '#047857'],
      ].map(([lbl, val, bg, col]) => `
        <div style="background:${bg};border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:20px;font-weight:800;color:${col};">${val}</div>
          <div style="font-size:10px;font-weight:600;color:#374151;margin-top:3px;">${lbl}</div>
        </div>`).join('')}
    </div>`;

  // HEC Scorecard section
  let kpiSection = '';
  if (kpiData?.kpi && (sections.includes('all') || sections.length === 0 || sections.length === ALL_SECTIONS.length)) {
    const kpi = kpiData.kpi;
    const entries = [kpi.researchOutput, kpi.innovationIp, kpi.industryLink, kpi.hrDevelopment, kpi.fundingGrants];
    const total = kpi.total;
    kpiSection = `
      <div style="background:#1a3d2b;color:white;padding:10px 16px;border-radius:8px 8px 0 0;margin-top:28px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:14px;font-weight:700;">HEC ORIC KPI Scorecard</span>
        <span style="background:rgba(255,255,255,0.2);padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;">Score: ${total.score}/${total.max} (${Math.round((total.score/total.max)*100)}%)</span>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:16px;margin-bottom:8px;">
        ${entries.map((e, i) => {
          const pct = Math.round((e.score / e.max) * 100);
          const colors = ['#3b82f6','#8b5cf6','#14b8a6','#f59e0b','#10b981'];
          return `
            <div style="margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style="font-size:12px;font-weight:600;color:#374151;">${i+1}. ${e.label}</span>
                <span style="font-size:12px;font-weight:700;color:${colors[i]};">${e.score}/${e.max} pts (${pct}%)</span>
              </div>
              <div style="height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${colors[i]};border-radius:4px;"></div>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  // Projects section
  let projectsHtml = '';
  if (sections.includes('projects') && Array.isArray(d.projects) && d.projects.length > 0) {
    const rows = (d.projects as Record<string, unknown>[]).map(p =>
      `<tr>
        ${cell(p.title, 'font-weight:600;max-width:250px;')}
        ${cell((p.staff as Record<string,unknown>)?.name)}
        ${cell(p.projectKind)}
        ${cell(p.status)}
        ${cell(p.fundingAgency)}
        ${cell(p.budgetAmount ? fmtN(Number(p.budgetAmount)) : '—')}
        ${cell(fd(p.startDate as string))}
        ${cell(fd(p.endDate as string))}
      </tr>`
    ).join('');
    projectsHtml = sectionTitle('Research & Industry Projects', (d.projects as unknown[]).length) +
      tableWrap(rows, [
        th('Title'), th('PI'), th('Kind'), th('Status'), th('Funder'), th('Budget'), th('Start'), th('End'),
      ].join(''));
  }

  // Patents section
  let patentsHtml = '';
  if (sections.includes('patents') && Array.isArray(d.patents) && d.patents.length > 0) {
    const rows = (d.patents as Record<string, unknown>[]).map(p =>
      `<tr>${cell(p.title, 'font-weight:600;')}${cell(p.leadInventor)}${cell(p.ipCategory)}${cell(p.patentStatus)}${cell(p.filedWith)}${cell(p.applicationNumber)}${cell(fd(p.filingDate as string))}</tr>`
    ).join('');
    patentsHtml = sectionTitle('Patents', (d.patents as unknown[]).length) +
      tableWrap(rows, [th('Title'), th('Lead Inventor'), th('Category'), th('Status'), th('Filed With'), th('App No.'), th('Filing Date')].join(''));
  }

  // Disclosures
  let disclosuresHtml = '';
  if (sections.includes('disclosures') && Array.isArray(d.disclosures) && d.disclosures.length > 0) {
    const rows = (d.disclosures as Record<string, unknown>[]).map(p =>
      `<tr>${cell(p.title, 'font-weight:600;')}${cell(p.leadInventor)}${cell(p.ipCategory)}${cell(p.developmentStatus)}${cell(p.commercialPartner)}${cell(fd(p.createdAt as string))}</tr>`
    ).join('');
    disclosuresHtml = sectionTitle('IP Disclosures', (d.disclosures as unknown[]).length) +
      tableWrap(rows, [th('Title'), th('Lead Inventor'), th('Category'), th('Dev. Status'), th('Commercial Partner'), th('Date')].join(''));
  }

  // Licensing
  let licensingHtml = '';
  if (sections.includes('licensing') && Array.isArray(d.licensing) && d.licensing.length > 0) {
    const rows = (d.licensing as Record<string, unknown>[]).map(p =>
      `<tr>${cell(p.title, 'font-weight:600;')}${cell(p.leadInventor)}${cell(p.ipCategory)}${cell(p.negotiationStatus)}${cell(p.licenseeName)}${cell(p.fieldOfUse)}${cell(p.agreementDuration)}</tr>`
    ).join('');
    licensingHtml = sectionTitle('IP Licensing', (d.licensing as unknown[]).length) +
      tableWrap(rows, [th('Title'), th('Inventor'), th('Category'), th('Negotiation'), th('Licensee'), th('Field of Use'), th('Duration')].join(''));
  }

  // Consultancies
  let consultanciesHtml = '';
  if (sections.includes('consultancies') && Array.isArray(d.consultancies) && d.consultancies.length > 0) {
    const rows = (d.consultancies as Record<string, unknown>[]).map(c =>
      `<tr>${cell(c.title, 'font-weight:600;')}${cell((c.staff as Record<string,unknown>)?.name)}${cell(c.clientName)}${cell(c.serviceType)}${cell(c.contractValue ? fmtN(Number(c.contractValue)) : '—')}${cell(c.oricOverheadAmount ? fmtN(Number(c.oricOverheadAmount)) : '—')}${cell(c.status)}${cell(fd(c.startDate as string))}</tr>`
    ).join('');
    consultanciesHtml = sectionTitle('Consultancies', (d.consultancies as unknown[]).length) +
      tableWrap(rows, [th('Title'), th('PI'), th('Client'), th('Service Type'), th('Contract Value'), th('ORIC Overhead'), th('Status'), th('Start Date')].join(''));
  }

  // MoUs
  let mousHtml = '';
  if (sections.includes('mous') && Array.isArray(d.mous) && d.mous.length > 0) {
    const rows = (d.mous as Record<string, unknown>[]).map(m =>
      `<tr>${cell(m.partyName, 'font-weight:600;')}${cell(m.partyType)}${cell(m.linkageType)}${cell(m.country)}${cell(m.scope)}${cell(m.status)}${cell(fd(m.establishmentDate as string))}${cell(m.duration)}</tr>`
    ).join('');
    mousHtml = sectionTitle('MoUs & Linkages', (d.mous as unknown[]).length) +
      tableWrap(rows, [th('Party Name'), th('Type'), th('Linkage'), th('Country'), th('Scope'), th('Status'), th('Est. Date'), th('Duration')].join(''));
  }

  // Visits
  let visitsHtml = '';
  if (sections.includes('visits') && Array.isArray(d.visits) && d.visits.length > 0) {
    const rows = (d.visits as Record<string, unknown>[]).map(v =>
      `<tr>${cell(v.visitorName, 'font-weight:600;')}${cell(v.visitorOrg)}${cell(v.visitType)}${cell(fd(v.visitDate as string))}${cell(v.departmentVisited)}${cell(v.agenda)}${cell(v.outcome)}</tr>`
    ).join('');
    visitsHtml = sectionTitle('Industrial Visits', (d.visits as unknown[]).length) +
      tableWrap(rows, [th('Visitor'), th('Organization'), th('Type'), th('Date'), th('Dept Visited'), th('Agenda'), th('Outcome')].join(''));
  }

  // Events
  let eventsHtml = '';
  if (sections.includes('events') && Array.isArray(d.events) && d.events.length > 0) {
    const rows = (d.events as Record<string, unknown>[]).map(e =>
      `<tr>${cell(e.title, 'font-weight:600;')}${cell(e.category)}${cell(e.arrangedOrParticipated)}${cell(fd(e.eventDate as string))}${cell(e.venue)}${cell(e.participants)}${cell(e.scope)}</tr>`
    ).join('');
    eventsHtml = sectionTitle('Events & Outreach', (d.events as unknown[]).length) +
      tableWrap(rows, [th('Title'), th('Category'), th('Arranged/Participated'), th('Date'), th('Venue'), th('Participants'), th('Scope')].join(''));
  }

  // Policy
  let policyHtml = '';
  if (sections.includes('policy') && Array.isArray(d.policies) && d.policies.length > 0) {
    const rows = (d.policies as Record<string, unknown>[]).map(p =>
      `<tr>${cell(p.govtBody, 'font-weight:600;')}${cell(p.areaAdvocated)}${cell(p.coalitionPartners)}${cell(p.brief)}${cell(fd(p.createdAt as string))}</tr>`
    ).join('');
    policyHtml = sectionTitle('Policy Advocacy', (d.policies as unknown[]).length) +
      tableWrap(rows, [th('Govt. Body'), th('Area'), th('Coalition Partners'), th('Brief'), th('Date')].join(''));
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111827; background: white; padding: 32px; max-width: 1100px; margin: 0 auto; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none !important; }
      tr { page-break-inside: avoid; }
    }
    table { border-collapse: collapse; width: 100%; }
    td, th { word-break: break-word; vertical-align: top; }
  </style>
</head>
<body>

  <button class="no-print" onclick="window.print()" style="position:fixed;top:16px;right:16px;background:#1a3d2b;color:white;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;z-index:999;">
    🖨️ Print / Save PDF
  </button>

  <!-- Header -->
  <div style="border-bottom:3px solid #1a3d2b;padding-bottom:20px;margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
    <div>
      <div style="font-size:10px;font-weight:700;color:#c9a961;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">Muhammad Nawaz Sharif University of Agriculture, Multan</div>
      <h1 style="font-size:24px;font-weight:800;color:#1a3d2b;line-height:1.2;">${title}</h1>
      <div style="font-size:11px;color:#6b7280;margin-top:6px;">Office of Research, Innovation &amp; Commercialization (ORIC) · Generated: ${now}</div>
    </div>
    <div style="text-align:right;shrink:0;">
      <div style="font-size:11px;font-weight:700;color:#1a3d2b;">MNSUAM · ORIC</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px;">oric@mnsuam.edu.pk</div>
      <div style="font-size:10px;color:#9ca3af;">+92-61-9201327</div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:8px;">
    <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:10px;">Executive Summary — Key Metrics</div>
    ${summaryBoxes}
  </div>

  ${kpiSection}
  ${projectsHtml}
  ${patentsHtml}
  ${disclosuresHtml}
  ${licensingHtml}
  ${consultanciesHtml}
  ${mousHtml}
  ${visitsHtml}
  ${eventsHtml}
  ${policyHtml}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:16px;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:10px;color:#9ca3af;">Muhammad Nawaz Sharif University of Agriculture, Multan · Old Shujabad Road, Multan 66000 · oric@mnsuam.edu.pk</div>
    <div style="font-size:10px;color:#9ca3af;">Generated ${now} · MNSUAM ORIC Management System</div>
  </div>

</body>
</html>`;
}
