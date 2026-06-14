'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface FilterConfig {
  key: string;
  label: string;
  options: string[];
  multi?: boolean;
}

export interface StatBadge {
  label: string;
  value: string | number;
  color?: string; // tailwind bg class e.g. 'bg-emerald-500'
}

interface Props {
  title: string;
  subtitle: string;
  stats: StatBadge[];
  filters: FilterConfig[];
  children: (filteredIds: Set<string> | null, search: string) => React.ReactNode;
  // pass all items so the sidebar can count matches
  allItems: Array<{ id: string; [key: string]: unknown }>;
  searchFields: string[]; // field keys to search across
  backHref?: string;
  backLabel?: string;
  icon?: React.ReactNode;
  accentColor?: string; // hex
  siblingLinks?: Array<{ href: string; label: string }>;
}

export default function OricSubPageLayout({
  title, subtitle, stats, filters, children,
  allItems, searchFields, backHref = '/oric', backLabel = 'ORIC Dashboard',
  icon, accentColor = '#1a3d2b', siblingLinks,
}: Props) {
  const [search, setSearch]   = useState('');
  const [active, setActive]   = useState<Record<string, string[]>>({});
  const [open, setOpen]       = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleVal = useCallback((key: string, val: string) => {
    setActive(prev => {
      const cur = prev[key] ?? [];
      return {
        ...prev,
        [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val],
      };
    });
  }, []);

  const clearAll = () => { setActive({}); setSearch(''); };

  const activeCount = Object.values(active).flat().length + (search ? 1 : 0);

  // Compute filtered IDs — null means "show all" (no filter active)
  const filteredIds = useMemo<Set<string> | null>(() => {
    const hasSearch = search.trim().length > 0;
    const hasFilter = Object.values(active).some(v => v.length > 0);
    if (!hasSearch && !hasFilter) return null;

    const q = search.toLowerCase();
    return new Set(
      allItems.filter(item => {
        // search check
        if (hasSearch) {
          const matches = searchFields.some(f => {
            const val = item[f];
            if (typeof val === 'string') return val.toLowerCase().includes(q);
            if (typeof val === 'object' && val !== null) {
              return JSON.stringify(val).toLowerCase().includes(q);
            }
            return false;
          });
          if (!matches) return false;
        }
        // filter check
        for (const [key, vals] of Object.entries(active)) {
          if (!vals.length) continue;
          const itemVal = item[key];
          const strVal = typeof itemVal === 'string' ? itemVal : String(itemVal ?? '');
          if (!vals.includes(strVal)) return false;
        }
        return true;
      }).map(i => i.id)
    );
  }, [search, active, allItems, searchFields]);

  const matchCount = filteredIds === null ? allItems.length : filteredIds.size;

  const FilterPanel = () => (
    <aside className="w-full space-y-5">
      {/* Search */}
      <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search records…"
            className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter groups */}
      {filters.map(f => {
        const isOpen = open[f.key] !== false; // default open
        const selected = active[f.key] ?? [];
        return (
          <div key={f.key}>
            <button
              onClick={() => setOpen(p => ({ ...p, [f.key]: !isOpen }))}
              className="w-full flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 hover:text-gray-700"
            >
              <span>{f.label}{selected.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[9px] font-bold">{selected.length}</span>}</span>
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {isOpen && (
              <div className="space-y-1">
                {f.options.map(opt => {
                  const checked = selected.includes(opt);
                  const count = allItems.filter(i => {
                    const v = i[f.key];
                    return (typeof v === 'string' ? v : String(v ?? '')) === opt;
                  }).length;
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleVal(f.key, opt)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${checked ? 'bg-[#1a3d2b] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <span className="truncate text-left">{opt}</span>
                      <span className={`ml-2 shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${checked ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {activeCount > 0 && (
        <button onClick={clearAll} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors">
          <X className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #2d6a4f 60%, #1e5c3a 100%)` }}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10" />
          <div className="absolute left-1/3 -bottom-10 w-60 h-60 rounded-full bg-[#c9a961]/20" />
        </div>
        <div className="relative px-6 sm:px-10 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5 text-xs">
            <Link href={backHref} className="flex items-center gap-1.5 text-green-300 hover:text-white font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
            </Link>
            {siblingLinks?.map(s => (
              <span key={s.href} className="flex items-center gap-1.5">
                <span className="text-white/30">·</span>
                <Link href={s.href} className="text-green-300 hover:text-white font-semibold transition-colors">{s.label}</Link>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {icon && <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">{icon}</div>}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{title}</h1>
              </div>
              <p className="text-green-200 text-sm leading-relaxed max-w-xl">{subtitle}</p>
            </div>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-3 shrink-0">
              {stats.map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center min-w-[80px]">
                  <p className="text-xl font-extrabold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-green-200 mt-1 font-medium">{s.label}</p>
                  {s.color && <div className={`h-1 ${s.color} rounded-full mt-2 mx-auto w-8`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + content ──────────────────────────────────────────── */}
      <div className="px-6 sm:px-10 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[#1a3d2b] text-white rounded-full text-[10px] font-bold">{activeCount}</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <FilterPanel />
            </div>
          )}
        </div>

        <div className="flex gap-7">
          {/* Left sidebar — desktop */}
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#1a3d2b]" /> Filters
                </span>
                <span className="text-[10px] text-gray-400">{matchCount} result{matchCount !== 1 ? 's' : ''}</span>
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Result count bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-gray-900">{matchCount}</span> of <span className="font-bold">{allItems.length}</span> records
                {activeCount > 0 && <span className="ml-2 text-[#2d6a4f] font-semibold">(filtered)</span>}
              </p>
              {activeCount > 0 && (
                <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {children(filteredIds, search)}

            {matchCount === 0 && (
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
  );
}
