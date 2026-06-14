'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import OricRecordCard from '@/components/oric/OricRecordCard';

type Policy = {
  id: string; govtBody: string; areaAdvocated?: string | null;
  coalitionPartners?: string | null; brief?: string | null;
  advocacyTools?: string | null; createdAt?: string;
  staff: { name: string; designation?: string | null; department?: { name: string } | null } | null;
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

export default function PolicyClient({ policies }: { policies: Policy[] }) {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Record<string, string[]>>({});
  const [mob, setMob] = useState(false);

  const toggle = (k: string, v: string) => setActive(p => ({ ...p, [k]: (p[k] ?? []).includes(v) ? (p[k] ?? []).filter(x => x !== v) : [...(p[k] ?? []), v] }));
  const clearAll = () => { setActive({}); setSearch(''); };
  const q = search.toLowerCase();
  const uniq = (arr: (string | null | undefined)[]) => [...new Set(arr.filter(Boolean))] as string[];

  const filtered = useMemo(() => policies.filter(p => {
    if (q && !`${p.govtBody} ${p.areaAdvocated} ${p.coalitionPartners} ${p.brief}`.toLowerCase().includes(q)) return false;
    if (active.areaAdvocated?.length && !active.areaAdvocated.includes(p.areaAdvocated ?? '')) return false;
    return true;
  }), [policies, q, active]);

  const filters = [
    { key: 'areaAdvocated', label: 'Area Advocated', opts: uniq(policies.map(p => p.areaAdvocated)) },
  ];
  const n = Object.values(active).flat().length + (search ? 1 : 0);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a3d2b] via-[#15803d] to-[#14532d]">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
        </div>
        <div className="relative px-6 sm:px-10 py-10">
          <Link href="/oric" className="inline-flex items-center gap-1.5 text-green-300 hover:text-white text-xs font-semibold mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> ORIC Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-300" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Policy Advocacy</h1>
              </div>
              <p className="text-green-200 text-sm">Government briefings, ministerial engagements and policy proposals</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[72px]">
                <p className="text-xl font-extrabold text-white">{policies.length}</p>
                <p className="text-[10px] text-green-200 mt-1">Total Records</p>
                <div className="h-1 bg-green-400 rounded-full mt-2 mx-auto w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 sm:px-10 py-8">
        <div className="lg:hidden mb-4">
          <button onClick={() => setMob(p => !p)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm">
            <SlidersHorizontal className="w-4 h-4" /> Filters {n > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[10px]">{n}</span>}
          </button>
          {mob && <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><Sidebar filters={filters} active={active} toggle={toggle} search={search} setSearch={setSearch} onClear={clearAll} result={filtered.length} total={policies.length} /></div>}
        </div>
        <div className="flex gap-7">
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <Sidebar filters={filters} active={active} toggle={toggle} search={search} setSearch={setSearch} onClear={clearAll} result={filtered.length} total={policies.length} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">Showing <span className="font-bold text-gray-900">{filtered.length}</span> of <span className="font-bold">{policies.length}</span>{n > 0 && <span className="ml-2 text-[#2d6a4f] font-semibold">(filtered)</span>}</p>
              {n > 0 && <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-red-500"><X className="w-3.5 h-3.5" /> Clear</button>}
            </div>
            <div className="space-y-3">
              {filtered.map((p, i) => (
                <OricRecordCard key={p.id} index={i + 1} accentLeft="#16a34a"
                  title={p.govtBody}
                  badges={[
                    p.areaAdvocated ? { text: p.areaAdvocated, cls: 'bg-green-50 text-green-700' } : null,
                  ].filter(Boolean) as { text: string; cls: string }[]}
                  meta={[
                    p.staff?.name ? { text: p.staff.name } : null,
                    p.staff?.department?.name ? { text: p.staff.department.name } : null,
                    p.createdAt ? { text: p.createdAt } : null,
                  ].filter(Boolean) as { text: string }[]}
                  fields={[
                    { label: 'Govt. Body', value: p.govtBody },
                    { label: 'Area Advocated', value: p.areaAdvocated },
                    { label: 'Coalition Partners', value: p.coalitionPartners },
                    { label: 'Advocacy Tools', value: p.advocacyTools },
                    { label: 'Faculty', value: p.staff?.name },
                    { label: 'Department', value: p.staff?.department?.name },
                    { label: 'Date', value: p.createdAt },
                    { label: 'Brief', value: p.brief ?? undefined, full: true },
                  ]}
                />
              ))}
              {filtered.length === 0 && (
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
