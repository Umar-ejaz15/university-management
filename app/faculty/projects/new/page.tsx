'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Loader2, CheckCircle2, AlertCircle,
  BookOpen, Users, FlaskConical, Target, Calendar, Globe,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface CoPI {
  [key: string]: string;
  name: string; designation: string; organization: string; contact: string; email: string; type: string;
}
interface TeamMember {
  [key: string]: string;
  name: string; designation: string; department: string; role: string;
}

const BLANK_COPI: CoPI = { name: '', designation: '', organization: 'MNSUAM', contact: '', email: '', type: 'Internal' };
const BLANK_TEAM: TeamMember = { name: '', designation: '', department: '', role: '' };

// ── Field helpers ──────────────────────────────────────────────────────────
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

const input = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition-all";
const select = `${input} bg-white`;
const textarea = `${input} resize-none`;

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ no, title, subtitle }: { no: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[#2d6a4f] text-white text-sm font-bold flex items-center justify-center shrink-0">{no}</div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Dynamic table ──────────────────────────────────────────────────────────
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
                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {columns.map((col) => (
                  <div key={String(col.key)}>
                    <label className="block text-xs text-gray-500 mb-0.5">{col.label}</label>
                    {col.options ? (
                      <select value={row[col.key] as string} onChange={(e) => update(i, col.key, e.target.value)} className={select}>
                        {col.options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={col.type || 'text'} value={row[col.key] as string} onChange={(e) => update(i, col.key, e.target.value)} className={input} />
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d6a4f] border border-[#2d6a4f]/30 rounded-lg hover:bg-[#2d6a4f]/5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add {title}
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ResearchProjectSubmitPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Section 1
  const [title, setTitle] = useState('');
  const [thematicArea, setThematicArea] = useState('');
  const [fundingCallTitle, setFundingCallTitle] = useState('');
  const [dateOfCirculation, setDateOfCirculation] = useState('');
  const [projectCategory, setProjectCategory] = useState('Research');
  const [projectType, setProjectType] = useState('Individual');
  const [funderType, setFunderType] = useState('HEC');
  const [funderLocation, setFunderLocation] = useState('National');
  const [funderCountry, setFunderCountry] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Section 2-3
  const [coPIs, setCoPIs] = useState<CoPI[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Section 12 — Objectives & Work Plan
  const [objectives, setObjectives] = useState('');
  const [methodology, setMethodology] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
  const [deliverables, setDeliverables] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Project title is required.'); return; }
    if (!objectives.trim()) { setError('Project objectives are required.'); return; }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: methodology.trim() || null,
          objectives: objectives.trim(),
          methodology: methodology.trim() || null,
          outcomes: outcomes.trim() || null,
          projectKind: 'RESEARCH',
          scope: funderLocation === 'International' ? 'INTERNATIONAL' : 'NATIONAL',
          thematicArea: thematicArea.trim() || null,
          projectCategory,
          projectType,
          funderType,
          funderLocation,
          funderCountry: funderCountry.trim() || null,
          fundingCallTitle: fundingCallTitle.trim() || null,
          dateOfCirculation: dateOfCirculation || null,
          submissionDeadline: submissionDeadline || null,
          startDate: startDate || null,
          endDate: endDate || null,
          targetBeneficiaries: targetBeneficiaries.trim() || null,
          deliverables: deliverables.trim() || null,
          coPIs,
          teamMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Submission failed.'); return; }
      setSuccess('Research project submitted for ORIC review!');
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
            <div className="w-12 h-12 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#2d6a4f]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research Project — Submission Form</h1>
              <p className="text-sm text-gray-500 mt-0.5">Faculty fills Sections 1–3 &amp; 12 · ORIC completes remaining sections after approval</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-8 space-y-6">

          {/* Status banners */}
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

          {/* ── Section 1: Submission Outline ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader no="1" title="Submission Outline" subtitle="Basic project identification and classification" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Project Title" required>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Full project title" className={input} />
                </Field>
              </div>
              <Field label="Thematic Area">
                <input value={thematicArea} onChange={(e) => setThematicArea(e.target.value)} placeholder="e.g. Climate-Smart Agriculture" className={input} />
              </Field>
              <Field label="Funding Call Title">
                <input value={fundingCallTitle} onChange={(e) => setFundingCallTitle(e.target.value)} placeholder="e.g. HEC NRPU 2024" className={input} />
              </Field>
              <Field label="Date of Circulation">
                <input type="date" value={dateOfCirculation} onChange={(e) => setDateOfCirculation(e.target.value)} className={input} />
              </Field>
              <Field label="Submission Deadline">
                <input type="date" value={submissionDeadline} onChange={(e) => setSubmissionDeadline(e.target.value)} className={input} />
              </Field>
              <Field label="Project Category">
                <select value={projectCategory} onChange={(e) => setProjectCategory(e.target.value)} className={select}>
                  {['Research', 'Development', 'Innovation', 'Extension'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Project Type">
                <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={select}>
                  {['Individual', 'Group', 'Joint', 'International Collaboration'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Funder Type">
                <select value={funderType} onChange={(e) => setFunderType(e.target.value)} className={select}>
                  {['HEC', 'MNSUAM Funded', 'Industry', 'PSRP', 'PSF', 'USAID', 'EU', 'Other International', 'Other'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Funder Location">
                <select value={funderLocation} onChange={(e) => setFunderLocation(e.target.value)} className={select}>
                  {['National', 'International'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              {funderLocation === 'International' && (
                <Field label="Funder Country">
                  <input value={funderCountry} onChange={(e) => setFunderCountry(e.target.value)} placeholder="Country" className={input} />
                </Field>
              )}
              <Field label="Project Start Date">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} />
              </Field>
              <Field label="Project End Date">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} />
              </Field>
            </div>
          </div>

          {/* ── Section 2: Co-PI Information ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader no="2" title="Co-PI Information" subtitle="Add all co-principal investigators" />
            <DynamicTable
              rows={coPIs}
              setRows={setCoPIs}
              blank={BLANK_COPI}
              title="Co-PI"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'designation', label: 'Designation' },
                { key: 'organization', label: 'Organization' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'contact', label: 'Contact' },
                { key: 'type', label: 'Type', options: ['Internal', 'External'] },
              ]}
            />
          </div>

          {/* ── Section 3: Team Scientists ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader no="3" title="Team Scientists / Members" subtitle="Research team members (excluding PI and Co-PIs)" />
            <DynamicTable
              rows={teamMembers}
              setRows={setTeamMembers}
              blank={BLANK_TEAM}
              title="Team Member"
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'designation', label: 'Designation' },
                { key: 'department', label: 'Department' },
                { key: 'role', label: 'Role (e.g. PhD Student)' },
              ]}
            />
          </div>

          {/* ── Section 12: Objectives & Work Plan ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader no="12" title="Project Objectives &amp; Work Plan" subtitle="Academic content — what the project will achieve and how" />
            <div className="space-y-4">
              <Field label="Project Objectives" required>
                <textarea rows={4} value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="List the specific, measurable objectives of the project…" className={textarea} />
              </Field>
              <Field label="Methodology / Work Plan">
                <textarea rows={4} value={methodology} onChange={(e) => setMethodology(e.target.value)} placeholder="Describe the research methodology and work plan…" className={textarea} />
              </Field>
              <Field label="Expected Outcomes &amp; Deliverables">
                <textarea rows={3} value={outcomes} onChange={(e) => setOutcomes(e.target.value)} placeholder="Publications, patents, prototypes, trained human resources…" className={textarea} />
              </Field>
              <Field label="Target Beneficiaries">
                <input value={targetBeneficiaries} onChange={(e) => setTargetBeneficiaries(e.target.value)} placeholder="Who will benefit from this research?" className={input} />
              </Field>
              <Field label="Project Deliverables">
                <textarea rows={2} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="List key deliverables…" className={textarea} />
              </Field>
            </div>
          </div>

          {/* ── ORIC note ── */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Sections 8–19 are completed by ORIC Admin</p>
              <p className="text-blue-600 text-xs">Post-award details, budget breakdown, research staff appointments, reporting schedules, financial &amp; physical review dates, and post-completion assessment will be managed by ORIC after your submission is approved.</p>
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#235a40] disabled:opacity-60 transition-colors"
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
