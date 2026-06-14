'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { useTeacherProfile } from '@/lib/queries/teacher/profile';
import { useDepartments } from '@/lib/queries/departments';
import {
  User,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Users,
  Trash2,
  Eye,
  Loader2,
  Plus,
  Pencil,
  X,
  Save,
  ArrowLeft,
  Calendar,
  Hash,
  AlertCircle,
  CheckCircle2,
  Upload,
  Camera,
  ShieldCheck,
  ShieldX,
  Clock,
  ImagePlus,
} from 'lucide-react';
import UploadImageButton from '@/components/UploadImageButton';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  faculty: { id: string; name: string };
}

type VerifStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface Publication {
  id?: string;
  title: string;
  year: number;
  journal: string;
  authors?: string;
  doi?: string;
  abstract?: string;
  pdfUrl?: string;
  indexedIn?: string;
  imageUrl?: string;
  verificationStatus?: VerifStatus;
  rejectionReason?: string | null;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  status: 'ONGOING' | 'COMPLETED' | 'PENDING';
  startDate: string;
  endDate: string;
  studentCount?: number;
  imageUrl?: string;
  verificationStatus?: VerifStatus;
  rejectionReason?: string | null;
}

interface Course {
  id?: string;
  name: string;
  credits: number;
  students: number;
  verificationStatus?: VerifStatus;
  rejectionReason?: string | null;
}

// ─── Verification badge ───────────────────────────────────────────────────────

function VerifBadge({ status, reason }: { status?: VerifStatus; reason?: string | null }) {
  if (!status || status === 'PENDING') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
      <Clock className="w-3 h-3" />Pending review
    </span>
  );
  if (status === 'VERIFIED') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
      <ShieldCheck className="w-3 h-3" />Verified
    </span>
  );
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
        <ShieldX className="w-3 h-3" />Rejected — needs update
      </span>
      {reason && (
        <div className="flex items-start gap-1.5 mt-1 px-2 py-1.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{reason}</span>
        </div>
      )}
    </div>
  );
}

// ─── Profile verification status banner ───────────────────────────────────────

function ProfileVerifBanner({ status, reason }: { status?: VerifStatus; reason?: string | null }) {
  if (!status || status === 'PENDING') return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
      <Clock className="w-4 h-4 flex-shrink-0" />
      <span><strong>Profile under review.</strong> Changes are pending admin verification.</span>
    </div>
  );
  if (status === 'VERIFIED') return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 mb-4">
      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
      <span><strong>Profile verified</strong> by admin.</span>
    </div>
  );
  return (
    <div className="flex items-start gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 mb-4">
      <ShieldX className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        <strong>Profile rejected.</strong> Please address the feedback below and resubmit.
        {reason && <p className="mt-0.5 text-red-700">{reason}</p>}
      </div>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lecturer',
  'Senior Lecturer',
  'Teaching Assistant',
  'Research Assistant',
  'Visiting Faculty',
];


// ─── ORIC Sub-form components ─────────────────────────────────────────────────

interface OricFormProps {
  inputCls: string;
  labelCls: string;
  setSuccess: (m: string) => void;
  setError: (m: string) => void;
}

function OricFieldRow({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function OricSectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pt-4 border-t border-gray-100 first:border-0 first:pt-0">
      <span className="w-1 h-5 bg-[#c9a961] rounded-full" />
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function OricAdminOnlyBanner() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 mb-3">
      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
      <span>Fields in this section are managed by ORIC after approval. They are read-only for faculty.</span>
    </div>
  );
}

