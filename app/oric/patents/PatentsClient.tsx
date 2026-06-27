'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOricPatentsFilterStore } from '@/lib/store/oricFiltersStore';
import Link from 'next/link';
import { Award, FileSearch, Shield, ArrowLeft, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import OricRecordCard from '@/components/oric/OricRecordCard';

// ── Types ──────────────────────────────────────────────────────────────────────
type Patent = {
  id: string; title: string; patentStatus?: string | null; ipCategory?: string | null;
  leadInventor?: string | null; filedWith?: string | null; filingDate?: string;
  applicationNumber?: string | null; ipoStatus?: string | null; ipoExaminer?: string | null;
  staff: { name: string; designation?: string | null; department?: { name: string } | null } | null;
};
type Disclosure = {
  id: string; title: string; ipCategory?: string | null; developmentStatus?: string | null;
  leadInventor?: string | null; scope: string; commercialPartner?: string | null;
  financialSupport?: string | null; createdAt?: string;
  staff: { name: string; designation?: string | null; department?: { name: string } | null } | null;
};
type Licensing = {
  id: string; title: string; ipCategory?: string | null; negotiationStatus?: string | null;
  licenseeName?: string | null; fieldOfUse?: string | null; agreementDuration?: string | null;
  scope: string; createdAt?: string; leadInventor?: string | null;
  staff: { name: string; designation?: string | null; department?: { name: string } | null } | null;
};

// ── Badge helpers ──────────────────────────────────────────────────────────────
const PATENT_STATUS: Record<string, string> = {
  Granted: 'bg-emerald-100 text-emerald-700',
  'Under Examination': 'bg-amber-100 text-amber-700',
  Published: 'bg-blue-100 text-blue-700',
  Filed: 'bg-gray-100 text-gray-600',
  Rejected: 'bg-red-100 text-red-700',
};
const DEV_STATUS: Record<string, string> = {
  Idea: 'bg-gray-100 text-gray-600', Prototype: 'bg-blue-100 text-blue-700',
  Validation: 'bg-amber-100 text-amber-700', 'Production Ready': 'bg-emerald-100 text-emerald-700',
  Commercialized: 'bg-violet-100 text-violet-700',
};
const NEGO_STATUS: Record<string, string> = {
  'Initial Contact': 'bg-gray-100 text-gray-600', 'Under Negotiation': 'bg-amber-100 text-amber-700',
  'Agreement Signed': 'bg-emerald-100 text-emerald-700', Terminated: 'bg-red-100 text-red-700',
};

// ── Shared sidebar filter ──────────────────────────────────────────────────────
function FilterSidebar({
  title, options, active, onToggle, onClear, search, onSearch, resultCount, total,
}: {
  title: string; options: Array<{ key: string; label: string; opts: string[] }>;
  active: Record<string, string[]>; onToggle: (k: string, v: string) => void;
  onClear: () => void; search: string; onSearch: (v: string) => void;
  resultCount: number; total: number;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const activeCount = Object.values(active).flat().length + (search ? 1 : 0);
  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1a3d2b]" /> Filters
        </span>
        <span className="text-[10px] text-gray-400">{resultCount}/{total}</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search…"
          className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] bg-white" />
        {search && <button onClick={() => onSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>}
      </div>
      {options.map(g => {
        const isOpen = open[g.key] !== false;
        const sel = active[g.key] ?? [];
        return (
          <div key={g.key}>
            <button onClick={() => setOpen(p => ({ ...p, [g.key]: !isOpen }))}
              className="w-full flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 hover:text-gray-700">
              <span>{g.label}{sel.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[9px] font-bold">{sel.length}</span>}</span>
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {isOpen && (
              <div className="space-y-1">
                {g.opts.map(opt => (
                  <button key={opt} onClick={() => onToggle(g.key, opt)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${sel.includes(opt) ? 'bg-[#1a3d2b] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                    <span className="truncate text-left">{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {activeCount > 0 && (
        <button onClick={onClear} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
          <X className="w-3.5 h-3.5" /> Clear all
        </button>
      )}
    </aside>
  );
}

// ── Tab types ──────────────────────────────────────────────────────────────────
type Tab = 'patents' | 'disclosures' | 'licensing';

export default function PatentsClient({ patents, disclosures, licensing, stats }: {
  patents: Patent[]; disclosures: Disclosure[]; licensing: Licensing[];
  stats: { granted: number; signed: number };
}) {
  const searchParams = useSearchParams();
  const { tab, search, active, mobileSidebar, setTab, setSearch, toggleFilter, setMobileSidebar, clearAll } = useOricPatentsFilterStore();

  // Sync initial tab from URL query param on first mount only
  useEffect(() => {
    const urlTab = searchParams.get('tab') as Tab | null;
    if (urlTab && ['patents', 'disclosures', 'licensing'].includes(urlTab)) {
      setTab(urlTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (k: string, v: string) => toggleFilter(k, v);

  const q = search.toLowerCase();

  const filteredPatents = useMemo(() => patents.filter(p => {
    if (q && !`${p.title} ${p.leadInventor} ${p.staff?.name} ${p.applicationNumber}`.toLowerCase().includes(q)) return false;
    if (active.patentStatus?.length && !active.patentStatus.includes(p.patentStatus ?? '')) return false;
    if (active.ipCategory?.length && !active.ipCategory.includes(p.ipCategory ?? '')) return false;
    if (active.filedWith?.length && !active.filedWith.includes(p.filedWith ?? '')) return false;
    return true;
  }), [patents, q, active]);

  const filteredDisc = useMemo(() => disclosures.filter(d => {
    if (q && !`${d.title} ${d.leadInventor} ${d.staff?.name} ${d.commercialPartner}`.toLowerCase().includes(q)) return false;
    if (active.developmentStatus?.length && !active.developmentStatus.includes(d.developmentStatus ?? '')) return false;
    if (active.ipCategoryD?.length && !active.ipCategoryD.includes(d.ipCategory ?? '')) return false;
    if (active.scope?.length && !active.scope.includes(d.scope)) return false;
    return true;
  }), [disclosures, q, active]);

  const filteredLic = useMemo(() => licensing.filter(l => {
    if (q && !`${l.title} ${l.leadInventor} ${l.licenseeName} ${l.staff?.name}`.toLowerCase().includes(q)) return false;
    if (active.negotiationStatus?.length && !active.negotiationStatus.includes(l.negotiationStatus ?? '')) return false;
    if (active.ipCategoryL?.length && !active.ipCategoryL.includes(l.ipCategory ?? '')) return false;
    if (active.scopeL?.length && !active.scopeL.includes(l.scope)) return false;
    return true;
  }), [licensing, q, active]);

  const uniq = (arr: (string | null | undefined)[]) => [...new Set(arr.filter(Boolean))] as string[];

  const filterOptions: Record<Tab, Array<{ key: string; label: string; opts: string[] }>> = {
    patents: [
      { key: 'patentStatus', label: 'Status', opts: uniq(patents.map(p => p.patentStatus)) },
      { key: 'ipCategory',   label: 'IP Category', opts: uniq(patents.map(p => p.ipCategory)) },
      { key: 'filedWith',    label: 'Filed With', opts: uniq(patents.map(p => p.filedWith)) },
    ],
    disclosures: [
      { key: 'developmentStatus', label: 'Dev. Status', opts: uniq(disclosures.map(d => d.developmentStatus)) },
      { key: 'ipCategoryD',       label: 'IP Category', opts: uniq(disclosures.map(d => d.ipCategory)) },
      { key: 'scope',             label: 'Scope', opts: uniq(disclosures.map(d => d.scope)) },
    ],
    licensing: [
      { key: 'negotiationStatus', label: 'Negotiation', opts: uniq(licensing.map(l => l.negotiationStatus)) },
      { key: 'ipCategoryL',       label: 'IP Category', opts: uniq(licensing.map(l => l.ipCategory)) },
      { key: 'scopeL',            label: 'Scope', opts: uniq(licensing.map(l => l.scope)) },
    ],
  };

  const current = tab === 'patents' ? filteredPatents : tab === 'disclosures' ? filteredDisc : filteredLic;
  const total   = tab === 'patents' ? patents.length : tab === 'disclosures' ? disclosures.length : licensing.length;
  const activeCount = Object.values(active).flat().length + (search ? 1 : 0);

  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e5c3a]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute left-1/3 -bottom-8 w-52 h-52 rounded-full bg-[#c9a961]/20" />
        </div>
        <div className="relative px-6 sm:px-10 py-10">
          <Link href="/oric" className="inline-flex items-center gap-1.5 text-green-300 hover:text-white text-xs font-semibold mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> ORIC Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#c9a961]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Patents &amp; Intellectual Property</h1>
              </div>
              <p className="text-green-200 text-sm">Full IP register — patents, disclosures and licensing agreements</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {[
                { label: 'Total Patents', value: patents.length, color: 'bg-amber-400' },
                { label: 'Granted', value: stats.granted, color: 'bg-emerald-400' },
                { label: 'Disclosures', value: disclosures.length, color: 'bg-violet-400' },
                { label: 'Licensing', value: licensing.length, color: 'bg-teal-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[72px]">
                  <p className="text-xl font-extrabold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-green-200 mt-1 font-medium">{s.label}</p>
                  <div className={`h-1 ${s.color} rounded-full mt-2 mx-auto w-8`} />
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-7 bg-white/10 rounded-xl p-1 w-fit">
            {([
              { key: 'patents' as Tab, label: 'Patents', icon: Award, count: patents.length },
              { key: 'disclosures' as Tab, label: 'IP Disclosures', icon: FileSearch, count: disclosures.length },
              { key: 'licensing' as Tab, label: 'IP Licensing', icon: Shield, count: licensing.length },
            ]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? 'bg-white text-[#1a3d2b] shadow' : 'text-white/70 hover:text-white'}`}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tab === t.key ? 'bg-[#1a3d2b]/10 text-[#1a3d2b]' : 'bg-white/20 text-white'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 sm:px-10 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button onClick={() => setMobileSidebar(!mobileSidebar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[10px] font-bold">{activeCount}</span>}
          </button>
          {mobileSidebar && (
            <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <FilterSidebar title={tab} options={filterOptions[tab]} active={active} onToggle={toggle}
                onClear={clearAll} search={search} onSearch={setSearch} resultCount={current.length} total={total} />
            </div>
          )}
        </div>

        <div className="flex gap-7">
          {/* Sidebar */}
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <FilterSidebar title={tab} options={filterOptions[tab]} active={active} onToggle={toggle}
                onClear={clearAll} search={search} onSearch={setSearch} resultCount={current.length} total={total} />
            </div>
          </div>

          {/* Cards */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{current.length}</span> of <span className="font-bold">{total}</span>
                {activeCount > 0 && <span className="ml-2 text-[#2d6a4f] font-semibold">(filtered)</span>}
              </p>
              {activeCount > 0 && (
                <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            <div className="space-y-3">
              {tab === 'patents' && filteredPatents.map((p, i) => (
                <OricRecordCard key={p.id} index={i + 1}
                  accentLeft="#d97706"
                  title={p.title}
                  badges={[
                    p.patentStatus ? { text: p.patentStatus, cls: PATENT_STATUS[p.patentStatus] ?? 'bg-gray-100 text-gray-600' } : null,
                    p.ipCategory ? { text: p.ipCategory, cls: 'bg-amber-50 text-amber-700' } : null,
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    p.leadInventor ? { text: `Inventor: ${p.leadInventor}` } : null,
                    p.staff?.department?.name ? { text: p.staff.department.name } : null,
                    p.filedWith ? { text: `Filed: ${p.filedWith}` } : null,
                    p.filingDate ? { text: p.filingDate } : null,
                  ].filter(Boolean) as { text: string }[]}
                  fields={[
                    { label: 'Application No.', value: p.applicationNumber, mono: true },
                    { label: 'Filed With', value: p.filedWith },
                    { label: 'Filing Date', value: p.filingDate },
                    { label: 'Status', value: p.patentStatus },
                    { label: 'IPO Status', value: p.ipoStatus },
                    { label: 'IPO Examiner', value: p.ipoExaminer },
                    { label: 'Lead Inventor', value: p.leadInventor },
                    { label: 'Submitting Faculty', value: p.staff?.name },
                    { label: 'Designation', value: p.staff?.designation },
                    { label: 'Department', value: p.staff?.department?.name },
                  ]}
                />
              ))}

              {tab === 'disclosures' && filteredDisc.map((d, i) => (
                <OricRecordCard key={d.id} index={i + 1}
                  accentLeft="#7c3aed"
                  title={d.title}
                  badges={[
                    d.developmentStatus ? { text: d.developmentStatus, cls: DEV_STATUS[d.developmentStatus] ?? 'bg-gray-100 text-gray-600' } : null,
                    d.ipCategory ? { text: d.ipCategory, cls: 'bg-violet-50 text-violet-700' } : null,
                    { text: d.scope, cls: 'bg-gray-100 text-gray-600' },
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    d.leadInventor ? { text: `Inventor: ${d.leadInventor}` } : null,
                    d.staff?.department?.name ? { text: d.staff.department.name } : null,
                    d.commercialPartner ? { text: `Partner: ${d.commercialPartner}` } : null,
                    d.createdAt ? { text: d.createdAt } : null,
                  ].filter(Boolean) as { text: string }[]}
                  fields={[
                    { label: 'Lead Inventor', value: d.leadInventor },
                    { label: 'Development Status', value: d.developmentStatus },
                    { label: 'IP Category', value: d.ipCategory },
                    { label: 'Scope', value: d.scope },
                    { label: 'Commercial Partner', value: d.commercialPartner },
                    { label: 'Financial Support', value: d.financialSupport },
                    { label: 'Submitting Faculty', value: d.staff?.name },
                    { label: 'Department', value: d.staff?.department?.name },
                    { label: 'Submitted', value: d.createdAt },
                  ]}
                />
              ))}

              {tab === 'licensing' && filteredLic.map((l, i) => (
                <OricRecordCard key={l.id} index={i + 1}
                  accentLeft="#0d9488"
                  title={l.title}
                  badges={[
                    l.negotiationStatus ? { text: l.negotiationStatus, cls: NEGO_STATUS[l.negotiationStatus] ?? 'bg-gray-100 text-gray-600' } : null,
                    l.ipCategory ? { text: l.ipCategory, cls: 'bg-teal-50 text-teal-700' } : null,
                    { text: l.scope, cls: 'bg-gray-100 text-gray-600' },
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    l.leadInventor ? { text: `Inventor: ${l.leadInventor}` } : null,
                    l.licenseeName ? { text: `Licensee: ${l.licenseeName}` } : null,
                    l.staff?.department?.name ? { text: l.staff.department.name } : null,
                    l.createdAt ? { text: l.createdAt } : null,
                  ].filter(Boolean) as { text: string }[]}
                  fields={[
                    { label: 'Lead Inventor', value: l.leadInventor },
                    { label: 'Negotiation Status', value: l.negotiationStatus },
                    { label: 'Licensee', value: l.licenseeName },
                    { label: 'Field of Use', value: l.fieldOfUse },
                    { label: 'Agreement Duration', value: l.agreementDuration },
                    { label: 'Scope', value: l.scope },
                    { label: 'IP Category', value: l.ipCategory },
                    { label: 'Submitting Faculty', value: l.staff?.name },
                    { label: 'Department', value: l.staff?.department?.name },
                    { label: 'Submitted', value: l.createdAt },
                  ]}
                />
              ))}

              {current.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No records match your filters</p>
                  <button onClick={clearAll} className="mt-3 text-sm text-[#2d6a4f] font-semibold hover:underline">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
