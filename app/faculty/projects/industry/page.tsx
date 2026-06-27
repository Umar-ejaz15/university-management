'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

// ── Types ──────────────────────────────────────────────────────────────────
interface CoPI {
  [key: string]: string;
  name: string; designation: string; department: string; faculty: string; email: string; contact: string;
}
interface TeamMember {
  [key: string]: string;
  name: string; designation: string; department: string; role: string;
}

const BLANK_COPI: CoPI = { name: '', designation: '', department: '', faculty: '', email: '', contact: '' };
const BLANK_TEAM: TeamMember = { name: '', designation: '', department: '', role: '' };

// ── Helpers ────────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const input = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all";
const select = `${input} bg-white`;
const textarea = `${input} resize-none`;

function SectionHeader({ letter, title, subtitle, color = 'amber' }: { letter: string; title: string; subtitle?: string; color?: 'amber' | 'green' | 'blue' | 'purple' }) {
  const colors = {
    amber: 'bg-amber-600',
    green: 'bg-[#2d6a4f]',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
  };
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 mb-5">
      <div className={`w-9 h-9 rounded-xl ${colors[color]} text-white text-sm font-bold flex items-center justify-center shrink-0`}>{letter}</div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function IndustryProjectPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Section A — Identification
  const [title, setTitle] = useState('');
  const [projectFileNo, setProjectFileNo] = useState('');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [scope, setScope] = useState('National');
  const [awardDate, setAwardDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Awarded');

  // Section B — PI & Team
  const [coPIs, setCoPIs] = useState<CoPI[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Section C — Sponsor
  const [sponsoringAgency, setSponsoringAgency] = useState('');
  const [sponsorCountry, setSponsorCountry] = useState('Pakistan');
  const [sponsorAddress, setSponsorAddress] = useState('');
  const [counterpartName, setCounterpartName] = useState('');
  const [counterpartCountry, setCounterpartCountry] = useState('');
  const [counterpartAddress, setCounterpartAddress] = useState('');

  // Section D — Financial (budget is ORIC-managed but PI can declare)
  const [declaredBudget, setDeclaredBudget] = useState('');

  // Section E — Deliverables
  const [deliverables, setDeliverables] = useState('');
  const [monitoringPlan, setMonitoringPlan] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Project title is required.'); return; }
    if (!sponsoringAgency.trim()) { setError('Sponsoring agency name is required.'); return; }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          projectKind: 'INDUSTRY',
          scope: scope === 'International' ? 'INTERNATIONAL' : 'NATIONAL',
          fundingAgency: 'Industry',
          funderLocation: scope,
          projectFileNo: projectFileNo.trim() || null,
          financialYear: financialYear.trim() || null,
          awardDate: awardDate || null,
          startDate: startDate || null,
          endDate: endDate || null,
          sponsoringAgency: sponsoringAgency.trim(),
          sponsorCountry: sponsorCountry.trim() || null,
          sponsorAddress: sponsorAddress.trim() || null,
          counterpartName: counterpartName.trim() || null,
          counterpartCountry: counterpartCountry.trim() || null,
          counterpartAddress: counterpartAddress.trim() || null,
          deliverables: deliverables.trim() || null,
          monitoringPlan: monitoringPlan.trim() || null,
          remarks: remarks.trim() || null,
          budgetAmount: declaredBudget ? Number(declaredBudget) : null,
          coPIs,
          teamMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Submission failed.'); return; }
      setSuccess('Industry project submitted for ORIC review!');
      setTimeout(() => router.push('/faculty/edit'), 1500);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-5">
          <Link href="/faculty/edit" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Industry Project — Submission Form</h1>
              <p className="text-sm text-gray-500 mt-0.5">Industry-sponsored research executed through ORIC · Sections A–E</p>
            </div>
          </div>
        </div>
      </div>

      {/* ORIC info banner */}
      <div className="px-6 pt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2 text-sm text-amber-800">
          <span className="w-5 h-5 rounded-full bg-[#2d6a4f] text-white text-xs font-bold flex items-center justify-center shrink-0">✓</span>
          <span><strong>ORIC Admin:</strong> Sections A, C, D (ORIC Overhead &amp; Installments) &nbsp;·&nbsp; <strong>Faculty/PI:</strong> Sections B, E</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-6 space-y-6">

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
            </div>
          )}

          {/* ── Section A: Project Identification ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader letter="A" title="Project Identification" color="amber" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Project Title" required>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Full project title" className={input} />
                </Field>
              </div>
              <Field label="Project File No.">
                <input value={projectFileNo} onChange={(e) => setProjectFileNo(e.target.value)} placeholder="IP-001/2024-25" className={input} />
              </Field>
              <Field label="Financial Year">
                <input value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} placeholder="2024-25" className={input} />
              </Field>
              <Field label="National / International">
                <select value={scope} onChange={(e) => setScope(e.target.value)} className={select}>
                  <option>National</option>
                  <option>International</option>
                </select>
              </Field>
              <Field label="Current Status">
                <select value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} className={select}>
                  {['Awarded', 'Ongoing', 'Completed', 'Submitted', 'Under Review'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Award Date">
                <input type="date" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} className={input} />
              </Field>
              <Field label="Starting Date">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} />
              </Field>
              <Field label="Completion Date">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} />
              </Field>
              <Field label="Declared Total Budget (PKR)">
                <input type="number" min="0" value={declaredBudget} onChange={(e) => setDeclaredBudget(e.target.value)} placeholder="Indicative amount — ORIC will confirm" className={input} />
              </Field>
            </div>
          </div>

          {/* ── Section B: PI & Team ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader letter="B" title="Principal Investigator &amp; Team" color="green" subtitle="Co-PIs and team members for this project" />

            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Co-PI(s)</h4>
            <DynamicTable
              rows={coPIs}
              setRows={setCoPIs}
              blank={BLANK_COPI}
              title="Co-PI"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'designation', label: 'Designation' },
                { key: 'department', label: 'Department' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'contact', label: 'Contact' },
              ]}
            />

            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3 mt-5">Team Members</h4>
            <DynamicTable
              rows={teamMembers}
              setRows={setTeamMembers}
              blank={BLANK_TEAM}
              title="Team Member"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'designation', label: 'Designation' },
                { key: 'department', label: 'Department' },
                { key: 'role', label: 'Role' },
              ]}
            />
          </div>

          {/* ── Section C: Sponsoring Agency ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader letter="C" title="Sponsoring Agency &amp; Industry Partner" color="blue" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sponsoring Agency Name" required>
                <input value={sponsoringAgency} onChange={(e) => setSponsoringAgency(e.target.value)} placeholder="Company / Organization name" className={input} />
              </Field>
              <Field label="Country of Sponsor">
                <input value={sponsorCountry} onChange={(e) => setSponsorCountry(e.target.value)} className={input} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Sponsoring Agency Address">
                  <textarea rows={2} value={sponsorAddress} onChange={(e) => setSponsorAddress(e.target.value)} className={textarea} />
                </Field>
              </div>
              <Field label="Counterpart (Name &amp; Designation)">
                <input value={counterpartName} onChange={(e) => setCounterpartName(e.target.value)} placeholder="e.g. Dr. Ahmed Ali, CEO" className={input} />
              </Field>
              <Field label="Counterpart Country">
                <input value={counterpartCountry} onChange={(e) => setCounterpartCountry(e.target.value)} className={input} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Counterpart Full Address">
                  <textarea rows={2} value={counterpartAddress} onChange={(e) => setCounterpartAddress(e.target.value)} className={textarea} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Section E: Deliverables & Documents ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader letter="E" title="Deliverables, Reports &amp; Documents" color="purple" />
            <div className="space-y-5">
              <Field label="Project Expected Deliverables and Outcomes">
                <RichTextEditor value={deliverables} onChange={setDeliverables} placeholder="List expected deliverables, milestones, and outcomes…" minHeight={120} />
              </Field>
              <Field label="Monitoring Plan">
                <RichTextEditor value={monitoringPlan} onChange={setMonitoringPlan} placeholder="How will progress be monitored and reported?" minHeight={100} />
              </Field>
              <Field label="Remarks">
                <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any additional remarks or special instructions…" className={textarea} />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/faculty/edit" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              ← Back
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-60 transition-colors"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {busy ? 'Submitting…' : 'Submit to ORIC'}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}

// ── Dynamic table component (local copy) ───────────────────────────────────
function DynamicTable<T extends Record<string, string>>({
  rows, setRows, columns, blank, title,
}: {
  rows: T[];
  setRows: (r: T[]) => void;
  columns: { key: keyof T; label: string; type?: string; options?: string[] }[];
  blank: T;
  title: string;
}) {
  const update = (i: number, key: keyof T, val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: val };
    setRows(next);
  };
  const input2 = "w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white";
  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 mb-3">No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="space-y-3 mb-3">
          {rows.map((row, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">#{i + 1}</span>
                <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {columns.map((col) => (
                  <div key={String(col.key)}>
                    <label className="block text-xs text-gray-500 mb-0.5">{col.label}</label>
                    {col.options ? (
                      <select value={row[col.key] as string} onChange={(e) => update(i, col.key, e.target.value)} className={input2}>
                        {col.options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={col.type || 'text'} value={row[col.key] as string} onChange={(e) => update(i, col.key, e.target.value)} className={input2} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setRows([...rows, { ...blank }])}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add {title}
      </button>
    </div>
  );
}
