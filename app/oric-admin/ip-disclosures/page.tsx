'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, FileSearch, Sparkles } from 'lucide-react';

interface IPDisclosure {
  id: string;
  title: string;
  leadInventor?: string | null;
  designation?: string | null;
  department?: string | null;
  ipCategory?: string | null;
  developmentStatus?: string | null;
  scope: string;
  keyAspects?: string | null;
  commercialPartner?: string | null;
  financialSupport?: string | null;
  disclosureMadeWith?: string | null;
  previousDisclosure?: string | null;
  annexRef?: string | null;
  createdAt: string;
  staff: { name: string; designation?: string | null; department?: { name: string } | null };
}

async function fetchDisclosures() {
  const res = await fetch('/api/oric/patents');
  if (!res.ok) throw new Error('Failed');
  const data = await res.json();
  return data.disclosures as IPDisclosure[];
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const devCls: Record<string, string> = {
  Idea:               'bg-gray-100 text-gray-600',
  Prototype:          'bg-blue-100 text-blue-700',
  Validation:         'bg-amber-100 text-amber-700',
  'Production Ready': 'bg-emerald-100 text-emerald-700',
  Commercialized:     'bg-violet-100 text-violet-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function IPDisclosuresPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'ip-disclosures'], queryFn: fetchDisclosures });
  const list = data ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">IP Disclosures Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Intellectual property disclosures submitted by faculty</p>
      </div>

      <div className="px-6 py-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" />
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>}

        {data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <FileSearch className="w-5 h-5 text-violet-600" />
              <h2 className="text-base font-semibold text-gray-900">IP Disclosures</h2>
              <span className="ml-auto px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">{list.length}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {list.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No IP disclosures on record.</p>}
              {list.map((d, i) => (
                <div key={d.id}>
                  <button
                    onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                  >
                    <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{d.title}</span>
                        {d.developmentStatus && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${devCls[d.developmentStatus] ?? 'bg-gray-100 text-gray-600'}`}>{d.developmentStatus}</span>
                        )}
                        {d.ipCategory && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{d.ipCategory}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span>Inventor: <span className="text-gray-700 font-medium">{d.leadInventor ?? d.staff.name}</span></span>
                        <span>Scope: {d.scope}</span>
                        <span>{fmtDate(d.createdAt)}</span>
                      </div>
                    </div>
                    {expanded === d.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                  </button>

                  {expanded === d.id && (
                    <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Field label="Title" value={d.title} />
                        <Field label="IP Category" value={d.ipCategory} />
                        <Field label="Development Status" value={d.developmentStatus} />
                        <Field label="Lead Inventor" value={d.leadInventor ?? d.staff.name} />
                        <Field label="Designation" value={d.designation ?? d.staff.designation} />
                        <Field label="Department" value={d.department ?? d.staff.department?.name} />
                        <Field label="Scope" value={d.scope} />
                        <Field label="Commercial Partner" value={d.commercialPartner} />
                        <Field label="Financial Support" value={d.financialSupport} />
                        <Field label="Disclosure Made With" value={d.disclosureMadeWith} />
                        <Field label="Previous Disclosure" value={d.previousDisclosure} />
                        <Field label="Annex Reference" value={d.annexRef} />
                        <Field label="Submitted On" value={fmtDate(d.createdAt)} />
                      </div>
                      <div className="mt-5">
                        <Field label="Key Aspects / Description" value={d.keyAspects} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