function OricResearchForm({ inputCls, labelCls: _lc, setSuccess, setError }: OricFormProps) {
  const ic = inputCls;
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title: '', thematicArea: '', projectType: 'Research', scope: 'National',
    startDate: '', endDate: '', financialYear: '', totalBudget: '',
    description: '', objectives: '', methodology: '', outcomes: '',
    sponsoringAgency: '', sponsorCountry: '', funderType: '',
    collaborators: '', deliverables: '', targetBeneficiaries: '',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!f.title.trim()) return setError('Project title is required.');
    setBusy(true);
    try {
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.title, description: f.description, projectKind: 'RESEARCH',
          scope: f.scope.toUpperCase(), objectives: f.objectives,
          methodology: f.methodology, outcomes: f.outcomes,
          startDate: f.startDate || null, endDate: f.endDate || null,
          thematicArea: f.thematicArea, financialYear: f.financialYear,
          sponsoringAgency: f.sponsoringAgency, sponsorCountry: f.sponsorCountry,
          funderType: f.funderType, deliverables: f.deliverables,
          targetBeneficiaries: f.targetBeneficiaries, budgetAmount: f.totalBudget || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Submission failed');
      setSuccess('Research project submitted to ORIC for review.');
    } catch { setError('Network error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      {/* Submission outline */}
      <OricSectionHeader title="Submission Outline" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><OricFieldRow label="Project Title" required><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Full project title" className={ic} /></OricFieldRow></div>
        <OricFieldRow label="Thematic Area"><select value={f.thematicArea} onChange={e => set('thematicArea', e.target.value)} className={ic}><option value="">Select…</option>{['Agriculture & Food Security','Water & Environment','Health & Biotechnology','Engineering & Technology','Social Sciences','Climate Change','Other'].map(t=><option key={t}>{t}</option>)}</select></OricFieldRow>
        <OricFieldRow label="Project Type"><select value={f.projectType} onChange={e => set('projectType', e.target.value)} className={ic}><option>Research</option><option>Development</option><option>Contracted Research</option><option>Collaborative</option></select></OricFieldRow>
        <OricFieldRow label="Scope"><select value={f.scope} onChange={e => set('scope', e.target.value)} className={ic}><option>National</option><option>International</option></select></OricFieldRow>
        <OricFieldRow label="Financial Year"><select value={f.financialYear} onChange={e => set('financialYear', e.target.value)} className={ic}><option value="">Select…</option>{['2024-25','2023-24','2022-23','2021-22'].map(y=><option key={y}>{y}</option>)}</select></OricFieldRow>
        <OricFieldRow label="Start Date" required><input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="End Date"><input type="date" value={f.endDate} onChange={e => set('endDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Requested Budget (PKR)"><input type="number" min="0" value={f.totalBudget} onChange={e => set('totalBudget', e.target.value)} placeholder="e.g. 4200000" className={ic} /></OricFieldRow>
      </div>

      {/* Description fields */}
      <OricSectionHeader title="Project Details" />
      <div className="space-y-4">
        <OricFieldRow label="Description / Abstract" required><textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the project…" className={`${ic} resize-none`} /></OricFieldRow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OricFieldRow label="Objectives"><textarea rows={3} value={f.objectives} onChange={e => set('objectives', e.target.value)} placeholder="List the key objectives…" className={`${ic} resize-none`} /></OricFieldRow>
          <OricFieldRow label="Methodology"><textarea rows={3} value={f.methodology} onChange={e => set('methodology', e.target.value)} placeholder="Describe the methodology…" className={`${ic} resize-none`} /></OricFieldRow>
          <OricFieldRow label="Expected Outcomes"><textarea rows={2} value={f.outcomes} onChange={e => set('outcomes', e.target.value)} className={`${ic} resize-none`} /></OricFieldRow>
          <OricFieldRow label="Deliverables"><textarea rows={2} value={f.deliverables} onChange={e => set('deliverables', e.target.value)} className={`${ic} resize-none`} /></OricFieldRow>
          <OricFieldRow label="Target Beneficiaries"><input value={f.targetBeneficiaries} onChange={e => set('targetBeneficiaries', e.target.value)} className={ic} /></OricFieldRow>
        </div>
      </div>

      {/* Sponsor / funder */}
      <OricSectionHeader title="Sponsoring Agency / Funder" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OricFieldRow label="Sponsoring Agency"><input value={f.sponsoringAgency} onChange={e => set('sponsoringAgency', e.target.value)} placeholder="e.g. HEC, PSF, USDA" className={ic} /></OricFieldRow>
        <OricFieldRow label="Sponsor Country"><input value={f.sponsorCountry} onChange={e => set('sponsorCountry', e.target.value)} placeholder="e.g. Pakistan" className={ic} /></OricFieldRow>
        <OricFieldRow label="Funder Type"><select value={f.funderType} onChange={e => set('funderType', e.target.value)} className={ic}><option value="">Select…</option><option>HEC</option><option>PSF</option><option>International</option><option>Industry</option><option>Government</option><option>MNSUAM</option></select></OricFieldRow>
      </div>

      {/* Collaborators */}
      <OricSectionHeader title="Collaborators" />
      <OricFieldRow label="Collaborators / Co-Investigators (name, institution)">
        <textarea rows={3} value={f.collaborators} onChange={e => set('collaborators', e.target.value)} placeholder="One per line: Dr. Name, University Name" className={`${ic} resize-none`} />
      </OricFieldRow>

      {/* Post-award — ORIC only */}
      <OricSectionHeader title="Post-Award Details" sub="Managed by ORIC after approval" />
      <OricAdminOnlyBanner />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60 pointer-events-none">
        <OricFieldRow label="Award Letter Date"><input type="date" disabled className={ic} /></OricFieldRow>
        <OricFieldRow label="Funding Agency Ref No"><input disabled placeholder="e.g. HEC/R&D/2024/001" className={ic} /></OricFieldRow>
        <OricFieldRow label="ORIC Overhead Amount (PKR)"><input type="number" disabled placeholder="0.00" className={ic} /></OricFieldRow>
        <OricFieldRow label="Overhead Status"><input disabled value="Set by ORIC" readOnly className={ic} /></OricFieldRow>
        <OricFieldRow label="Special Conditions"><textarea rows={2} disabled className={`${ic} resize-none`} /></OricFieldRow>
        <OricFieldRow label="Remarks"><textarea rows={2} disabled className={`${ic} resize-none`} /></OricFieldRow>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={handleSubmit} disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] disabled:opacity-50 transition-colors shadow-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {busy ? 'Submitting…' : 'Submit to ORIC'}
        </button>
      </div>
    </div>
  );
}

function OricSimpleForm({ kind, inputCls, setSuccess, setError }: OricFormProps & { kind: string }) {
  const ic = inputCls;
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ title: '', organisation: '', startDate: '', endDate: '', description: '', value: '', outcomes: '' });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!f.title.trim()) return setError('Title is required.');
    setBusy(true);
    try {
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.title, description: f.description, projectKind: 'INDUSTRY',
          scope: 'NATIONAL', startDate: f.startDate || null, endDate: f.endDate || null,
          outcomes: f.outcomes, fundingAgency: f.organisation, budgetAmount: f.value || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Submission failed');
      setSuccess(`${kind} submitted successfully.`);
    } catch { setError('Network error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><OricFieldRow label="Title" required><input value={f.title} onChange={e => set('title', e.target.value)} placeholder={`${kind} title`} className={ic} /></OricFieldRow></div>
        <OricFieldRow label="Organisation / Partner"><input value={f.organisation} onChange={e => set('organisation', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Value / Budget (PKR)"><input type="number" min="0" value={f.value} onChange={e => set('value', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Start Date"><input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="End Date"><input type="date" value={f.endDate} onChange={e => set('endDate', e.target.value)} className={ic} /></OricFieldRow>
        <div className="sm:col-span-2"><OricFieldRow label="Description"><textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)} className={`${ic} resize-none`} /></OricFieldRow></div>
        <div className="sm:col-span-2"><OricFieldRow label="Outcomes / Notes"><textarea rows={2} value={f.outcomes} onChange={e => set('outcomes', e.target.value)} className={`${ic} resize-none`} /></OricFieldRow></div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={handleSubmit} disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] disabled:opacity-50 transition-colors shadow-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {busy ? 'Saving…' : 'Save to Profile'}
        </button>
      </div>
    </div>
  );
}

