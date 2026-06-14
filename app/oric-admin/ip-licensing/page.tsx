'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Shield, Sparkles } from 'lucide-react';

interface IPLicensing {
  id: string;
  title: string;
  leadInventor?: string | null;
  designationDept?: string | null;
  ipCategory?: string | null;
  developmentStatus?: string | null;
  scope: string;
  keyAspects?: string | null;
  fieldOfUse?: string | null;
  agreementDuration?: string | null;
  negotiationStatus?: string | null;
  licenseeName?: string | null;
  annexRef?: string | null;
  createdAt: string;
  staff: { name: string; designation?: string | null; department?: { name: string } | null };
}

async function fetchLicensing() {
  const res = await fetch('/api/oric/patents');
  if (!res.ok) throw new Error('Failed');
  const data = await res.json();
  return data.licensing as IPLicensing[];
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const negoCls: Record<string, string> = {
  'Initial Contact':   'bg-gray-100 text-gray-600',
  'Under Negotiation': 'bg-amber-100 text-amber-700',
  'Agreement Signed':  'bg-emerald-100 text-emerald-700',
  Terminated:          'bg-red-100 text-red-700',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function IPLicensingPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'ip-licensing'], queryFn: fetchLicensing });
  const list = data ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">IP Licensing Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Technology transfer and licensing agreements managed by ORIC</p>
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
              <Shield className="w-5 h-5 text-sky-600" />
              <h2 className="text-base font-semibold text-gray-900">IP Licensing Records</h2>
              <span className="ml-auto px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold">{list.length}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {list.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No IP licensing records.</p>}
              {list.map((l, i) => (
                <div key={l.id}>
                  <button
                    onClick={() => setExpanded(expanded === l.id ? null : l.id)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4"
                  >
                    <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{l.title}</span>
                        {l.negotiationStatus && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${negoCls[l.negotiationStatus] ?? 'bg-gray-100 text-gray-600'}`}>{l.negotiationStatus}</span>
                        )}
                        {l.ipCategory && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{l.ipCategory}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span>Inventor: <span className="text-gray-700 font-medium">{l.leadInventor ?? l.staff.name}</span></span>
                        {l.licenseeName && <span>Licensee: {l.licenseeName}</span>}
                        <span>Scope: {l.scope}</span>
                        <span>{fmtDate(l.createdAt)}</span>
                      </div>
                    </div>
                    {expanded === l.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                  </button>

                  {expanded === l.id && (
                    <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <Field label="Title" value={l.title} />
                        <Field label="IP Category" value={l.ipCategory} />
                        <Field label="Negotiation Status" value={l.negotiationStatus} />
                        <Field label="Lead Inventor" value={l.leadInventor ?? l.staff.name} />
                        <Field label="Designation / Dept" value={l.designationDept ?? l.staff.designation} />
                        <Field label="Scope" value={l.scope} />
                        <Field label="Development Status" value={l.developmentStatus} />
                        <Field label="Licensee Name" value={l.licenseeName} />
                        <Field label="Field of Use" value={l.fieldOfUse} />
                        <Field label="Agreement Duration" value={l.agreementDuration} />
                        <Field label="Annex Reference" value={l.annexRef} />
                        <Field label="Submitted On" value={fmtDate(l.createdAt)} />
                      </div>
                      <div className="mt-5">
                        <Field label="Key Aspects / Description" value={l.keyAspects} />
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
