'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, FlaskConical, Sparkles } from 'lucide-react';

interface Visit {
  id: string;
  visitorName: string;
  visitorOrg?: string | null;
  visitDate?: string | null;
  agenda?: string | null;
  departmentVisited?: string | null;
  visitType?: string | null;
  outcome?: string | null;
  proofUrl?: string | null;
  staff: { name: string; department?: { name: string } | null };
}

async function fetchVisits() {
  const res = await fetch('/api/oric/visits');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ visits: Visit[] }>;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const typeCls: Record<string, string> = {
  Industry:   'bg-violet-100 text-violet-700',
  Community:  'bg-teal-100 text-teal-700',
  Government: 'bg-blue-100 text-blue-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function VisitsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'visits'], queryFn: fetchVisits });
  const list = data?.visits ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const byType = list.reduce<Record<string, number>>((acc, v) => {
    const t = v.visitType ?? 'Other';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Industrial Visits Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Industry delegations, government outreach, and community engagement visits</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data.</div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Visits', value: list.length },
                { label: 'Industry', value: byType['Industry'] ?? 0 },
                { label: 'Government', value: byType['Government'] ?? 0 },
                { label: 'Community', value: byType['Community'] ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-indigo-50 rounded-2xl border border-white shadow-sm p-4">
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-semibold text-gray-900">All Industrial Visits</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{list.length}</span>
              </div>

              <div className="divide-y divide-gray-100">
                {list.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-gray-400">No visits on record.</p>
                )}
                {list.map((v, i) => (
                  <div key={v.id}>
                    <button
                      onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                      className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                    >
                      <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{v.visitorName}</span>
                          {v.visitType && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeCls[v.visitType] ?? 'bg-gray-100 text-gray-600'}`}>{v.visitType}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          {v.visitorOrg && <span>{v.visitorOrg}</span>}
                          {v.visitDate && <span>{fmtDate(v.visitDate)}</span>}
                          {v.departmentVisited && <span>Dept: {v.departmentVisited}</span>}
                          <span>Logged by: <span className="text-gray-700 font-medium">{v.staff.name}</span></span>
                        </div>
                      </div>
                      {expanded === v.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                    </button>

                    {expanded === v.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Visitor / Delegation Name" value={v.visitorName} />
                          <Field label="Visitor Organization" value={v.visitorOrg} />
                          <Field label="Visit Type" value={v.visitType} />
                          <Field label="Visit Date" value={fmtDate(v.visitDate)} />
                          <Field label="Department Visited" value={v.departmentVisited} />
                          <Field label="Logged By (PI/Staff)" value={v.staff.name} />
                          {v.staff.department?.name && <Field label="Staff Department" value={v.staff.department.name} />}
                          {v.proofUrl && <Field label="Proof / Document URL" value={v.proofUrl} />}
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Agenda" value={v.agenda} />
                          <Field label="Outcomes" value={v.outcome} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