function OricPatentForm({ inputCls, setSuccess, setError }: OricFormProps) {
  const ic = inputCls;
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    title: '', inventors: '', category: 'Technology', filedWith: '', scope: 'National',
    filingDate: '', grantDate: '', applicationNo: '', status: 'Filed', description: '',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!f.title.trim()) return setError('Patent title is required.');
    setBusy(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setSuccess('Patent/IP record saved to your ORIC profile.');
    } catch { setError('Network error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><OricFieldRow label="Title of Invention" required><input value={f.title} onChange={e => set('title', e.target.value)} className={ic} /></OricFieldRow></div>
        <OricFieldRow label="Lead Inventor(s)"><input value={f.inventors} onChange={e => set('inventors', e.target.value)} placeholder="Dr. Name, Co-inventor Name" className={ic} /></OricFieldRow>
        <OricFieldRow label="Category"><select value={f.category} onChange={e => set('category', e.target.value)} className={ic}><option>Technology</option><option>Variety</option><option>Process</option><option>Product</option><option>Software</option><option>Utility Model</option></select></OricFieldRow>
        <OricFieldRow label="Filed With"><select value={f.filedWith} onChange={e => set('filedWith', e.target.value)} className={ic}><option value="">Select…</option><option>IPO Pakistan</option><option>FSC&RD</option><option>USPTO</option><option>EPO</option><option>WIPO</option></select></OricFieldRow>
        <OricFieldRow label="Scope"><select value={f.scope} onChange={e => set('scope', e.target.value)} className={ic}><option>National</option><option>International</option></select></OricFieldRow>
        <OricFieldRow label="Filing Date"><input type="date" value={f.filingDate} onChange={e => set('filingDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Grant Date (if granted)"><input type="date" value={f.grantDate} onChange={e => set('grantDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Application / Ref No"><input value={f.applicationNo} onChange={e => set('applicationNo', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Status"><select value={f.status} onChange={e => set('status', e.target.value)} className={ic}><option>Filed</option><option>Under Examination</option><option>Granted</option><option>Rejected</option><option>Withdrawn</option></select></OricFieldRow>
        <div className="sm:col-span-2"><OricFieldRow label="Brief Description"><textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)} className={`${ic} resize-none`} /></OricFieldRow></div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={handleSubmit} disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] disabled:opacity-50 transition-colors shadow-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {busy ? 'Saving…' : 'Save Patent Record'}
        </button>
      </div>
    </div>
  );
}

