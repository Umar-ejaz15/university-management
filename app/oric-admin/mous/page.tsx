'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Handshake, Sparkles } from 'lucide-react';

interface Mou {
  id: string;
  partyName: string;
  linkageType?: string | null;
  partyType?: string | null;
  establishmentDate?: string | null;
  scope: string;
  country?: string | null;
  duration?: string | null;
  status?: string | null;
  focalPersonMnsuam?: string | null;
  focalPersonOther?: string | null;
  scopeOfCollaboration?: string | null;
  activities?: string | null;
  futureInitiatives?: string | null;
  annexRef?: string | null;
  staff: { name: string; department?: { name: string } | null };
}

async function fetchMous() {
  const res = await fetch('/api/oric/mous');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ mous: Mou[] }>;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const statusCls: Record<string, string> = {
  Active:          'bg-emerald-100 text-emerald-700',
  Expired:         'bg-gray-100 text-gray-600',
  'Under Renewal': 'bg-amber-100 text-amber-700',
  Terminated:      'bg-red-100 text-red-700',
};

const partyTypeCls: Record<string, string> = {
  Academia:    'bg-blue-100 text-blue-700',
  Industry:    'bg-violet-100 text-violet-700',
  Government:  'bg-teal-100 text-teal-700',
  'NGO / CSO': 'bg-orange-100 text-orange-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function MousPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'mous'], queryFn: fetchMous });
  const list = data?.mous ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const active = list.filter(m => m.status === 'Active').length;
  const intl = list.filter(m => m.scope === 'INTERNATIONAL').length;

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">MoU &amp; Linkages Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Academic and industry collaboration agreements</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total MoUs', value: list.length },
                { label: 'Active', value: active },
                { label: 'International', value: intl },
              ].map(({ label, value }) => (
                <div key={label} className="bg-violet-50 rounded-2xl border border-white shadow-sm p-4">
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Handshake className="w-5 h-5 text-violet-600" />
                <h2 className="text-base font-semibold text-gray-900">All MoUs &amp; Linkages</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">{list.length}</span>
              </div>

              <div className="divide-y divide-gray-100">
                {list.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-gray-400">No MoUs on record.</p>
                )}
                {list.map((m, i) => (
                  <div key={m.id}>
                    <button
                      onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                      className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                    >
                      <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{m.partyName}</span>
                          {m.status && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls[m.status] ?? 'bg-gray-100 text-gray-600'}`}>{m.status}</span>}
                          {m.partyType && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${partyTypeCls[m.partyType] ?? 'bg-gray-100 text-gray-600'}`}>{m.partyType}</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          {m.country && <span>{m.country}</span>}
                          <span>Scope: {m.scope}</span>
                          {m.establishmentDate && <span>Established: {fmtDate(m.establishmentDate)}</span>}
                          {m.duration && <span>Duration: {m.duration}</span>}
                          <span>PI: <span className="text-gray-700 font-medium">{m.staff.name}</span></span>
                        </div>
                      </div>
                      {expanded === m.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                    </button>

                    {expanded === m.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Party Name" value={m.partyName} />
                          <Field label="Party Type" value={m.partyType} />
                          <Field label="Linkage Type" value={m.linkageType} />
                          <Field label="Country" value={m.country} />
                          <Field label="Scope" value={m.scope} />
                          <Field label="Status" value={m.status} />
                          <Field label="Establishment Date" value={fmtDate(m.establishmentDate)} />
                          <Field label="Duration" value={m.duration} />
                          <Field label="Annex Reference" value={m.annexRef} />
                          <Field label="Focal Person (MNSUAM)" value={m.focalPersonMnsuam} />
                          <Field label="Focal Person (Partner)" value={m.focalPersonOther} />
                          <Field label="PI / Staff" value={m.staff.name} />
                          {m.staff.department?.name && <Field label="Department" value={m.staff.department.name} />}
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <Field label="Scope of Collaboration" value={m.scopeOfCollaboration} />
                          <Field label="Activities" value={m.activities} />
                          <Field label="Future Initiatives" value={m.futureInitiatives} />
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
