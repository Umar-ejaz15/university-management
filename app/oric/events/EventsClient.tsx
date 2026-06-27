'use client';

import { useState, useMemo } from 'react';
import { useOricEventsFilterStore } from '@/lib/store/oricFiltersStore';
import Link from 'next/link';
import { CalendarDays, Globe, ArrowLeft, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import OricRecordCard from '@/components/oric/OricRecordCard';

type Event = {
  id: string; title: string; category?: string | null; eventDate?: string;
  venue?: string | null; participants?: number; scope?: string | null;
  arrangedOrParticipated?: string | null; subjectArea?: string | null;
  outcome?: string | null; sponsoringAgency?: string | null;
  staff: { name: string; department?: { name: string } | null } | null;
};
type Visit = {
  id: string; visitorName: string; visitorOrg?: string | null; visitDate?: string;
  visitType?: string | null; departmentVisited?: string | null;
  agenda?: string | null; outcome?: string | null;
  staff: { name: string; department?: { name: string } | null } | null;
};

function Sidebar({ filters, active, toggle, search, setSearch, onClear, result, total }:
  { filters: Array<{ key: string; label: string; opts: string[] }>; active: Record<string, string[]>;
    toggle: (k: string, v: string) => void; search: string; setSearch: (v: string) => void;
    onClear: () => void; result: number; total: number }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const n = Object.values(active).flat().length + (search ? 1 : 0);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5 text-[#1a3d2b]" /> Filters</span>
        <span className="text-[10px] text-gray-400">{result}/{total}</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] bg-white" />
        {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-3 h-3" /></button>}
      </div>
      {filters.map(g => {
        const isOpen = open[g.key] !== false;
        const sel = active[g.key] ?? [];
        return (
          <div key={g.key}>
            <button onClick={() => setOpen(p => ({ ...p, [g.key]: !isOpen }))}
              className="w-full flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 hover:text-gray-700">
              <span>{g.label}{sel.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[9px]">{sel.length}</span>}</span>
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {isOpen && (
              <div className="space-y-1">
                {g.opts.map(opt => (
                  <button key={opt} onClick={() => toggle(g.key, opt)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${sel.includes(opt) ? 'bg-[#1a3d2b] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                    <span className="truncate text-left">{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {n > 0 && <button onClick={onClear} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50"><X className="w-3.5 h-3.5" /> Clear all</button>}
    </div>
  );
}

type Tab = 'events' | 'visits';

export default function EventsClient({ events, visits }: { events: Event[]; visits: Visit[] }) {
  const { tab, search, active, mob, setTab, setSearch, toggleFilter, setMob, clearAll } = useOricEventsFilterStore();

  const toggle = (k: string, v: string) => toggleFilter(k, v);
  const q = search.toLowerCase();
  const uniq = (arr: (string | null | undefined)[]) => [...new Set(arr.filter(Boolean))] as string[];

  const filteredEv = useMemo(() => events.filter(e => {
    if (q && !`${e.title} ${e.category} ${e.venue} ${e.sponsoringAgency}`.toLowerCase().includes(q)) return false;
    if (active.category?.length && !active.category.includes(e.category ?? '')) return false;
    if (active.scope?.length && !active.scope.includes(e.scope ?? '')) return false;
    if (active.arrangedOrParticipated?.length && !active.arrangedOrParticipated.includes(e.arrangedOrParticipated ?? '')) return false;
    return true;
  }), [events, q, active]);

  const filteredVi = useMemo(() => visits.filter(v => {
    if (q && !`${v.visitorName} ${v.visitorOrg} ${v.departmentVisited} ${v.visitType}`.toLowerCase().includes(q)) return false;
    if (active.visitType?.length && !active.visitType.includes(v.visitType ?? '')) return false;
    return true;
  }), [visits, q, active]);

  const filters: Record<Tab, Array<{ key: string; label: string; opts: string[] }>> = {
    events: [
      { key: 'category',               label: 'Category',  opts: uniq(events.map(e => e.category)) },
      { key: 'scope',                   label: 'Scope',     opts: uniq(events.map(e => e.scope)) },
      { key: 'arrangedOrParticipated',  label: 'Type',      opts: uniq(events.map(e => e.arrangedOrParticipated)) },
    ],
    visits: [
      { key: 'visitType', label: 'Visit Type', opts: uniq(visits.map(v => v.visitType)) },
    ],
  };

  const current = tab === 'events' ? filteredEv : filteredVi;
  const total   = tab === 'events' ? events.length : visits.length;
  const n = Object.values(active).flat().length + (search ? 1 : 0);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3d2b] via-[#9f1239] to-[#881337]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
        </div>
        <div className="relative px-6 sm:px-10 py-10">
          <Link href="/oric" className="inline-flex items-center gap-1.5 text-rose-300 hover:text-white text-xs font-semibold mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> ORIC Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-rose-300" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Events &amp; Industrial Visits</h1>
              </div>
              <p className="text-rose-200 text-sm">Outreach events, conferences, and industrial delegations</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {[
                { label: 'Events', value: events.length, color: 'bg-rose-400' },
                { label: 'Visits', value: visits.length, color: 'bg-cyan-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[72px]">
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px] text-rose-200 mt-1">{s.label}</p>
                  <div className={`h-1 ${s.color} rounded-full mt-2 mx-auto w-8`} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-1 mt-7 bg-white/10 rounded-xl p-1 w-fit">
            {([
              { key: 'events' as Tab, label: 'Events & Outreach', icon: CalendarDays, count: events.length },
              { key: 'visits' as Tab, label: 'Industrial Visits', icon: Globe, count: visits.length },
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
      <div className="px-6 sm:px-10 py-8">
        <div className="lg:hidden mb-4">
          <button onClick={() => setMob(!mob)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters {n > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[10px]">{n}</span>}
          </button>
          {mob && <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><Sidebar filters={filters[tab]} active={active} toggle={toggle} search={search} setSearch={setSearch} onClear={clearAll} result={current.length} total={total} /></div>}
        </div>
        <div className="flex gap-7">
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <Sidebar filters={filters[tab]} active={active} toggle={toggle} search={search} setSearch={setSearch} onClear={clearAll} result={current.length} total={total} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">Showing <span className="font-bold text-gray-900">{current.length}</span> of <span className="font-bold">{total}</span>{n > 0 && <span className="ml-2 text-[#2d6a4f] font-semibold">(filtered)</span>}</p>
              {n > 0 && <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-red-500"><X className="w-3.5 h-3.5" /> Clear</button>}
            </div>
            <div className="space-y-3">
              {tab === 'events' && filteredEv.map((e, i) => (
                <OricRecordCard key={e.id} index={i + 1} accentLeft="#e11d48"
                  title={e.title}
                  badges={[
                    e.category ? { text: e.category, cls: 'bg-rose-50 text-rose-700' } : null,
                    e.scope ? { text: e.scope, cls: 'bg-gray-100 text-gray-600' } : null,
                    e.arrangedOrParticipated ? { text: e.arrangedOrParticipated, cls: 'bg-blue-50 text-blue-700' } : null,
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    e.eventDate ? { text: e.eventDate } : null,
                    e.venue ? { text: e.venue } : null,
                    e.participants != null ? { text: `${e.participants} participants` } : null,
                    e.sponsoringAgency ? { text: `Sponsor: ${e.sponsoringAgency}` } : null,
                  ].filter(Boolean) as { text: string }[]}
                  fields={[
                    { label: 'Category', value: e.category },
                    { label: 'Scope', value: e.scope },
                    { label: 'Type', value: e.arrangedOrParticipated },
                    { label: 'Date', value: e.eventDate },
                    { label: 'Venue', value: e.venue },
                    { label: 'Participants', value: e.participants },
                    { label: 'Sponsoring Agency', value: e.sponsoringAgency },
                    { label: 'Subject Area', value: e.subjectArea },
                    { label: 'Organizing Faculty', value: e.staff?.name },
                    { label: 'Department', value: e.staff?.department?.name },
                    { label: 'Outcome', value: e.outcome ?? undefined, full: true },
                  ]}
                />
              ))}
              {tab === 'visits' && filteredVi.map((v, i) => (
                <OricRecordCard key={v.id} index={i + 1} accentLeft="#0891b2"
                  title={v.visitorName}
                  badges={[
                    v.visitType ? { text: v.visitType, cls: 'bg-cyan-50 text-cyan-700' } : null,
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    v.visitorOrg ? { text: v.visitorOrg } : null,
                    v.visitDate ? { text: v.visitDate } : null,
                    v.departmentVisited ? { text: `Dept: ${v.departmentVisited}` } : null,
                  ].filter(Boolean) as { text: string }[]}
                  fields={[
                    { label: 'Organization', value: v.visitorOrg },
                    { label: 'Visit Type', value: v.visitType },
                    { label: 'Visit Date', value: v.visitDate },
                    { label: 'Department Visited', value: v.departmentVisited },
                    { label: 'Coordinator', value: v.staff?.name },
                    { label: 'Agenda', value: v.agenda ?? undefined, full: true },
                    { label: 'Outcome', value: v.outcome ?? undefined, full: true },
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
