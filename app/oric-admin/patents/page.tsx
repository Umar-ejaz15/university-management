'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, ChevronDown, ChevronUp, FileSearch, Shield, Sparkles } from 'lucide-react';

interface StaffInfo {
  name: string;
  designation?: string | null;
  department?: { name: string } | null;
}

interface Patent {
  id: string;
  title: string;
  leadInventor?: string | null;
  designation?: string | null;
  department?: string | null;
  coInventors?: string | null;
  ipCategory?: string | null;
  developmentStatus?: string | null;
  keyAspects?: string | null;
  commercialPartner?: string | null;
  financialSupport?: string | null;
  filedWith?: string | null;
  scope: string;
  filingDate?: string | null;
  applicationNumber?: string | null;
  patentStatus?: string | null;
  annexRef?: string | null;
  ipoLastActionDate?: string | null;
  ipoStatus?: string | null;
  ipoExaminer?: string | null;
  ipoComments?: string | null;
  staff: StaffInfo;
}

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
  staff: StaffInfo;
}

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
  staff: StaffInfo;
}

async function fetchPatents() {
  const res = await fetch('/api/oric/patents');
  if (!res.ok) throw new Error('Failed');
  return res.json() as Promise<{ patents: Patent[]; disclosures: IPDisclosure[]; licensing: IPLicensing[] }>;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const statusColors: Record<string, string> = {
  Granted:              'bg-emerald-100 text-emerald-700',
  'Under Examination':  'bg-amber-100 text-amber-700',
  Published:            'bg-blue-100 text-blue-700',
  Filed:                'bg-gray-100 text-gray-600',
  Rejected:             'bg-red-100 text-red-700',
  'Initial Contact':    'bg-gray-100 text-gray-600',
  'Under Negotiation':  'bg-amber-100 text-amber-700',
  'Agreement Signed':   'bg-emerald-100 text-emerald-700',
  'Production Ready':   'bg-sky-100 text-sky-700',
  Prototype:            'bg-violet-100 text-violet-700',
  Validation:           'bg-teal-100 text-teal-700',
};

function Badge({ label }: { label?: string | null }) {
  if (!label) return <span className="text-gray-400 text-xs">—</span>;
  const cls = statusColors[label] ?? 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value || <span className="italic text-gray-400">Not filled</span>}</p>
    </div>
  );
}

export default function PatentsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['oric', 'patents'], queryFn: fetchPatents });
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#c9a961]" />
          <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">ORIC</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Patents &amp; IP Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Patents, disclosures and licensing with full IPO tracking</p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#1a3d2b]/20 border-t-[#1a3d2b] rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">Failed to load data. Please refresh.</div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Patents',   value: data.patents.length,    icon: <Award className="w-4 h-4 text-amber-600" />,    bg: 'bg-amber-50' },
                { label: 'IP Disclosures',  value: data.disclosures.length, icon: <FileSearch className="w-4 h-4 text-violet-600" />, bg: 'bg-violet-50' },
                { label: 'IP Licensing',    value: data.licensing.length,  icon: <Shield className="w-4 h-4 text-sky-600" />,     bg: 'bg-sky-50' },
              ].map(({ label, value, icon, bg }) => (
                <div key={label} className={`${bg} rounded-2xl border border-white shadow-sm p-4 flex items-center gap-3`}>
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">{icon}</div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Patents */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-semibold text-gray-900">Patents</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{data.patents.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {data.patents.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No patents on record.</p>}
                {data.patents.map((p, i) => (
                  <div key={p.id}>
                    <button onClick={() => toggle(p.id)} className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4">
                      <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{p.title}</span>
                          <Badge label={p.patentStatus} />
                          {p.ipCategory && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{p.ipCategory}</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                          <span>Inventor: <span className="text-gray-700 font-medium">{p.leadInventor ?? p.staff.name}</span></span>
                          <span>Filed with: {p.filedWith ?? '—'}</span>
                          {p.applicationNumber && <span>App No: {p.applicationNumber}</span>}
                          {p.filingDate && <span>{fmtDate(p.filingDate)}</span>}
                        </div>
                      </div>
                      {expanded === p.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
                    </button>
                    {expanded === p.id && (
                      <div className="px-6 pb-6 bg-gray-50/60 border-t border-gray-100">
                        <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          <Field label="Title" value={p.title} />
                          <Field label="IP Category" value={p.ipCategory} />
                          <Field label="Patent Status" value={p.patentStatus} />
                          <Field label="Lead Inventor" value={p.leadInventor ?? p.staff.name} />
                          <Field label="Designation" value={p.designation ?? p.staff.designation} />
                          <Field label="Department" value={p.department ?? p.staff.department?.name} />
                          <Field label="Co-Inventors" value={p.coInventors} />
                          <Field label="Development Status" value={p.developmentStatus} />
                          <Field label="Scope" value={p.scope} />
                          <Field label="Filed With" value={p.filedWith} />
                          <Field label="Filing Date" value={fmtDate(p.filingDate)} />
                          <Field label="Application Number" value={p.applicationNumber} />
                          <Field label="Commercial Partner" value={p.commercialPartner} />
                          <Field label="Financial Support" value={p.financialSupport} />
                          <Field label="Annex Reference" value={p.annexRef} />
                        </div>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Key Aspects / Description" value={p.keyAspects} />
                          <div className="space-y-3">
                            <Field label="IPO Last Action Date" value={fmtDate(p.ipoLastActionDate)} />
                            <Field label="IPO Status" value={p.ipoStatus} />
                            <Field label="IPO Examiner" value={p.ipoExaminer} />
                            <Field label="IPO Comments" value={p.ipoComments} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* IP Disclosures */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <FileSearch className="w-5 h-5 text-violet-600" />
                <h2 className="text-base font-semibold text-gray-900">IP Disclosures</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold">{data.disclosures.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {data.disclosures.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No IP disclosures on record.</p>}
                {data.disclosures.map((d, i) => (
                  <div key={d.id}>
                    <button onClick={() => toggle(d.id)} className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4">
                      <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{d.title}</span>
                          <Badge label={d.developmentStatus} />
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

            {/* IP Licensing */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <Shield className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-semibold text-gray-900">IP Licensing</h2>
                <span className="ml-auto px-2.5 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-semibold">{data.licensing.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {data.licensing.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-400">No licensing records.</p>}
                {data.licensing.map((l, i) => (
                  <div key={l.id}>
                    <button onClick={() => toggle(l.id)} className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-start gap-4">
                      <span className="text-xs text-gray-400 mt-0.5 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{l.title}</span>
                          <Badge label={l.negotiationStatus} />
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
          </>
        )}
      </div>
    </div>
  );
}
