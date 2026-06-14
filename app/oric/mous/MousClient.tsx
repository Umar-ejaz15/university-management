'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Handshake, ArrowLeft, MapPin, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import OricRecordCard from '@/components/oric/OricRecordCard';

type Mou = {
  id: string; partyName: string; partyType?: string | null; linkageType?: string | null;
  country?: string | null; scope: string; status?: string | null; duration?: string | null;
  establishmentDate?: string; focalPersonMnsuam?: string | null; focalPersonOther?: string | null;
  scopeOfCollaboration?: string | null; activities?: string | null;
  staff: { name: string; designation?: string | null; department?: { name: string } | null } | null;
};

const STATUS_CLS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Expired: 'bg-gray-100 text-gray-600',
  'Under Renewal': 'bg-amber-100 text-amber-700',
  Terminated: 'bg-red-100 text-red-700',
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
              <span>{g.label}{sel.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[9px] font-bold">{sel.length}</span>}</span>
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

export default function MousClient({ mous }: { mous: Mou[] }) {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Record<string, string[]>>({});
  const [mob, setMob] = useState(false);

  const toggle = (k: string, v: string) => setActive(p => ({ ...p, [k]: (p[k] ?? []).includes(v) ? (p[k] ?? []).filter(x => x !== v) : [...(p[k] ?? []), v] }));
  const clearAll = () => { setActive({}); setSearch(''); };
  const q = search.toLowerCase();
  const uniq = (arr: (string | null | undefined)[]) => [...new Set(arr.filter(Boolean))] as string[];

  const filtered = useMemo(() => mous.filter(m => {
    if (q && !`${m.partyName} ${m.country} ${m.focalPersonMnsuam} ${m.linkageType}`.toLowerCase().includes(q)) return false;
    if (active.status?.length && !active.status.includes(m.status ?? '')) return false;
    if (active.partyType?.length && !active.partyType.includes(m.partyType ?? '')) return false;
    if (active.scope?.length && !active.scope.includes(m.scope)) return false;
    if (active.linkageType?.length && !active.linkageType.includes(m.linkageType ?? '')) return false;
    return true;
  }), [mous, q, active]);

  const filters = [
    { key: 'status',      label: 'Status',       opts: uniq(mous.map(m => m.status)) },
    { key: 'scope',       label: 'Scope',        opts: uniq(mous.map(m => m.scope)) },
    { key: 'partyType',   label: 'Partner Type', opts: uniq(mous.map(m => m.partyType)) },
    { key: 'linkageType', label: 'Linkage Type', opts: uniq(mous.map(m => m.linkageType)) },
  ];

  const active_count = Object.values(active).flat().length + (search ? 1 : 0);
  const active_count2 = Object.values(active).flat().length + (search ? 1 : 0);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3d2b] via-[#3730a3] to-[#1e1b4b]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
        </div>
        <div className="relative px-6 sm:px-10 py-10">
          <Link href="/oric" className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white text-xs font-semibold mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> ORIC Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-indigo-300" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">MoUs &amp; Collaboration Linkages</h1>
              </div>
              <p className="text-indigo-200 text-sm">All Memoranda of Understanding and institutional linkage agreements</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {[
                { label: 'Total', value: mous.length, color: 'bg-indigo-400' },
                { label: 'Active', value: mous.filter(m => m.status === 'Active').length, color: 'bg-emerald-400' },
                { label: 'International', value: mous.filter(m => m.scope === 'INTERNATIONAL').length, color: 'bg-sky-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[72px]">
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px] text-indigo-200 mt-1">{s.label}</p>
                  <div className={`h-1 ${s.color} rounded-full mt-2 mx-auto w-8`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-8">
        <div className="lg:hidden mb-4">
          <button onClick={() => setMob(p => !p)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters {active_count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[10px]">{active_count}</span>}
          </button>
          {mob && <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><Sidebar filters={filters} active={active} toggle={toggle} search={search} setSearch={setSearch} onClear={clearAll} result={filtered.length} total={mous.length} /></div>}
        </div>
        <div className="flex gap-7">
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <Sidebar filters={filters} active={active} toggle={toggle} search={search} setSearch={setSearch} onClear={clearAll} result={filtered.length} total={mous.length} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">Showing <span className="font-bold text-gray-900">{filtered.length}</span> of <span className="font-bold">{mous.length}</span>{active_count2 > 0 && <span className="ml-2 text-[#2d6a4f] font-semibold">(filtered)</span>}</p>
              {active_count2 > 0 && <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"><X className="w-3.5 h-3.5" /> Clear</button>}
            </div>
            <div className="space-y-3">
              {filtered.map((m, i) => (
                <OricRecordCard key={m.id} index={i + 1} accentLeft="#4f46e5"
                  title={m.partyName}
                  badges={[
                    m.status ? { text: m.status, cls: STATUS_CLS[m.status] ?? 'bg-gray-100 text-gray-600' } : null,
                    m.partyType ? { text: m.partyType, cls: 'bg-indigo-50 text-indigo-700' } : null,
                    { text: m.scope, cls: 'bg-gray-100 text-gray-600' },
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    m.country ? { icon: <MapPin className="w-3 h-3" />, text: m.country } : null,
                    m.linkageType ? { text: m.linkageType } : null,
                    m.duration ? { text: `Duration: ${m.duration}` } : null,
                    m.establishmentDate ? { text: `Est. ${m.establishmentDate}` } : null,
                  ].filter(Boolean) as { text: string; icon?: React.ReactNode }[]}
                  fields={[
                    { label: 'Status', value: m.status },
                    { label: 'Party Type', value: m.partyType },
                    { label: 'Linkage Type', value: m.linkageType },
                    { label: 'Country', value: m.country },
                    { label: 'Scope', value: m.scope },
                    { label: 'Duration', value: m.duration },
                    { label: 'MNSUAM Focal Person', value: m.focalPersonMnsuam },
                    { label: 'Partner Focal Person', value: m.focalPersonOther },
                    { label: 'Established', value: m.establishmentDate },
                    { label: 'Coordinating Faculty', value: m.staff?.name },
                    { label: 'Scope of Collaboration', value: m.scopeOfCollaboration ?? undefined, full: true },
                    { label: 'Activities', value: m.activities ?? undefined, full: true },
                  ]}
                />
              ))}
              {filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No MoUs match your filters</p>
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
