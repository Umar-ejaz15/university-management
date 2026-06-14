'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Consultancy {
  id: string;
  title: string;
  clientName?: string | null;
  clientCountry?: string | null;
  clientAddress?: string | null;
  executionDate?: string | null;
  serviceType?: string | null;
  deliverables?: string | null;
  contractValue?: number | null;
  oricOverheadPercent?: number | null;
  oricOverheadAmount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  annexRef?: string | null;
  remarks?: string | null;
  staff: { name: string; designation?: string | null; department?: { name: string } | null };
}

async function fetchConsultancies() {
  const res = await fetch('/api/oric/consultancies');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ consultancies: Consultancy[] }>;
}

function fmtPKR(v?: number | null) {
  if (!v) return '—';
  if (v >= 1_000_000) return `PKR ${(v / 1_000_000).toFixed(2)}M`;
  return `PKR ${Number(v).toLocaleString()}`;
}
function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const statusCls: Record<string, string> = {
  Ongoing:   'bg-emerald-100 text-emerald-700',
  Completed: 'bg-gray-100 text-gray-600',
  Pending:   'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function ConsultanciesPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'consultancies'], queryFn: fetchConsultancies });
  const list = data?.consultancies ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalValue = list.reduce((acc, c) => acc + (Number(c.contractValue) || 0), 0);
  const totalOverhead = list.reduce((acc, c) => acc + (Number(c.oricOverheadAmount) || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Consultancies Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Faculty consultancy agreements executed through ORIC</p>
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
                { label: 'Total Consultancies', value: list.length, sub: '' },
                { label: 'Total Contract Value', value: fmtPKR(totalValue), sub: 'Gross' },
                { label: 'ORIC Overhead Collected', value: fmtPKR(totalOverhead), sub: '10%' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-sky-50 rounded-2xl border border-white shadow-sm p-4">
                  <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{label}</p>
                  {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-semibold text-gray-900">Consultancy Contracts</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold">{list.length}</span>
              </div>

              <div className="divide-y divide-gray-100">
                {list.length === 0 && (
                  <p className="px-6 py-8 text-center text-sm text-gray-400">No consultancies on record.</p>
                )}
                {list.map((c, i) => (
                  <div key={c.id}>
                    <button
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                    >
                      <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{c.title}</span>
                          {c.status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          <span>PI: <span className="text-gray-700 font-medium">{c.staff.name}</span></span>
                          {c.staff.department?.name && <span>Dept: {c.staff.department.name}</span>}
                          {c.clientName && <span>Client: {c.clientName}</span>}
                          <span>Value: <span className="text-gray-700 font-medium">{fmtPKR(c.contractValue)}</span></span>
                          {c.startDate && <span>{fmtDate(c.startDate)} — {fmtDate(c.endDate)}</span>}
                        </div>
                      </div>
                      {expanded === c.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                    </button>

                    {expanded === c.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Title" value={c.title} />
                          <Field label="Service Type" value={c.serviceType} />
                          <Field label="Status" value={c.status} />
                          <Field label="Client Name" value={c.clientName} />
                          <Field label="Client Country" value={c.clientCountry} />
                          <Field label="Client Address" value={c.clientAddress} />
                          <Field label="Execution Date" value={fmtDate(c.executionDate)} />
                          <Field label="Start Date" value={fmtDate(c.startDate)} />
                          <Field label="End Date" value={fmtDate(c.endDate)} />
                          <Field label="Contract Value" value={fmtPKR(c.contractValue)} />
                          <Field label="ORIC Overhead %" value={c.oricOverheadPercent ? `${c.oricOverheadPercent}%` : null} />
                          <Field label="ORIC Overhead Amount" value={fmtPKR(c.oricOverheadAmount)} />
                          <Field label="PI Name" value={c.staff.name} />
                          <Field label="PI Designation" value={c.staff.designation} />
                          <Field label="Department" value={c.staff.department?.name} />
                          <Field label="Annex Reference" value={c.annexRef} />
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Deliverables" value={c.deliverables} />
                          <Field label="Remarks" value={c.remarks} />
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
