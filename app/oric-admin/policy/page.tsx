'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';

interface Policy {
  id: string;
  govtBody: string;
  areaAdvocated?: string | null;
  brief?: string | null;
  coalitionPartners?: string | null;
  advocacyTools?: string | null;
  annexRef?: string | null;
  createdAt: string;
  staff: { name: string; department?: { name: string } | null };
}

async function fetchPolicies() {
  const res = await fetch('/api/oric/policy');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ policies: Policy[] }>;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const areaCls: Record<string, string> = {
  Agriculture:            'bg-emerald-100 text-emerald-700',
  'Economic Development': 'bg-blue-100 text-blue-700',
  Environment:            'bg-teal-100 text-teal-700',
  'Social Progress':      'bg-violet-100 text-violet-700',
  Health:                 'bg-rose-100 text-rose-700',
  Education:              'bg-amber-100 text-amber-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function PolicyPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'policy'], queryFn: fetchPolicies });
  const list = data?.policies ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Policy Advocacy Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Government presentations, policy briefings, and advocacy activities</p>
      </div>

      <div className="px-6 py-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>
        )}

        {data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <FileText className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-semibold text-gray-900">Policy Advocacy Records</h2>
              <span className="ml-auto px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{list.length}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {list.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-gray-400">No policy advocacy records.</p>
              )}
              {list.map((p, i) => (
                <div key={p.id}>
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                  >
                    <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{p.govtBody}</span>
                        {p.areaAdvocated && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${areaCls[p.areaAdvocated] ?? 'bg-gray-100 text-gray-600'}`}>{p.areaAdvocated}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span>Submitted by: <span className="text-gray-700 font-medium">{p.staff.name}</span></span>
                        <span>{fmtDate(p.createdAt)}</span>
                        {p.coalitionPartners && <span>Partners: {p.coalitionPartners}</span>}
                      </div>
                    </div>
                    {expanded === p.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                  </button>

                  {expanded === p.id && (
                    <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Field label="Government Body" value={p.govtBody} />
                        <Field label="Area Advocated" value={p.areaAdvocated} />
                        <Field label="Date Submitted" value={fmtDate(p.createdAt)} />
                        <Field label="Coalition Partners" value={p.coalitionPartners} />
                        <Field label="Annex Reference" value={p.annexRef} />
                        <Field label="Submitted By (Staff)" value={p.staff.name} />
                        {p.staff.department?.name && <Field label="Department" value={p.staff.department.name} />}
                      </div>
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Brief / Summary" value={p.brief} />
                        <Field label="Advocacy Tools Used" value={p.advocacyTools} />
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