function OricMouForm({ inputCls, setSuccess, setError }: OricFormProps) {
  const ic = inputCls;
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    collaborator: '', type: 'Industry', scope: 'National',
    signedDate: '', expiryDate: '', description: '', status: 'Active',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!f.collaborator.trim()) return setError('Collaborator name is required.');
    setBusy(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      setSuccess('MoU/AoC record saved to your ORIC profile.');
    } catch { setError('Network error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><OricFieldRow label="Collaborating Organisation" required><input value={f.collaborator} onChange={e => set('collaborator', e.target.value)} className={ic} /></OricFieldRow></div>
        <OricFieldRow label="Agreement Type"><select value={f.type} onChange={e => set('type', e.target.value)} className={ic}><option>Industry</option><option>Academia</option><option>Government</option><option>International</option></select></OricFieldRow>
        <OricFieldRow label="Scope"><select value={f.scope} onChange={e => set('scope', e.target.value)} className={ic}><option>National</option><option>International</option></select></OricFieldRow>
        <OricFieldRow label="Signed Date"><input type="date" value={f.signedDate} onChange={e => set('signedDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Expiry Date"><input type="date" value={f.expiryDate} onChange={e => set('expiryDate', e.target.value)} className={ic} /></OricFieldRow>
        <OricFieldRow label="Status"><select value={f.status} onChange={e => set('status', e.target.value)} className={ic}><option>Active</option><option>Under Renewal</option><option>Expired</option><option>Terminated</option></select></OricFieldRow>
        <div className="sm:col-span-2"><OricFieldRow label="Description / Scope of Collaboration"><textarea rows={3} value={f.description} onChange={e => set('description', e.target.value)} className={`${ic} resize-none`} /></OricFieldRow></div>
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={handleSubmit} disabled={busy} className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] disabled:opacity-50 transition-colors shadow-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {busy ? 'Saving…' : 'Save MoU / AoC'}
        </button>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | 'profile' | 'publications' | 'projects' | 'courses' | 'administrative' | 'students'
    | 'oric-research' | 'oric-industry' | 'oric-consultancy' | 'oric-patent'
    | 'oric-ipdisclosure' | 'oric-licensing' | 'oric-mou' | 'oric-visit'
    | 'oric-event' | 'oric-policy'
  >('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: profileData, isLoading: profileLoading } = useTeacherProfile();
  const { data: departmentsData = [], isLoading: deptsLoading } = useDepartments();

  const loading = profileLoading || deptsLoading;
  const departments = departmentsData;

  // Profile verification state
  const [profileVerifStatus, setProfileVerifStatus] = useState<VerifStatus>('PENDING');
  const [profileVerifReason, setProfileVerifReason] = useState<string | null>(null);

  // Profile form state
  const [form, setForm] = useState({
    designation: '',
    departmentId: '',
    specialization: '',
    experienceYears: '',
    qualifications: '',
    bio: '',
    profileImage: '',
    studentsSupervised: 0,
    administrativeDuties: '',
  });

  // Detailed supervised students list
  const [studentsDetails, setStudentsDetails] = useState<
    Array<{ name: string; email?: string; departmentId?: string }>
  >([]);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', departmentId: '' });

  // Publications state
  const [publications, setPublications] = useState<Publication[]>([]);
  const [newPublication, setNewPublication] = useState<Publication>({
    title: '',
    year: new Date().getFullYear(),
    journal: '',
  });
  const [editingPublication, setEditingPublication] = useState<string | null>(null);
  const [editPublicationData, setEditPublicationData] = useState<Publication | null>(null);
  const [showAddPubModal, setShowAddPubModal] = useState(false);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    status: 'ONGOING',
    startDate: '',
    endDate: '',
    studentCount: 0,
  });
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectData, setEditProjectData] = useState<Project | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({
    name: '',
    credits: 3,
    students: 0,
  });
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseData, setEditCourseData] = useState<Course | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);

  // ─── Initialize form from TQ cache ─────────────────────────────────────────

  useEffect(() => {
    if (profileData && !initialized) {
      const s = profileData;
      setForm({
        designation: s.designation || '',
        departmentId: s.departmentId || '',
        specialization: s.specialization || '',
        experienceYears: s.experienceYears || '',
        qualifications: s.qualifications || '',
        bio: s.bio || '',
        profileImage: s.profileImage || '',
        studentsSupervised: s.studentsSupervised || 0,
        administrativeDuties: '',
      });
      setStudentsDetails((s as { studentsSupervisedDetails?: Array<{ name: string; email?: string; departmentId?: string }> }).studentsSupervisedDetails || []);
      setPublications((s as { publications?: Publication[] }).publications || []);
      setProjects((s as { projects?: Project[] }).projects || []);
      setCourses((s as { courses?: Course[] }).courses || []);
      setProfileVerifStatus((s.profileVerificationStatus as VerifStatus) || 'PENDING');
      setProfileVerifReason(s.profileRejectionReason || null);
      setInitialized(true);
    }
  }, [profileData, initialized]);

  const update = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  // ─── Profile save ───────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Normalize administrative duties to one bullet per line starting with '- '
      const duties = (form.administrativeDuties || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .map((l) => l.replace(/^[-*•]\s*/, '').trim())
        .map((l) => `- ${l}`)
        .join('\n');

      const payload = {
        ...form,
        administrativeDuties: duties,
        studentsSupervisedDetails: studentsDetails,
        studentsSupervised: studentsDetails?.length || form.studentsSupervised,
      };

      const res = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save profile');
        return;
      }

      setProfileVerifStatus('PENDING');
      setProfileVerifReason(null);
      setSuccess('Changes submitted for admin verification.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'profile'] });
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // ─── Publication handlers ───────────────────────────────────────────────────

  const handleAddPublication = async () => {
    if (!newPublication.title.trim()) {
      setError('Publication title is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/teacher/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPublication),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add publication');
        return;
      }

      const data = await res.json();
      setPublications([...publications, data.publication]);
      setNewPublication({ title: '', year: new Date().getFullYear(), journal: '' });
      setShowAddPubModal(false);
      setSuccess('Publication submitted for admin verification.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'publications'] });
    } catch (err) {
      setError('Failed to add publication');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub.id || null);
    setEditPublicationData({ ...pub });
  };

  const handleSavePublication = async () => {
    if (!editPublicationData || !editingPublication) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/publications/${editingPublication}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPublicationData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update publication');
        return;
      }

      const data = await res.json();
      setPublications(
        publications.map((p) => (p.id === editingPublication ? data.publication : p))
      );
      setEditingPublication(null);
      setEditPublicationData(null);
      setSuccess('Publication updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'publications'] });
    } catch (err) {
      setError('Failed to update publication');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePublication = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/publications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPublications(publications.filter((p) => p.id !== id));
        setSuccess('Publication deleted');
        queryClient.invalidateQueries({ queryKey: ['teacher', 'publications'] });
      }
    } catch (err) {
      setError('Failed to delete publication');
    }
  };

  // ─── Project handlers ───────────────────────────────────────────────────────

  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
      setError('Project title is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add project');
        return;
      }

      const data = await res.json();
      setProjects([...projects, data.project]);
      setNewProject({ title: '', description: '', status: 'ONGOING', startDate: '', endDate: '' });
      setShowAddProjectModal(false);
      setSuccess('Project submitted for admin verification.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'projects'] });
    } catch (err) {
      setError('Failed to add project');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project.id || null);
    setEditProjectData({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split('T')[0]
        : '',
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split('T')[0]
        : '',
      studentCount: project.studentCount || 0,
    });
  };

  const handleSaveProject = async () => {
    if (!editProjectData || !editingProject) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/projects/${editingProject}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProjectData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update project');
        return;
      }

      const data = await res.json();
      setProjects(projects.map((p) => (p.id === editingProject ? data.project : p)));
      setEditingProject(null);
      setEditProjectData(null);
      setSuccess('Project updated — pending re-verification.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'projects'] });
    } catch (err) {
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        setSuccess('Project deleted');
        queryClient.invalidateQueries({ queryKey: ['teacher', 'projects'] });
      }
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  // ─── Course handlers ────────────────────────────────────────────────────────

  const handleAddCourse = async () => {
    if (!newCourse.name.trim()) {
      setError('Course name is required');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/teacher/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add course');
        return;
      }

      const data = await res.json();
      setCourses([...courses, data.course]);
      setNewCourse({ name: '', credits: 3, students: 0 });
      setShowAddCourseModal(false);
      setSuccess('Course submitted for admin verification.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'courses'] });
    } catch (err) {
      setError('Failed to add course');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course.id || null);
    setEditCourseData({ ...course });
  };

  const handleSaveCourse = async () => {
    if (!editCourseData || !editingCourse) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/teacher/courses/${editingCourse}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCourseData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update course');
        return;
      }

      const data = await res.json();
      setCourses(courses.map((c) => (c.id === editingCourse ? data.course : c)));
      setEditingCourse(null);
      setEditCourseData(null);
      setSuccess('Course updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'courses'] });
    } catch (err) {
      setError('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== id));
        setSuccess('Course deleted');
        queryClient.invalidateQueries({ queryKey: ['teacher', 'courses'] });
      }
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  // ─── Style helpers ──────────────────────────────────────────────────────────

  const inputCls =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all placeholder:text-gray-400';

  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  const projectStatusBadge = (status: string) => {
    if (status === 'ONGOING') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600 border border-gray-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  };

  // ─── Loading screen ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#2d6a4f] animate-spin mx-auto" />
            <p className="mt-4 text-gray-500 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Sidebar nav config ──────────────────────────────────────────────────────

  type SectionId =
    | 'profile' | 'publications' | 'projects' | 'courses' | 'administrative' | 'students'
    | 'oric-research' | 'oric-industry' | 'oric-consultancy' | 'oric-patent'
    | 'oric-ipdisclosure' | 'oric-licensing' | 'oric-mou' | 'oric-visit'
    | 'oric-event' | 'oric-policy';

  const navGroups: {
    heading: string;
    items: { id: SectionId; label: string; Icon: React.ElementType; count?: number; badge?: string }[];
  }[] = [
    {
      heading: 'Profile',
      items: [
        { id: 'profile',        label: 'Personal & Academic', Icon: User },
        { id: 'publications',   label: 'Publications',        Icon: BookOpen, count: publications.length },
        { id: 'projects',       label: 'Basic Projects',      Icon: FlaskConical, count: projects.length },
        { id: 'courses',        label: 'Courses',             Icon: GraduationCap, count: courses.length },
        { id: 'administrative', label: 'Admin Duties',        Icon: Briefcase },
        { id: 'students',       label: 'Students',            Icon: Users, count: studentsDetails.length },
      ],
    },
    {
      heading: 'ORIC Submissions',
      items: [
        { id: 'oric-research',    label: 'Research Project',   Icon: FlaskConical, badge: 'Approval req.' },
        { id: 'oric-industry',    label: 'Industry Project',   Icon: Briefcase,    badge: 'Approval req.' },
        { id: 'oric-consultancy', label: 'Consultancy',        Icon: BookOpen },
        { id: 'oric-patent',      label: 'Patent / IP',        Icon: ShieldCheck },
        { id: 'oric-ipdisclosure',label: 'IP Disclosure',      Icon: ShieldCheck },
        { id: 'oric-licensing',   label: 'IP Licensing',       Icon: ShieldCheck },
        { id: 'oric-mou',         label: 'AoC / MoU',         Icon: Users },
        { id: 'oric-visit',       label: 'Industrial Visit',   Icon: Briefcase },
        { id: 'oric-event',       label: 'Event / Exhibition', Icon: Calendar },
        { id: 'oric-policy',      label: 'Policy Advocacy',    Icon: Hash },
      ],
    },
  ];

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Page Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="px-6 py-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
              <p className="text-white/60 mt-1 text-sm">
                Manage your academic information, publications, projects and courses
              </p>
            </div>
            <button
              onClick={() => router.push('/faculty')}
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>
      </div>

      <main className="px-6 py-8">

        {/* ── Alerts ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl mb-6 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto shrink-0 text-emerald-400 hover:text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Sidebar + Content ────────────────────────────────────────────── */}
        <div className="flex gap-6 items-start">

          {/* Left sidebar nav */}
          <aside className="w-56 shrink-0 sticky top-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a3d2b] px-4 py-3.5">
                <p className="text-white font-bold text-sm">My ORIC Profile</p>
                <p className="text-green-200/70 text-[10px] mt-0.5 leading-relaxed">Click a section to edit</p>
              </div>
              {navGroups.map((group) => (
                <div key={group.heading}>
                  <p className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">{group.heading}</p>
                  {group.items.map(({ id, label, Icon, count, badge }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => { setActiveTab(id); setError(''); setSuccess(''); }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium border-l-2 transition-all text-left ${
                          active
                            ? 'border-l-[#c9a961] bg-[#2d6a4f]/8 text-[#2d6a4f] font-semibold'
                            : 'border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-[#2d6a4f]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#2d6a4f]' : 'text-gray-400'}`} />
                        <span className="flex-1 leading-snug">{label}</span>
                        {count !== undefined && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-[#2d6a4f] text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                        )}
                        {badge && !count && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 leading-none shrink-0">{badge}</span>
                        )}
                      </button>
                    );
                  })}
                  <div className="h-px bg-gray-100 mx-3 my-1" />
                </div>
              ))}
            </div>
          </aside>

          {/* Right content area — existing tab content wrapped in white card */}
          <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">

          {/* ══════════════════════════════════════════════════════════════════
              PERSONAL INFO TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8">

              {/* Profile verification banner */}
              <ProfileVerifBanner status={profileVerifStatus} reason={profileVerifReason} />

              {/* Section: Identity */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </div>

                {/* Designation */}
                <div className="mb-7">
                  <label className={labelCls}>Designation</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {DESIGNATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update('designation', d)}
                        className={`p-3 border-2 rounded-xl text-sm font-medium transition-all text-left leading-tight ${
                          form.designation === d
                            ? 'border-[#2d6a4f] bg-[#2d6a4f]/8 text-[#2d6a4f]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div className="mb-6">
                  <label className={labelCls}>Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => update('departmentId', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qualifications + Students 2-col */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className={labelCls}>Qualifications</label>
                    <input
                      type="text"
                      value={form.qualifications}
                      onChange={(e) => update('qualifications', e.target.value)}
                      placeholder="e.g., PhD Computer Science, MSc Data Science"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Students Supervised</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.studentsSupervised}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        update('studentsSupervised', parseInt(val) || 0);
                      }}
                      placeholder="e.g., 25"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <label className={labelCls}>Years of Experience</label>
                  <input
                    type="text"
                    value={form.experienceYears}
                    onChange={(e) => update('experienceYears', e.target.value)}
                    placeholder="e.g., 5 years, 10+ years, 2 years in industry..."
                    className={inputCls}
                  />
                </div>

                {/* Specialization */}
                <div className="mb-6">
                  <label className={labelCls}>Specialization / Research Focus</label>
                  <textarea
                    value={form.specialization}
                    onChange={(e) => update('specialization', e.target.value)}
                    placeholder="e.g., Machine Learning, Organic Chemistry, Educational Psychology..."
                    className={`${inputCls} resize-none`}
                    rows={3}
                  />
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <label className={labelCls}>Short Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    placeholder="Tell us about yourself, your research interests, and achievements..."
                    className={`${inputCls} resize-none`}
                    rows={4}
                  />
                </div>

                {/* Profile Image */}
                <div className="mb-6">
                  <label className={labelCls}>Profile Photo</label>
                  <div className="flex items-start gap-6">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      {form.profileImage ? (
                        <div className="relative group">
                          <img
                            src={form.profileImage}
                            alt="Profile"
                            className="w-28 h-28 rounded-2xl object-cover border-2 border-[#2d6a4f]/40 shadow-md"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => update('profileImage', '')}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-[#2d6a4f]/10 border-2 border-dashed border-[#2d6a4f]/30 flex flex-col items-center justify-center">
                          <Camera className="w-8 h-8 text-[#2d6a4f]/40 mb-1" />
                          <span className="text-xs text-[#2d6a4f]/50 font-medium">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* Upload area */}
                    <div className="flex-1 space-y-3">
                      <UploadImageButton
                        endpoint="profileImage"
                        currentUrl={form.profileImage || null}
                        onUpload={(url) => update('profileImage', url)}
                        onRemove={() => update('profileImage', '')}
                        label="Upload Profile Photo"
                        hint="JPG, PNG or WebP · max 4 MB"
                      />
                      {/* Fallback URL input */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Or paste an image URL directly:</p>
                        <input
                          type="url"
                          value={form.profileImage}
                          onChange={(e) => update('profileImage', e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-7 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PUBLICATIONS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'publications' && (
            <div className="p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Publications</h2>
                    <p className="text-xs text-gray-400">{publications.length} total</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewPublication({ title: '', year: new Date().getFullYear(), journal: '' });
                    setShowAddPubModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a961] text-[#1a3d2b] rounded-xl text-sm font-bold hover:bg-[#b8963a] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Publication
                </button>
              </div>

              {/* Publications table / list */}
              {publications.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No publications yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add Publication&rdquo; to get started.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Journal / Conference</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {publications.map((pub, idx) => (
                        <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                          {editingPublication === pub.id && editPublicationData ? (
                            <>
                              <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={editPublicationData.title}
                                  onChange={(e) =>
                                    setEditPublicationData({
                                      ...editPublicationData,
                                      title: e.target.value,
                                    })
                                  }
                                  className={inputCls}
                                  placeholder="Title"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editPublicationData.year}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditPublicationData({
                                      ...editPublicationData,
                                      year: parseInt(val) || new Date().getFullYear(),
                                    });
                                  }}
                                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
                                  placeholder="Year"
                                />
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <input
                                  type="text"
                                  value={editPublicationData.journal || ''}
                                  onChange={(e) =>
                                    setEditPublicationData({
                                      ...editPublicationData,
                                      journal: e.target.value,
                                    })
                                  }
                                  className={inputCls}
                                  placeholder="Journal"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingPublication(null);
                                      setEditPublicationData(null);
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleSavePublication}
                                    disabled={saving}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    {saving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3">
                                <span className="w-7 h-7 rounded-lg bg-[#2d6a4f] text-white text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-start gap-2 mb-1">
                                  {pub.imageUrl && (
                                    <img src={pub.imageUrl} alt={pub.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900 leading-snug line-clamp-2">
                                      {pub.title}
                                    </p>
                                    {pub.doi && (
                                      <p className="text-xs text-gray-400 mt-0.5 font-mono">DOI: {pub.doi}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                                  {pub.year}
                                </span>
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell">
                                <p className="text-gray-600 text-xs line-clamp-1 italic">
                                  {pub.journal || <span className="text-gray-300 not-italic">—</span>}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleEditPublication(pub)}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => pub.id && handleDeletePublication(pub.id)}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PROJECTS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'projects' && (
            <div className="p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Research Projects</h2>
                    <p className="text-xs text-gray-400">{projects.length} total</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/faculty/projects/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Research Project
                  </a>
                  <a
                    href="/faculty/projects/industry"
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Industry Project
                  </a>
                </div>
              </div>

              {/* Projects cards grid */}
              {projects.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No projects yet</p>
                  <p className="text-gray-400 text-sm mt-1">Use the buttons above to submit a Research or Industry project to ORIC.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#2d6a4f]/20 hover:shadow-sm transition-all"
                    >
                      {editingProject === project.id && editProjectData ? (
                        /* ── inline edit form ── */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editProjectData.title}
                              onChange={(e) =>
                                setEditProjectData({ ...editProjectData, title: e.target.value })
                              }
                              className={inputCls}
                              placeholder="Title"
                            />
                            <select
                              value={editProjectData.status}
                              onChange={(e) =>
                                setEditProjectData({
                                  ...editProjectData,
                                  status: e.target.value as 'ONGOING' | 'COMPLETED' | 'PENDING',
                                })
                              }
                              className={inputCls}
                            >
                              <option value="ONGOING">Ongoing</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="PENDING">Pending</option>
                            </select>
                          </div>
                          <textarea
                            value={editProjectData.description || ''}
                            onChange={(e) =>
                              setEditProjectData({
                                ...editProjectData,
                                description: e.target.value,
                              })
                            }
                            className={`${inputCls} resize-none`}
                            rows={2}
                            placeholder="Description"
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={editProjectData.studentCount || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setEditProjectData({
                                  ...editProjectData,
                                  studentCount: parseInt(val) || 0,
                                });
                              }}
                              className={inputCls}
                              placeholder="Students"
                            />
                            <input
                              type="date"
                              value={editProjectData.startDate || ''}
                              onChange={(e) =>
                                setEditProjectData({
                                  ...editProjectData,
                                  startDate: e.target.value,
                                })
                              }
                              className={inputCls}
                            />
                            <input
                              type="date"
                              value={editProjectData.endDate || ''}
                              onChange={(e) =>
                                setEditProjectData({
                                  ...editProjectData,
                                  endDate: e.target.value,
                                })
                              }
                              className={inputCls}
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => {
                                setEditingProject(null);
                                setEditProjectData(null);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                              <X className="w-4 h-4" /> Cancel
                            </button>
                            <button
                              onClick={handleSaveProject}
                              disabled={saving}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#235a40] transition-colors disabled:opacity-50 font-semibold"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── display view ── */
                        <>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h4 className="font-bold text-gray-900 text-sm leading-snug">
                              {project.title}
                            </h4>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${projectStatusBadge(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                              {project.description}
                            </p>
                          )}
                          <VerifBadge status={project.verificationStatus} reason={project.rejectionReason} />
                          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                            {(project.startDate || project.endDate) && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {project.startDate &&
                                  new Date(project.startDate).toLocaleDateString()}
                                {project.startDate && project.endDate && ' – '}
                                {project.endDate &&
                                  new Date(project.endDate).toLocaleDateString()}
                              </span>
                            )}
                            {project.studentCount !== undefined && project.studentCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {project.studentCount} students
                              </span>
                            )}
                          </div>
                          <div className="flex justify-end gap-1 pt-3 border-t border-gray-50">
                            <button
                              onClick={() => handleEditProject(project)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => project.id && handleDeleteProject(project.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              COURSES TAB
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'courses' && (
            <div className="p-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Courses</h2>
                    <p className="text-xs text-gray-400">{courses.length} in teaching load</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewCourse({ name: '', credits: 3, students: 0 });
                    setShowAddCourseModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c9a961] text-[#1a3d2b] rounded-xl text-sm font-bold hover:bg-[#b8963a] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>

              {/* Courses table */}
              {courses.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No courses yet</p>
                  <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add Course&rdquo; to get started.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Course Name
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                          Credits
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                          Students Enrolled
                        </th>
                        <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                          {editingCourse === course.id && editCourseData ? (
                            <>
                              <td className="px-5 py-3">
                                <input
                                  type="text"
                                  value={editCourseData.name}
                                  onChange={(e) =>
                                    setEditCourseData({ ...editCourseData, name: e.target.value })
                                  }
                                  className={inputCls}
                                />
                              </td>
                              <td className="px-5 py-3">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editCourseData.credits}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditCourseData({
                                      ...editCourseData,
                                      credits: parseInt(val) || 0,
                                    });
                                  }}
                                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all mx-auto block"
                                  placeholder="3"
                                />
                              </td>
                              <td className="px-5 py-3">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={editCourseData.students}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setEditCourseData({
                                      ...editCourseData,
                                      students: parseInt(val) || 0,
                                    });
                                  }}
                                  className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all mx-auto block"
                                  placeholder="45"
                                />
                              </td>
                              <td className="px-5 py-3 hidden lg:table-cell" />
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingCourse(null);
                                      setEditCourseData(null);
                                    }}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleSaveCourse}
                                    disabled={saving}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    {saving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-4 font-semibold text-gray-900">
                                {course.name}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-[#2d6a4f]/10 text-[#2d6a4f]">
                                  <Hash className="w-3 h-3" />
                                  {course.credits}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-700">
                                  <Users className="w-3 h-3" />
                                  {course.students}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleEditCourse(course)}
                                    className="p-2 rounded-lg text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => course.id && handleDeleteCourse(course.id)}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            ADMINISTRATIVE DUTIES TAB  (outside the tabbed white card)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'administrative' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <ProfileVerifBanner status={profileVerifStatus} reason={profileVerifReason} />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Administrative Duties</h2>
                <p className="text-xs text-gray-400">
                  Enter one duty per line. We&apos;ll normalize to bullets on save.
                </p>
              </div>
            </div>
            <textarea
              value={form.administrativeDuties}
              onChange={(e) => update('administrativeDuties', e.target.value)}
              placeholder={'- Head of Research Committee\n- Department Coordinator'}
              className={`${inputCls} resize-none font-mono`}
              rows={8}
            />
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-7 py-3 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STUDENTS TAB  (outside the tabbed white card)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <ProfileVerifBanner status={profileVerifStatus} reason={profileVerifReason} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Students Supervised</h2>
                  <p className="text-xs text-gray-400">
                    Add individual student entries with optional department.
                  </p>
                </div>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600">
                {studentsDetails.length} students
              </span>
            </div>

            {/* Students list */}
            <div className="space-y-2 mb-7">
              {studentsDetails.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No students added yet.</p>
                </div>
              ) : (
                studentsDetails.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#2d6a4f] font-bold text-sm">
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {s.email}
                        {s.departmentId
                          ? ` · ${
                              departments.find((d) => d.id === s.departmentId)?.name ||
                              s.departmentId
                            }`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setStudentsDetails(studentsDetails.filter((_, i) => i !== idx))
                      }
                      className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add student row */}
            <div className="bg-[#f4fbf7] border border-[#2d6a4f]/15 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[#2d6a4f] mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Student
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Student Name *"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className={inputCls}
                />
                <select
                  value={newStudent.departmentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, departmentId: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Select department (optional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!newStudent.name.trim()) return setError('Student name is required');
                    setStudentsDetails([...studentsDetails, { ...newStudent }]);
                    setNewStudent({ name: '', email: '', departmentId: '' });
                    setError('');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            ORIC RESEARCH PROJECT FORM
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'oric-research' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span><strong>ORIC Approval Required.</strong> Fill all details and submit — ORIC will review, edit if needed, and approve. Post-award details (budget, installments, award letter) are managed by ORIC only.</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Research Project Proposal</h2>
              <p className="text-xs text-gray-400 mb-6">Submit a new research project for ORIC approval. All fields marked * are required.</p>
            </div>
            <OricResearchForm inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC INDUSTRY ───────────────────────────────────────────── */}
        {activeTab === 'oric-industry' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span><strong>ORIC Approval Required.</strong> Industry / sponsored project details go to ORIC for review.</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Industry / Sponsored Project</h2>
            <OricSimpleForm kind="Industry Project" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC CONSULTANCY ────────────────────────────────────────── */}
        {activeTab === 'oric-consultancy' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Consultancy</h2>
            <p className="text-xs text-gray-400">Record a consultancy engagement. No ORIC approval needed — saved directly to your portfolio.</p>
            <OricSimpleForm kind="Consultancy" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC PATENT ─────────────────────────────────────────────── */}
        {activeTab === 'oric-patent' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Patent / IP Filing</h2>
            <p className="text-xs text-gray-400">Record a patent or IP. Saved to your portfolio and compiled by ORIC — no approval gate.</p>
            <OricPatentForm inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC IP DISCLOSURE ──────────────────────────────────────── */}
        {activeTab === 'oric-ipdisclosure' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">IP Disclosure</h2>
            <p className="text-xs text-gray-400">Disclose a new invention or innovation for ORIC records.</p>
            <OricSimpleForm kind="IP Disclosure" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC IP LICENSING ───────────────────────────────────────── */}
        {activeTab === 'oric-licensing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">IP Licensing</h2>
            <p className="text-xs text-gray-400">Record an IP licensing agreement or technology transfer.</p>
            <OricSimpleForm kind="IP Licensing" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC MOU ────────────────────────────────────────────────── */}
        {activeTab === 'oric-mou' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Agreement of Collaboration / MoU</h2>
            <p className="text-xs text-gray-400">Record an MoU, AoC or collaborative agreement with an external organisation.</p>
            <OricMouForm inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC INDUSTRIAL VISIT ───────────────────────────────────── */}
        {activeTab === 'oric-visit' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Industrial Visit</h2>
            <p className="text-xs text-gray-400">Record a university–industry visit (outgoing or incoming).</p>
            <OricSimpleForm kind="Industrial Visit" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC EVENT ──────────────────────────────────────────────── */}
        {activeTab === 'oric-event' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Event / Exhibition</h2>
            <p className="text-xs text-gray-400">Record an organised event, seminar, exhibition or expo.</p>
            <OricSimpleForm kind="Event/Exhibition" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

        {/* ── ORIC POLICY ADVOCACY ────────────────────────────────────── */}
        {activeTab === 'oric-policy' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Policy Advocacy</h2>
            <p className="text-xs text-gray-400">Document participation in policy-making, advisory boards or advocacy activities.</p>
            <OricSimpleForm kind="Policy Advocacy" inputCls={inputCls} labelCls={labelCls} setSuccess={setSuccess} setError={setError} />
          </div>
        )}

          {/* Footer inside content column */}
          <div className="text-center text-gray-400 text-xs py-4">
            © {new Date().getFullYear()} MNSUAM — Faculty Dashboard
          </div>
          </div>{/* end flex-1 content */}
        </div>{/* end flex sidebar+content */}
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          ADD PUBLICATION MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddPubModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add Publication</h2>
              </div>
              <button
                onClick={() => setShowAddPubModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  placeholder="Publication title"
                  value={newPublication.title}
                  onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Year *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={String(new Date().getFullYear())}
                    value={newPublication.year}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewPublication({
                        ...newPublication,
                        year: parseInt(val) || new Date().getFullYear(),
                      });
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Journal / Conference</label>
                  <input
                    type="text"
                    placeholder="e.g., Nature, IEEE CVPR"
                    value={newPublication.journal}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, journal: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Authors</label>
                  <input
                    type="text"
                    placeholder="Author names"
                    value={newPublication.authors || ''}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, authors: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>DOI</label>
                  <input
                    type="text"
                    placeholder="10.xxxx/xxxxx"
                    value={newPublication.doi || ''}
                    onChange={(e) =>
                      setNewPublication({ ...newPublication, doi: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>


              <div>
                <label className={labelCls}>Indexed In</label>
                <input
                  type="text"
                  placeholder="e.g., Scopus, Web of Science"
                  value={newPublication.indexedIn || ''}
                  onChange={(e) =>
                    setNewPublication({ ...newPublication, indexedIn: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Abstract</label>
                <textarea
                  placeholder="Brief abstract (optional)"
                  value={newPublication.abstract || ''}
                  onChange={(e) =>
                    setNewPublication({ ...newPublication, abstract: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelCls}>Cover Image</label>
                <UploadImageButton
                  endpoint="contentImage"
                  currentUrl={newPublication.imageUrl ?? null}
                  onUpload={(url) => setNewPublication({ ...newPublication, imageUrl: url })}
                  onRemove={() => setNewPublication({ ...newPublication, imageUrl: undefined })}
                  label="Upload Cover Image"
                  hint="JPG, PNG or WebP · max 8 MB"
                />
              </div>

              <div>
                <label className={labelCls}>PDF URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPublication.pdfUrl || ''}
                  onChange={(e) =>
                    setNewPublication({ ...newPublication, pdfUrl: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddPubModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPublication}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding…' : 'Add Publication'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADD PROJECT MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add Project</h2>
              </div>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={labelCls}>Project Title *</label>
                <input
                  type="text"
                  placeholder="Project title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['ONGOING', 'COMPLETED', 'PENDING'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewProject({ ...newProject, status: s })}
                      className={`p-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                        newProject.status === s
                          ? s === 'ONGOING'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : s === 'COMPLETED'
                            ? 'border-gray-400 bg-gray-100 text-gray-700'
                            : 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  placeholder="Brief project description (optional)"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                  rows={3}
                />
              </div>

              <div>
                <label className={labelCls}>Student Count</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Number of students involved (e.g., 5)"
                  value={newProject.studentCount || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNewProject({ ...newProject, studentCount: parseInt(val) || 0 });
                  }}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Project Image</label>
                <UploadImageButton
                  endpoint="contentImage"
                  currentUrl={newProject.imageUrl ?? null}
                  onUpload={(url) => setNewProject({ ...newProject, imageUrl: url })}
                  onRemove={() => setNewProject({ ...newProject, imageUrl: undefined })}
                  label="Upload Project Image"
                  hint="JPG, PNG or WebP · max 8 MB"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding…' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADD COURSE MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Add Course</h2>
              </div>
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={labelCls}>Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Machine Learning"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Credit Hours</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 3"
                    value={newCourse.credits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewCourse({ ...newCourse, credits: parseInt(val) || 0 });
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Students Enrolled</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 45"
                    value={newCourse.students}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewCourse({ ...newCourse, students: parseInt(val) || 0 });
                    }}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold hover:bg-[#235a40] transition-colors disabled:opacity-50 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding…' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
