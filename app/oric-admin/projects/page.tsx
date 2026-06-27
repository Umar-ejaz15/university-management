'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  Briefcase,
  CalendarDays,
  User,
  RefreshCw,
  Clock,
  Users,
  Mail,
  Phone,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

// ── Types ──────────────────────────────────────────────────────────────────
interface Installment {
  id: string;
  installmentNo: number;
  amount: string;
  dueDate: string | null;
  releaseDate: string | null;
  status: 'PENDING' | 'RELEASED';
  note: string | null;
}

interface CoPI { id: string; name: string; designation: string | null; organization: string | null; contact: string | null; email: string | null; type: string; }
interface TeamMember { id: string; name: string; designation: string | null; department: string | null; role: string | null; }
interface ProjectReportItem { id: string; reportType: string; dueDate: string | null; submissionDate: string | null; status: string; fileUrl: string | null; }

interface AdminProject {
  id: string;
  title: string;
  description: string | null;
  objectives: string | null;
  methodology: string | null;
  outcomes: string | null;
  status: 'SUBMITTED' | 'ONGOING' | 'COMPLETED' | 'PENDING';
  projectKind: 'RESEARCH' | 'INDUSTRY';
  scope: 'NATIONAL' | 'INTERNATIONAL';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  budgetAmount: string | null;
  currency: string | null;
  fundingAgency: string | null;
  oricOverheadAmount: string | null;
  overheadStatus: string | null;
  awardLetterDate: string | null;
  fundingAgencyRefNo: string | null;
  specialConditions: string | null;
  thematicArea: string | null;
  projectCategory: string | null;
  projectType: string | null;
  funderType?: string | null;
  funderLocation: string | null;
  financialYear: string | null;
  projectFileNo: string | null;
  sponsoringAgency: string | null;
  sponsorCountry: string | null;
  counterpartName: string | null;
  deliverables: string | null;
  targetBeneficiaries: string | null;
  reportsStatus: string | null;
  fileStatus: string | null;
  remarks: string | null;
  startDate: string | null;
  endDate: string | null;
  staff: {
    id: string;
    name: string;
    email: string;
    designation: string;
    department: { id: string; name: string } | null;
  };
  installments: Installment[];
  coPIs: CoPI[];
  teamMembers: TeamMember[];
  reports: ProjectReportItem[];
}

type Tab = 'pending' | 'approved' | 'ongoing' | 'completed' | 'rejected' | 'all';

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number, ccy = 'PKR') => `${ccy} ${n.toLocaleString()}`;

// ── Reject Modal ───────────────────────────────────────────────────────────
function RejectModal({ title, onClose, onConfirm, processing }: {
  title: string; onClose: () => void; onConfirm: (r: string) => void; processing: boolean;
}) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 10;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Reject Project</h3>
            <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>{' '}
              <span className="text-gray-400 font-normal">(min 10 chars)</span>
            </label>
            <textarea
              rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what needs to be corrected…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none"
            />
            <p className={`text-xs mt-1 ${valid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {reason.trim().length} chars {valid && '✓'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => onConfirm(reason.trim())} disabled={!valid || processing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />{processing ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Project Detail Modal — full editable view ─────────────────────────────
function ProjectDetailModal({ project, onClose, onApprove, onReject, busy, onSaved }: {
  project: AdminProject;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: (r: string) => void;
  busy?: boolean;
  onSaved?: () => void | Promise<void>;
}) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [draft, setDraft] = useState({
    title:               project.title ?? '',
    description:         project.description ?? '',
    objectives:          project.objectives ?? '',
    methodology:         project.methodology ?? '',
    outcomes:            project.outcomes ?? '',
    deliverables:        project.deliverables ?? '',
    targetBeneficiaries: project.targetBeneficiaries ?? '',
    thematicArea:        project.thematicArea ?? '',
    projectCategory:     project.projectCategory ?? '',
    projectType:         project.projectType ?? '',
    funderLocation:      project.funderLocation ?? '',
    financialYear:       project.financialYear ?? '',
    startDate:           project.startDate ? project.startDate.slice(0, 10) : '',
    endDate:             project.endDate   ? project.endDate.slice(0, 10)   : '',
    budgetAmount:        project.budgetAmount ?? '',
    currency:            project.currency ?? 'PKR',
    fundingAgency:       project.fundingAgency ?? '',
    fundingAgencyRefNo:  project.fundingAgencyRefNo ?? '',
    awardLetterDate:     project.awardLetterDate ? project.awardLetterDate.slice(0, 10) : '',
    oricOverheadAmount:  project.oricOverheadAmount ?? '',
    overheadStatus:      project.overheadStatus ?? '',
    specialConditions:   project.specialConditions ?? '',
    sponsoringAgency:    project.sponsoringAgency ?? '',
    sponsorCountry:      project.sponsorCountry ?? '',
    counterpartName:     project.counterpartName ?? '',
    projectFileNo:       project.projectFileNo ?? '',
    remarks:             project.remarks ?? '',
  });

  const AGENCY_PRESETS = ['HEC', 'PSF', 'PSRP', 'MNSUAM Funded', 'Industry', 'USAID', 'EU', 'Other International', 'Other'];
  const initialAgencyPreset = AGENCY_PRESETS.includes(project.fundingAgency ?? '') ? (project.fundingAgency ?? '') : (project.fundingAgency ? 'Other' : '');
  const [agencyPreset, setAgencyPreset] = useState(initialAgencyPreset);
  const [agencyCustom, setAgencyCustom] = useState(AGENCY_PRESETS.includes(project.fundingAgency ?? '') ? '' : (project.fundingAgency ?? ''));

  const set = (k: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setDraft(d => ({ ...d, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          fundingAgency:      (agencyPreset === 'Other' ? agencyCustom.trim() : agencyPreset) || null,
          budgetAmount:       draft.budgetAmount       ? parseFloat(draft.budgetAmount as string)       : null,
          oricOverheadAmount: draft.oricOverheadAmount ? parseFloat(draft.oricOverheadAmount as string) : null,
          startDate:          draft.startDate || null,
          endDate:            draft.endDate   || null,
          awardLetterDate:    draft.awardLetterDate || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Save failed'); }
      setSaveMsg({ type: 'ok', text: 'Changes saved successfully.' });
      setEditMode(false);
      onSaved?.();
    } catch (err) {
      setSaveMsg({ type: 'err', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const TF = ({ label, k, type = 'text' }: { label: string; k: keyof typeof draft; type?: string }) => (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      {editMode
        ? <input type={type} value={draft[k] as string} onChange={set(k)}
            className="w-full px-3 py-2 border border-[#1a3d2b]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] bg-white" />
        : <p className={`text-sm leading-relaxed ${draft[k] ? 'text-gray-800' : 'text-gray-300 italic'}`}>{(draft[k] as string) || 'Not filled'}</p>
      }
    </div>
  );

  const isHtmlStr = (s: string) => /<[a-z][\s\S]*>/i.test(s);

  const TA = ({ label, k, minH = 100 }: { label: string; k: keyof typeof draft; minH?: number }) => {
    const val = draft[k] as string;
    const rich = isHtmlStr(val);
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        {editMode
          ? <RichTextEditor value={val} onChange={v => setDraft(d => ({ ...d, [k]: v }))} minHeight={minH} />
          : rich
            ? <div className="text-sm text-gray-800 rich-content" dangerouslySetInnerHTML={{ __html: val }} />
            : <p className={`text-sm leading-relaxed whitespace-pre-wrap ${val ? 'text-gray-800' : 'text-gray-300 italic'}`}>{val || 'Not filled'}</p>
        }
      </div>
    );
  };

  const checks = [
    { label: 'Title',         filled: !!draft.title },
    { label: 'Description',   filled: !!draft.description },
    { label: 'Objectives',    filled: !!draft.objectives },
    { label: 'Methodology',   filled: !!draft.methodology },
    { label: 'Start Date',    filled: !!draft.startDate },
    { label: 'End Date',      filled: !!draft.endDate },
    { label: 'Thematic Area', filled: !!draft.thematicArea },
    { label: 'Budget',        filled: !!draft.budgetAmount },
    { label: 'Co-PIs',        filled: project.coPIs.length > 0 },
    { label: 'Team Members',  filled: project.teamMembers.length > 0 },
  ];
  const filledCount = checks.filter(c => c.filled).length;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a3d2b] to-[#2d6a4f] px-6 py-5 flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-white/90 ${
                project.verificationStatus === 'PENDING'  ? 'text-amber-700 border-amber-200' :
                project.verificationStatus === 'VERIFIED' ? 'text-emerald-700 border-emerald-200' :
                'text-red-700 border-red-200'
              }`}>{project.verificationStatus}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-white/90 text-teal-700 border-teal-200">
                {project.projectKind === 'INDUSTRY' ? 'Industry' : 'Research'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-white/90 ${
                project.scope === 'INTERNATIONAL' ? 'text-purple-700 border-purple-200' : 'text-sky-700 border-sky-200'
              }`}>{project.scope === 'NATIONAL' ? 'National' : 'International'}</span>
              {editMode && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-900">EDITING</span>}
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{project.title}</h2>
            <p className="text-sm text-white/60 mt-1">{project.staff.name} · {project.staff.designation} · {project.staff.department?.name ?? '—'}</p>
            <p className="text-xs text-white/40 mt-0.5">{project.staff.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setEditMode(e => !e); setSaveMsg(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                editMode ? 'bg-amber-400 text-amber-900 hover:bg-amber-300' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {editMode ? '🔒 Lock' : '✏️ Edit'}
            </button>
            <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Save message bar */}
        {saveMsg && (
          <div className={`px-6 py-2.5 text-sm font-medium flex items-center gap-2 ${
            saveMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {saveMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {saveMsg.text}
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Completeness */}
          <div className={`border rounded-xl p-4 ${filledCount === checks.length ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">Form Completeness</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${filledCount === checks.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {filledCount}/{checks.length} filled
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {checks.map(c => (
                <div key={c.label} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${c.filled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {c.filled ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                  {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Project Information ── */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">Project Information</h3>
            <TF label="Title" k="title" />
            <TA label="Description" k="description" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TF label="Start Date" k="startDate" type="date" />
              <TF label="End Date" k="endDate" type="date" />
            </div>
          </section>

          {/* ── Research Content ── */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">Research Content</h3>
            <TA label="Objectives" k="objectives" />
            <TA label="Methodology" k="methodology" />
            <TA label="Expected Outcomes" k="outcomes" />
            <TA label="Deliverables" k="deliverables" />
            <TA label="Target Beneficiaries" k="targetBeneficiaries" />
          </section>

          {/* ── Classification ── */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">Classification</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <TF label="Thematic Area" k="thematicArea" />
              <TF label="Project Category" k="projectCategory" />
              <TF label="Project Type" k="projectType" />
              <TF label="Funder Location" k="funderLocation" />
              <TF label="Financial Year" k="financialYear" />
            </div>
          </section>

          {/* ── Funding & Budget ── */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">Funding & Budget</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <TF label="Budget Amount" k="budgetAmount" type="number" />
              <TF label="Currency" k="currency" />
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Funding Agency</p>
                {editMode ? (
                  <>
                    <select value={agencyPreset} onChange={e => setAgencyPreset(e.target.value)}
                      className="w-full px-3 py-2 border border-[#1a3d2b]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 bg-white">
                      <option value="">— None —</option>
                      {AGENCY_PRESETS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    {agencyPreset === 'Other' && (
                      <input value={agencyCustom} onChange={e => setAgencyCustom(e.target.value)} placeholder="Enter funding agency name…"
                        className="w-full mt-2 px-3 py-2 border border-[#1a3d2b]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20" />
                    )}
                  </>
                ) : (
                  <p className={`text-sm leading-relaxed ${(agencyPreset === 'Other' ? agencyCustom : agencyPreset) ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                    {(agencyPreset === 'Other' ? agencyCustom : agencyPreset) || 'Not filled'}
                  </p>
                )}
              </div>
              <TF label="Funding Agency Ref No." k="fundingAgencyRefNo" />
              <TF label="Award Letter Date" k="awardLetterDate" type="date" />
            </div>
          </section>

          {/* ── ORIC Management ── */}
          <section className="space-y-4 bg-[#1a3d2b]/[0.03] rounded-xl p-4 border border-[#1a3d2b]/10">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] pb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c9a961] shrink-0" />
              ORIC Management Fields
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <TF label="ORIC Overhead Amount" k="oricOverheadAmount" type="number" />
              <TF label="Overhead Status" k="overheadStatus" />
              <TF label="Project File No." k="projectFileNo" />
            </div>
            <TA label="Special Conditions" k="specialConditions" />
            <TA label="Remarks" k="remarks" />
          </section>

          {/* ── Sponsor / Industry Partner ── */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">Sponsor / Industry Partner</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TF label="Sponsoring Agency" k="sponsoringAgency" />
              <TF label="Sponsor Country" k="sponsorCountry" />
              <TF label="Counterpart Name" k="counterpartName" />
            </div>
          </section>

          {/* ── Co-PIs ── */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">
              Co-Principal Investigators ({project.coPIs.length})
            </h3>
            {project.coPIs.length === 0
              ? <p className="text-sm text-gray-300 italic">No Co-PIs added.</p>
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.coPIs.map(copi => (
                    <div key={copi.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
                      <p className="font-semibold text-gray-900 text-sm">{copi.name}</p>
                      {copi.designation && <p className="text-xs text-gray-500">{copi.designation}</p>}
                      {copi.organization && <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3 h-3" />{copi.organization}</p>}
                      {copi.email && <p className="text-xs text-[#2d6a4f] flex items-center gap-1"><Mail className="w-3 h-3" />{copi.email}</p>}
                      {copi.contact && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{copi.contact}</p>}
                      {copi.type && <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f]">{copi.type}</span>}
                    </div>
                  ))}
                </div>
            }
          </section>

          {/* ── Team Members ── */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a3d2b] border-b border-[#1a3d2b]/10 pb-1.5">
              Team Members ({project.teamMembers.length})
            </h3>
            {project.teamMembers.length === 0
              ? <p className="text-sm text-gray-300 italic">No team members added.</p>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {project.teamMembers.map(m => (
                    <div key={m.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-[#2d6a4f]/50" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs">{m.name}</p>
                        {m.designation && <p className="text-[10px] text-gray-500">{m.designation}</p>}
                        {m.department && <p className="text-[10px] text-gray-400">{m.department}</p>}
                        {m.role && <span className="mt-1 inline-block px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">{m.role}</span>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors">
            Close
          </button>
          <div className="flex items-center gap-2">
            {editMode && (
              <button
                onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#1a3d2b] hover:bg-[#142d20] disabled:opacity-50 rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Changes
              </button>
            )}
            {project.verificationStatus === 'PENDING' && onApprove && onReject && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)} disabled={busy}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 disabled:opacity-50 rounded-xl transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={onApprove} disabled={busy}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approve Project
                </button>
              </>
            )}
            {project.verificationStatus !== 'PENDING' && !editMode && (
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                project.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {project.verificationStatus === 'VERIFIED' ? '✓ Approved' : '✗ Rejected'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

    {showRejectModal && (
      <RejectModal
        title={project.title}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(r) => { setShowRejectModal(false); onReject && onReject(r); }}
        processing={busy ?? false}
      />
    )}
    </>
  );
}

// ── Smart Installment Generator ────────────────────────────────────────────
type InstallmentSchedule = 'MANUAL' | 'ANNUAL' | 'BIANNUAL' | 'QUARTERLY' | 'MONTHLY';

function InstallmentScheduler({ project, onUpdated, flash, busy, setBusy }: {
  project: AdminProject;
  onUpdated: (p: AdminProject) => void;
  flash: (t: 'ok' | 'err', m: string) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
}) {
  const [scheduleType, setScheduleType] = useState<InstallmentSchedule>('MANUAL');
  const [instAmount, setInstAmount] = useState('');
  const [instDue, setInstDue] = useState('');
  const [instNote, setInstNote] = useState('');

  const budgetNum = project.budgetAmount ? parseFloat(project.budgetAmount) : 0;
  const startDate = project.startDate;
  const endDate = project.endDate;

  const refetchProject = async () => {
    const res = await fetch(`/api/admin/projects/${project.id}`);
    if (res.ok) { const d = await res.json(); onUpdated(d.project); }
  };

  // Auto-generate installments based on schedule type
  const generateInstallments = async () => {
    if (!startDate || !endDate) {
      flash('err', 'Project must have start and end dates to auto-generate installments.');
      return;
    }
    if (!budgetNum) {
      flash('err', 'Project must have a budget amount to auto-generate installments.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    let intervalMonths = 0;
    let label = '';
    switch (scheduleType) {
      case 'ANNUAL':    intervalMonths = 12; label = 'Annual';    break;
      case 'BIANNUAL':  intervalMonths = 6;  label = 'Bi-Annual'; break;
      case 'QUARTERLY': intervalMonths = 3;  label = 'Quarterly'; break;
      case 'MONTHLY':   intervalMonths = 1;  label = 'Monthly';   break;
      default: return;
    }

    const count = Math.max(1, Math.round(monthsDiff / intervalMonths));
    const amountEach = Math.round(budgetNum / count);

    setBusy(true);
    try {
      for (let i = 0; i < count; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(dueDate.getMonth() + intervalMonths * (i + 1));
        await fetch(`/api/admin/projects/${project.id}/installments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: String(amountEach),
            dueDate: dueDate.toISOString().split('T')[0],
            note: `${label} installment ${i + 1} of ${count}`,
          }),
        });
      }
      flash('ok', `${count} installments generated (${label}).`);
      await refetchProject();
    } finally {
      setBusy(false);
    }
  };

  const addManualInstallment = async () => {
    if (!instAmount || Number(instAmount) <= 0) return flash('err', 'Enter a valid installment amount.');
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/installments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: instAmount, dueDate: instDue || null, note: instNote || null }),
      });
      const data = await res.json();
      if (!res.ok) return flash('err', data.error || 'Could not add installment');
      flash('ok', 'Installment added.');
      setInstAmount(''); setInstDue(''); setInstNote('');
      await refetchProject();
    } finally {
      setBusy(false);
    }
  };

  const toggleInstallment = async (inst: Installment) => {
    setBusy(true);
    try {
      const next = inst.status === 'RELEASED' ? 'PENDING' : 'RELEASED';
      const res = await fetch(`/api/admin/projects/${project.id}/installments/${inst.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) return flash('err', data.error || 'Update failed');
      await refetchProject();
    } finally {
      setBusy(false);
    }
  };

  const deleteInstallment = async (inst: Installment) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/installments/${inst.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); return flash('err', d.error || 'Delete failed'); }
      await refetchProject();
    } finally {
      setBusy(false);
    }
  };

  const released = project.installments.filter((i) => i.status === 'RELEASED').reduce((s, i) => s + Number(i.amount), 0);
  const scheduled = project.installments.reduce((s, i) => s + Number(i.amount), 0);
  const pct = scheduled > 0 ? Math.round((released / scheduled) * 100) : 0;

  const SCHEDULE_OPTIONS: { value: InstallmentSchedule; label: string; desc: string }[] = [
    { value: 'MANUAL',    label: 'Manual',    desc: 'Add one by one' },
    { value: 'ANNUAL',    label: 'Annual',    desc: 'Once per year' },
    { value: 'BIANNUAL',  label: 'Bi-Annual', desc: 'Every 6 months' },
    { value: 'QUARTERLY', label: 'Quarterly', desc: 'Every 3 months' },
    { value: 'MONTHLY',   label: 'Monthly',   desc: 'Every month' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500">Installment Schedule</h4>
        {project.installments.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-[#c9a961]">{fmtMoney(released, project.currency ?? 'PKR')}</span>
            <span>released of</span>
            <span className="font-semibold">{fmtMoney(scheduled, project.currency ?? 'PKR')}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pct === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{pct}%</span>
          </div>
        )}
      </div>

      {/* Schedule type picker */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Schedule type (auto-generate based on budget & dates)</p>
        <div className="flex flex-wrap gap-2">
          {SCHEDULE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setScheduleType(opt.value)}
              className={`flex flex-col items-start px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                scheduleType === opt.value
                  ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d6a4f]/30'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`font-normal text-[10px] ${scheduleType === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.desc}</span>
            </button>
          ))}
        </div>
        {scheduleType !== 'MANUAL' && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {budgetNum > 0 && startDate && endDate && (() => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
              const iMap: Record<string, number> = { ANNUAL: 12, BIANNUAL: 6, QUARTERLY: 3, MONTHLY: 1 };
              const count = Math.max(1, Math.round(monthsDiff / iMap[scheduleType]));
              const amtEach = Math.round(budgetNum / count);
              return (
                <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700">
                  <Zap className="w-3.5 h-3.5" />
                  Will create <strong>{count}</strong> installments of <strong>{fmtMoney(amtEach, project.currency ?? 'PKR')}</strong> each
                </div>
              );
            })()}
            <button
              onClick={generateInstallments} disabled={busy || !startDate || !endDate || !budgetNum}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-[#c9a961] hover:bg-[#b8985a] disabled:opacity-50 rounded-lg transition-colors"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Auto-Generate
            </button>
          </div>
        )}
      </div>

      {/* Existing installments */}
      {project.installments.length > 0 ? (
        <div className="space-y-2 mb-4">
          {project.installments.map((inst) => (
            <div key={inst.id} className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold flex items-center justify-center shrink-0">
                {inst.installmentNo}
              </span>
              <span className="text-gray-900 font-semibold">{fmtMoney(Number(inst.amount), project.currency ?? 'PKR')}</span>
              <span className="text-xs text-gray-400">Due {fmtDate(inst.dueDate)}</span>
              {inst.note && <span className="text-xs text-gray-400 italic">{inst.note}</span>}
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${inst.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {inst.status === 'RELEASED' ? `Released ${fmtDate(inst.releaseDate)}` : 'Pending'}
              </span>
              <button onClick={() => toggleInstallment(inst)} disabled={busy} className="text-xs font-medium text-[#2d6a4f] hover:underline disabled:opacity-60">
                {inst.status === 'RELEASED' ? 'Mark Pending' : 'Release'}
              </button>
              <button onClick={() => deleteInstallment(inst)} disabled={busy} className="text-red-400 hover:text-red-600 disabled:opacity-60">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-3">No installments scheduled yet.</p>
      )}

      {/* Manual add */}
      {scheduleType === 'MANUAL' && (
        <div className="flex flex-wrap items-end gap-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount</label>
            <input type="number" min="0" value={instAmount} onChange={(e) => setInstAmount(e.target.value)}
              placeholder="e.g. 500000"
              className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Due Date</label>
            <input type="date" value={instDue} onChange={(e) => setInstDue(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
            <input value={instNote} onChange={(e) => setInstNote(e.target.value)} placeholder="e.g. 1st tranche"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
          </div>
          <button onClick={addManualInstallment} disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#c9a961] hover:bg-[#b8985a] disabled:opacity-60 rounded-lg">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      )}
    </div>
  );
}

// ── Project Row (in list) ──────────────────────────────────────────────────
function ProjectRow({
  project,
  onUpdated,
  onChanged,
  onDeleted,
  flash,
}: {
  project: AdminProject;
  onUpdated: (p: AdminProject) => void;
  onChanged: () => void;
  onDeleted: (id: string) => void;
  flash: (t: 'ok' | 'err', m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Editable fields
  const [budget, setBudget] = useState(project.budgetAmount ?? '');
  const [currency, setCurrency] = useState(project.currency ?? 'PKR');
  const PRESET_AGENCIES = ['HEC', 'PSF', 'PSRP', 'MNSUAM Funded', 'Industry', 'USAID', 'EU', 'Other International', 'Other'];
  const initialAgencyPreset = PRESET_AGENCIES.includes(project.fundingAgency ?? '') ? (project.fundingAgency ?? '') : (project.fundingAgency ? 'Other' : '');
  const initialAgencyCustom = PRESET_AGENCIES.includes(project.fundingAgency ?? '') ? '' : (project.fundingAgency ?? '');
  const [agency, setAgency] = useState(initialAgencyPreset);
  const [agencyCustom, setAgencyCustom] = useState(initialAgencyCustom);
  const [status, setStatus] = useState(project.status);
  const [overhead, setOverhead] = useState(project.oricOverheadAmount ?? '');
  const [overheadStatus, setOverheadStatus] = useState(project.overheadStatus ?? 'Approved');
  const [awardLetterDate, setAwardLetterDate] = useState(project.awardLetterDate ? project.awardLetterDate.split('T')[0] : '');
  const [agencyRefNo, setAgencyRefNo] = useState(project.fundingAgencyRefNo ?? '');
  const [specialConditions, setSpecialConditions] = useState(project.specialConditions ?? '');
  const [reportsStatus, setReportsStatus] = useState(project.reportsStatus ?? 'No Report Due');
  const [fileStatus, setFileStatus] = useState(project.fileStatus ?? 'File Received');
  const [remarks, setRemarks] = useState(project.remarks ?? '');
  const [reports, setReports] = useState<ProjectReportItem[]>(project.reports ?? []);
  const [newReport, setNewReport] = useState({ reportType: 'Progress', dueDate: '', status: 'Due' });

  const verify = async (action: 'VERIFIED' | 'REJECTED', reason?: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/verifications/project/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (!res.ok) return flash('err', data.error || 'Action failed');
      flash('ok', action === 'VERIFIED' ? 'Project approved — now Ongoing.' : 'Project rejected.');
      setDetailOpen(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const deleteProject = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); return flash('err', d.error || 'Delete failed'); }
      onDeleted(project.id);
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const saveProject = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetAmount: budget === '' ? null : budget,
          currency,
          fundingAgency: (agency === 'Other' ? agencyCustom.trim() : agency) || null,
          status,
          oricOverheadAmount: overhead === '' ? null : overhead,
          overheadStatus,
          awardLetterDate: awardLetterDate || null,
          fundingAgencyRefNo: agencyRefNo.trim() || null,
          specialConditions: specialConditions.trim() || null,
          reportsStatus,
          fileStatus,
          remarks: remarks.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return flash('err', data.error || 'Save failed');
      flash('ok', 'Project updated.');
      onUpdated(data.project);
    } finally {
      setBusy(false);
    }
  };

  const addReport = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
      const data = await res.json();
      if (!res.ok) return flash('err', data.error || 'Could not add report');
      setReports((prev) => [...prev, data.report]);
      setNewReport({ reportType: 'Progress', dueDate: '', status: 'Due' });
      flash('ok', 'Report entry added.');
    } finally {
      setBusy(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/reports/${reportId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); return flash('err', d.error || 'Delete failed'); }
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } finally {
      setBusy(false);
    }
  };

  const verifBadgeCls = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  }[project.verificationStatus];

  return (
    <>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{project.title}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${verifBadgeCls}`}>{project.verificationStatus}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{project.status}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" /> {project.staff.name} · {project.staff.department?.name ?? '—'}</span>
              <span className="inline-flex items-center gap-1">
                {project.projectKind === 'INDUSTRY' ? <Building2 className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                {project.projectKind === 'INDUSTRY' ? 'Industry' : 'Research'} · {project.scope === 'INTERNATIONAL' ? 'International' : 'National'}
              </span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {fmtDate(project.startDate)} → {fmtDate(project.endDate)}</span>
            </div>
            {project.budgetAmount && (
              <p className="text-xs text-gray-600 mt-1.5">
                Budget: <span className="font-semibold text-[#c9a961]">{fmtMoney(Number(project.budgetAmount), project.currency ?? 'PKR')}</span>
              </p>
            )}
            {project.rejectionReason && (
              <p className="text-xs text-red-600 mt-1">Rejected: {project.rejectionReason}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Details button always visible */}
            <button
              onClick={() => setDetailOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#2d6a4f] bg-[#2d6a4f]/10 hover:bg-[#2d6a4f]/20 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" /> View Details
            </button>
            {project.verificationStatus !== 'PENDING' && (
              <button onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? 'Close' : 'Manage'}
              </button>
            )}
            {/* Delete — all statuses */}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={busy}
                className="inline-flex items-center justify-center w-9 h-9 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                <span className="text-xs text-red-700 font-medium whitespace-nowrap">Delete?</span>
                <button
                  onClick={deleteProject}
                  disabled={busy}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded disabled:opacity-50"
                >
                  {busy ? '…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 px-1 py-1 rounded"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management panel — for approved projects */}
      {expanded && project.verificationStatus !== 'PENDING' && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-5 space-y-6">
          {/* Budget + status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Budget &amp; Status</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Budget</label>
                <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Currency</label>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Funding Agency</label>
                <select value={agency} onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 bg-white">
                  <option value="">— None —</option>
                  {['HEC', 'PSF', 'PSRP', 'MNSUAM Funded', 'Industry', 'USAID', 'EU', 'Other International', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
                {agency === 'Other' && (
                  <input value={agencyCustom} onChange={(e) => setAgencyCustom(e.target.value)} placeholder="Enter funding agency name…"
                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as AdminProject['status'])}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Smart installment scheduler */}
          <InstallmentScheduler project={project} onUpdated={onUpdated} flash={flash} busy={busy} setBusy={setBusy} />

          {/* Post-Award Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Post-Award Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Award Letter Date</label>
                <input type="date" value={awardLetterDate} onChange={(e) => setAwardLetterDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Funding Agency Ref No</label>
                <input value={agencyRefNo} onChange={(e) => setAgencyRefNo(e.target.value)} placeholder="e.g. HEC/R&D/2024/001"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ORIC Overhead Amount</label>
                <input type="number" min="0" value={overhead} onChange={(e) => setOverhead(e.target.value)} placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Overhead Status</label>
                <select value={overheadStatus} onChange={(e) => setOverheadStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>Approved</option><option>Pending</option><option>Waived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reports Status</label>
                <select value={reportsStatus} onChange={(e) => setReportsStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>No Report Due</option><option>Report Due</option><option>Report Submitted</option><option>Report Reviewed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Status</label>
                <select value={fileStatus} onChange={(e) => setFileStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>File Received</option><option>File Pending</option><option>File Incomplete</option><option>File Closed</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Special Conditions</label>
                <textarea rows={2} value={specialConditions} onChange={(e) => setSpecialConditions(e.target.value)}
                  placeholder="Any special conditions imposed by funder…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Internal ORIC remarks…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 resize-none" />
              </div>
            </div>
            <button onClick={saveProject} disabled={busy}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2d6a4f] hover:bg-[#235a40] disabled:opacity-60 rounded-xl">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Changes
            </button>
          </div>

          {/* Reports */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Project Reports</h4>
            {reports.length > 0 ? (
              <div className="space-y-2 mb-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-gray-700">{r.reportType}</span>
                    {r.dueDate && <span className="text-xs text-gray-400">Due {fmtDate(r.dueDate)}</span>}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700' :
                      r.status === 'Reviewed' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{r.status}</span>
                    <button onClick={() => deleteReport(r.id)} disabled={busy} className="ml-auto text-red-400 hover:text-red-600 disabled:opacity-60">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">No reports recorded yet.</p>
            )}
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select value={newReport.reportType} onChange={(e) => setNewReport((p) => ({ ...p, reportType: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>Progress</option><option>Mid-Term</option><option>Final</option><option>Financial</option><option>Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={newReport.dueDate} onChange={(e) => setNewReport((p) => ({ ...p, dueDate: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={newReport.status} onChange={(e) => setNewReport((p) => ({ ...p, status: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>Due</option><option>Submitted</option><option>Reviewed</option><option>Overdue</option>
                </select>
              </div>
              <button onClick={addReport} disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#c9a961] hover:bg-[#b8985a] disabled:opacity-60 rounded-lg">
                <Plus className="w-4 h-4" /> Add Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {detailOpen && (
      <ProjectDetailModal
        project={project}
        onClose={() => setDetailOpen(false)}
        onApprove={project.verificationStatus === 'PENDING' ? () => verify('VERIFIED') : undefined}
        onReject={project.verificationStatus === 'PENDING' ? (r) => verify('REJECTED', r) : undefined}
        busy={busy}
        onSaved={async () => {
          const res = await fetch(`/api/admin/projects/${project.id}`);
          if (res.ok) { const d = await res.json(); onUpdated(d.project); }
        }}
      />
    )}
    </>
  );
}

// ── Shared helpers for add modals ─────────────────────────────────────────
interface StaffOption { id: string; name: string; designation: string; department: string; }
interface FormCoPI { [key: string]: string; name: string; designation: string; organization: string; contact: string; email: string; type: string; }
interface FormTeamMember { [key: string]: string; name: string; designation: string; department: string; role: string; }

const BLANK_COPI: FormCoPI = { name: '', designation: '', organization: 'MNSUAM', contact: '', email: '', type: 'Internal' };
const BLANK_TEAM: FormTeamMember = { name: '', designation: '', department: '', role: '' };

const inp = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition-all bg-white';
const ta  = `${inp} resize-none`;

function FL({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SH({ badge, title, subtitle, color = 'green' }: { badge: string; title: string; subtitle?: string; color?: 'green' | 'amber' | 'blue' | 'purple' }) {
  const bg = { green: 'bg-[#2d6a4f]', amber: 'bg-amber-600', blue: 'bg-blue-600', purple: 'bg-purple-600' }[color];
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 mb-5">
      <div className={`w-9 h-9 rounded-xl ${bg} text-white text-sm font-bold flex items-center justify-center shrink-0`}>{badge}</div>
      <div><h3 className="font-bold text-gray-900 text-base">{title}</h3>{subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}</div>
    </div>
  );
}

function DynTable<T extends Record<string, string>>({ rows, setRows, columns, blank, title }: {
  rows: T[]; setRows: (r: T[]) => void;
  columns: { key: keyof T; label: string; type?: string; options?: string[] }[];
  blank: T; title: string;
}) {
  const update = (i: number, k: keyof T, v: string) => { const n = [...rows]; n[i] = { ...n[i], [k]: v }; setRows(n); };
  return (
    <div>
      {rows.length === 0
        ? <p className="text-sm text-gray-400 mb-3">No {title.toLowerCase()} added yet.</p>
        : <div className="space-y-3 mb-3">
            {rows.map((row, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">#{i + 1}</span>
                  <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {columns.map(col => (
                    <div key={String(col.key)}>
                      <label className="block text-xs text-gray-500 mb-0.5">{col.label}</label>
                      {col.options
                        ? <select value={row[col.key] as string} onChange={e => update(i, col.key, e.target.value)} className={inp}>{col.options.map(o => <option key={o}>{o}</option>)}</select>
                        : <input type={col.type || 'text'} value={row[col.key] as string} onChange={e => update(i, col.key, e.target.value)} className={inp} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
      }
      <button type="button" onClick={() => setRows([...rows, { ...blank }])}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2d6a4f] border border-[#2d6a4f]/30 rounded-lg hover:bg-[#2d6a4f]/5 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Add {title}
      </button>
    </div>
  );
}

function useStaffList() {
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  useEffect(() => {
    fetch('/api/admin/staff')
      .then(r => r.ok ? r.json() : { staff: [] })
      .then(d => setStaffList((d.staff ?? []).map((s: { id: string; name: string; designation: string; department?: { name: string } }) => ({
        id: s.id, name: s.name, designation: s.designation, department: s.department?.name ?? '',
      }))));
  }, []);
  return staffList;
}

// ── Add Research Project Modal ─────────────────────────────────────────────
function AddResearchModal({ onClose, onCreated, flash }: { onClose: () => void; onCreated: () => void; flash: (t: 'ok' | 'err', m: string) => void }) {
  const staffList = useStaffList();
  const [saving, setSaving] = useState(false);

  // ORIC-only field
  const [staffId, setStaffId] = useState('');

  // Section 1
  const [title, setTitle] = useState('');
  const [thematicArea, setThematicArea] = useState('');
  const [fundingCallTitle, setFundingCallTitle] = useState('');
  const [dateOfCirculation, setDateOfCirculation] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [projectCategory, setProjectCategory] = useState('Research');
  const [projectType, setProjectType] = useState('Individual');
  const [fundingAgency, setFundingAgency] = useState('HEC');
  const [fundingAgencyCustom, setFundingAgencyCustom] = useState('');
  const [funderLocation, setFunderLocation] = useState('National');
  const [funderCountry, setFunderCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currency, setCurrency] = useState('PKR');

  // Section 2-3
  const [coPIs, setCoPIs] = useState<FormCoPI[]>([]);
  const [teamMembers, setTeamMembers] = useState<FormTeamMember[]>([]);

  // Section 12
  const [objectives, setObjectives] = useState('');
  const [methodology, setMethodology] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
  const [deliverables, setDeliverables] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return flash('err', 'Please select a faculty member.');
    if (!title.trim()) return flash('err', 'Project title is required.');
    if (!objectives.trim()) return flash('err', 'Project objectives are required.');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          title: title.trim(),
          projectKind: 'RESEARCH',
          scope: funderLocation === 'International' ? 'INTERNATIONAL' : 'NATIONAL',
          thematicArea: thematicArea.trim() || null,
          fundingCallTitle: fundingCallTitle.trim() || null,
          dateOfCirculation: dateOfCirculation || null,
          submissionDeadline: submissionDeadline || null,
          projectCategory,
          projectType,
          funderLocation,
          funderCountry: funderCountry.trim() || null,
          startDate: startDate || null,
          endDate: endDate || null,
          budgetAmount: budgetAmount ? parseFloat(budgetAmount) : null,
          currency: currency || 'PKR',
          fundingAgency: (fundingAgency === 'Other' ? fundingAgencyCustom.trim() : fundingAgency) || null,
          objectives: objectives.trim(),
          methodology: methodology.trim() || null,
          outcomes: outcomes.trim() || null,
          targetBeneficiaries: targetBeneficiaries.trim() || null,
          deliverables: deliverables.trim() || null,
          coPIs,
          teamMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { flash('err', data.error || 'Failed to create project'); return; }
      flash('ok', 'Research project created successfully.');
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a3d2b] to-[#2d6a4f] px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">Add Research Project</h3>
            <p className="text-xs text-white/60 mt-0.5">ORIC is creating this project on behalf of a faculty member</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-6 space-y-6">

          {/* ORIC-only: assign to faculty */}
          <div className="bg-[#2d6a4f]/5 border border-[#2d6a4f]/20 rounded-2xl p-5">
            <SH badge="★" title="ORIC Assignment" subtitle="Select the faculty member this project is being registered for" color="green" />
            <FL label="Faculty Member (Principal Investigator)" required>
              <select value={staffId} onChange={e => setStaffId(e.target.value)} required className={inp}>
                <option value="">Select faculty member…</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} — {s.designation} ({s.department})</option>)}
              </select>
            </FL>
          </div>

          {/* Section 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="1" title="Submission Outline" subtitle="Basic project identification and classification" color="green" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><FL label="Project Title" required>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Full project title" className={inp} />
              </FL></div>
              <FL label="Thematic Area">
                <input value={thematicArea} onChange={e => setThematicArea(e.target.value)} placeholder="e.g. Climate-Smart Agriculture" className={inp} />
              </FL>
              <FL label="Funding Call Title">
                <input value={fundingCallTitle} onChange={e => setFundingCallTitle(e.target.value)} placeholder="e.g. HEC NRPU 2024" className={inp} />
              </FL>
              <FL label="Date of Circulation">
                <input type="date" value={dateOfCirculation} onChange={e => setDateOfCirculation(e.target.value)} className={inp} />
              </FL>
              <FL label="Submission Deadline">
                <input type="date" value={submissionDeadline} onChange={e => setSubmissionDeadline(e.target.value)} className={inp} />
              </FL>
              <FL label="Project Category">
                <select value={projectCategory} onChange={e => setProjectCategory(e.target.value)} className={inp}>
                  {['Research', 'Development', 'Innovation', 'Extension'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FL>
              <FL label="Project Type">
                <select value={projectType} onChange={e => setProjectType(e.target.value)} className={inp}>
                  {['Individual', 'Group', 'Joint', 'International Collaboration'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FL>
              <FL label="Funding Agency">
                <select value={fundingAgency} onChange={e => setFundingAgency(e.target.value)} className={inp}>
                  {['HEC', 'PSF', 'PSRP', 'MNSUAM Funded', 'Industry', 'USAID', 'EU', 'Other International', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
                {fundingAgency === 'Other' && (
                  <input value={fundingAgencyCustom} onChange={e => setFundingAgencyCustom(e.target.value)} placeholder="Enter funding agency name…" className={`${inp} mt-2`} />
                )}
              </FL>
              <FL label="Funder Location">
                <select value={funderLocation} onChange={e => setFunderLocation(e.target.value)} className={inp}>
                  {['National', 'International'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FL>
              {funderLocation === 'International' && (
                <FL label="Funder Country">
                  <input value={funderCountry} onChange={e => setFunderCountry(e.target.value)} placeholder="Country" className={inp} />
                </FL>
              )}
              <FL label="Project Start Date">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inp} />
              </FL>
              <FL label="Project End Date">
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inp} />
              </FL>
              <FL label="Budget Amount">
                <input type="number" min="0" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="0.00" className={inp} />
              </FL>
              <FL label="Currency">
                <input value={currency} onChange={e => setCurrency(e.target.value)} placeholder="PKR" className={inp} />
              </FL>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="2" title="Co-PI Information" subtitle="Add all co-principal investigators" color="green" />
            <DynTable rows={coPIs} setRows={setCoPIs} blank={BLANK_COPI} title="Co-PI"
              columns={[
                { key: 'name', label: 'Name' }, { key: 'designation', label: 'Designation' },
                { key: 'organization', label: 'Organization' }, { key: 'email', label: 'Email', type: 'email' },
                { key: 'contact', label: 'Contact' }, { key: 'type', label: 'Type', options: ['Internal', 'External'] },
              ]} />
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="3" title="Team Scientists / Members" subtitle="Research team members (excluding PI and Co-PIs)" color="green" />
            <DynTable rows={teamMembers} setRows={setTeamMembers} blank={BLANK_TEAM} title="Team Member"
              columns={[
                { key: 'name', label: 'Name' }, { key: 'designation', label: 'Designation' },
                { key: 'department', label: 'Department' }, { key: 'role', label: 'Role (e.g. PhD Student)' },
              ]} />
          </div>

          {/* Section 12 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="12" title="Project Objectives & Work Plan" subtitle="Use toolbar for numbered lists, bold text, and bullet points" color="green" />
            <div className="space-y-5">
              <FL label="Project Objectives" required>
                <RichTextEditor value={objectives} onChange={setObjectives} placeholder="List the specific, measurable objectives…" minHeight={120} />
              </FL>
              <FL label="Methodology / Work Plan">
                <RichTextEditor value={methodology} onChange={setMethodology} placeholder="Describe the research methodology and work plan…" minHeight={120} />
              </FL>
              <FL label="Expected Outcomes & Deliverables">
                <RichTextEditor value={outcomes} onChange={setOutcomes} placeholder="Publications, patents, prototypes, trained human resources…" minHeight={100} />
              </FL>
              <FL label="Target Beneficiaries">
                <RichTextEditor value={targetBeneficiaries} onChange={setTargetBeneficiaries} placeholder="Who will benefit from this research?" minHeight={80} />
              </FL>
              <FL label="Project Deliverables">
                <RichTextEditor value={deliverables} onChange={setDeliverables} placeholder="List key deliverables…" minHeight={100} />
              </FL>
            </div>
          </div>

        </form>

        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !staffId || !title.trim() || !objectives.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Submit Research Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Industry Project Modal ─────────────────────────────────────────────
function AddIndustryModal({ onClose, onCreated, flash }: { onClose: () => void; onCreated: () => void; flash: (t: 'ok' | 'err', m: string) => void }) {
  const staffList = useStaffList();
  const [saving, setSaving] = useState(false);

  // ORIC-only field
  const [staffId, setStaffId] = useState('');

  // Section A
  const [title, setTitle] = useState('');
  const [projectFileNo, setProjectFileNo] = useState('');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [scope, setScope] = useState('National');
  const [currentStatus, setCurrentStatus] = useState('Awarded');
  const [awardDate, setAwardDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [declaredBudget, setDeclaredBudget] = useState('');

  // Section B
  const [coPIs, setCoPIs] = useState<FormCoPI[]>([]);
  const [teamMembers, setTeamMembers] = useState<FormTeamMember[]>([]);

  // Section C
  const [sponsoringAgency, setSponsoringAgency] = useState('');
  const [sponsorCountry, setSponsorCountry] = useState('Pakistan');
  const [sponsorAddress, setSponsorAddress] = useState('');
  const [counterpartName, setCounterpartName] = useState('');
  const [counterpartCountry, setCounterpartCountry] = useState('');
  const [counterpartAddress, setCounterpartAddress] = useState('');

  // Section E
  const [deliverables, setDeliverables] = useState('');
  const [monitoringPlan, setMonitoringPlan] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return flash('err', 'Please select a faculty member.');
    if (!title.trim()) return flash('err', 'Project title is required.');
    if (!sponsoringAgency.trim()) return flash('err', 'Sponsoring agency is required.');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          title: title.trim(),
          projectKind: 'INDUSTRY',
          scope: scope === 'International' ? 'INTERNATIONAL' : 'NATIONAL',
          funderLocation: scope,
          projectFileNo: projectFileNo.trim() || null,
          financialYear: financialYear.trim() || null,
          awardLetterDate: awardDate || null,
          startDate: startDate || null,
          endDate: endDate || null,
          budgetAmount: declaredBudget ? parseFloat(declaredBudget) : null,
          sponsoringAgency: sponsoringAgency.trim(),
          sponsorCountry: sponsorCountry.trim() || null,
          sponsorAddress: sponsorAddress.trim() || null,
          counterpartName: counterpartName.trim() || null,
          counterpartCountry: counterpartCountry.trim() || null,
          counterpartAddress: counterpartAddress.trim() || null,
          deliverables: deliverables.trim() || null,
          monitoringPlan: monitoringPlan.trim() || null,
          remarks: remarks.trim() || null,
          coPIs,
          teamMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { flash('err', data.error || 'Failed to create project'); return; }
      flash('ok', 'Industry project created successfully.');
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">Add Industry Project</h3>
            <p className="text-xs text-white/60 mt-0.5">ORIC is registering an industry-sponsored project for a faculty member</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-6 space-y-6">

          {/* ORIC-only: assign to faculty */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <SH badge="★" title="ORIC Assignment" subtitle="Select the faculty member (PI) this project is being registered for" color="amber" />
            <FL label="Faculty Member (Principal Investigator)" required>
              <select value={staffId} onChange={e => setStaffId(e.target.value)} required className={inp}>
                <option value="">Select faculty member…</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} — {s.designation} ({s.department})</option>)}
              </select>
            </FL>
          </div>

          {/* Section A */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="A" title="Project Identification" color="amber" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><FL label="Project Title" required>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Full project title" className={inp} />
              </FL></div>
              <FL label="Project File No.">
                <input value={projectFileNo} onChange={e => setProjectFileNo(e.target.value)} placeholder="IP-001/2024-25" className={inp} />
              </FL>
              <FL label="Financial Year">
                <input value={financialYear} onChange={e => setFinancialYear(e.target.value)} placeholder="2024-25" className={inp} />
              </FL>
              <FL label="National / International">
                <select value={scope} onChange={e => setScope(e.target.value)} className={inp}>
                  <option>National</option><option>International</option>
                </select>
              </FL>
              <FL label="Current Status">
                <select value={currentStatus} onChange={e => setCurrentStatus(e.target.value)} className={inp}>
                  {['Awarded', 'Ongoing', 'Completed', 'Submitted', 'Under Review'].map(o => <option key={o}>{o}</option>)}
                </select>
              </FL>
              <FL label="Award Date">
                <input type="date" value={awardDate} onChange={e => setAwardDate(e.target.value)} className={inp} />
              </FL>
              <FL label="Starting Date">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inp} />
              </FL>
              <FL label="Completion Date">
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inp} />
              </FL>
              <FL label="Declared Total Budget (PKR)">
                <input type="number" min="0" value={declaredBudget} onChange={e => setDeclaredBudget(e.target.value)} placeholder="Indicative amount — ORIC will confirm" className={inp} />
              </FL>
            </div>
          </div>

          {/* Section B */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="B" title="Principal Investigator & Team" subtitle="Co-PIs and team members for this project" color="green" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Co-PI(s)</h4>
            <DynTable rows={coPIs} setRows={setCoPIs} blank={{ ...BLANK_COPI, organization: '' }} title="Co-PI"
              columns={[
                { key: 'name', label: 'Name' }, { key: 'designation', label: 'Designation' },
                { key: 'organization', label: 'Department' }, { key: 'email', label: 'Email', type: 'email' },
                { key: 'contact', label: 'Contact' },
              ]} />
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3 mt-5">Team Members</h4>
            <DynTable rows={teamMembers} setRows={setTeamMembers} blank={BLANK_TEAM} title="Team Member"
              columns={[
                { key: 'name', label: 'Name' }, { key: 'designation', label: 'Designation' },
                { key: 'department', label: 'Department' }, { key: 'role', label: 'Role' },
              ]} />
          </div>

          {/* Section C */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="C" title="Sponsoring Agency & Industry Partner" color="blue" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FL label="Sponsoring Agency Name" required>
                <input value={sponsoringAgency} onChange={e => setSponsoringAgency(e.target.value)} placeholder="Company / Organization name" className={inp} />
              </FL>
              <FL label="Country of Sponsor">
                <input value={sponsorCountry} onChange={e => setSponsorCountry(e.target.value)} className={inp} />
              </FL>
              <div className="sm:col-span-2"><FL label="Sponsoring Agency Address">
                <textarea rows={2} value={sponsorAddress} onChange={e => setSponsorAddress(e.target.value)} className={ta} />
              </FL></div>
              <FL label="Counterpart (Name & Designation)">
                <input value={counterpartName} onChange={e => setCounterpartName(e.target.value)} placeholder="e.g. Dr. Ahmed Ali, CEO" className={inp} />
              </FL>
              <FL label="Counterpart Country">
                <input value={counterpartCountry} onChange={e => setCounterpartCountry(e.target.value)} className={inp} />
              </FL>
              <div className="sm:col-span-2"><FL label="Counterpart Full Address">
                <textarea rows={2} value={counterpartAddress} onChange={e => setCounterpartAddress(e.target.value)} className={ta} />
              </FL></div>
            </div>
          </div>

          {/* Section E */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SH badge="E" title="Deliverables, Reports & Documents" color="purple" />
            <div className="space-y-5">
              <FL label="Project Expected Deliverables and Outcomes">
                <RichTextEditor value={deliverables} onChange={setDeliverables} placeholder="List expected deliverables, milestones, and outcomes…" minHeight={120} />
              </FL>
              <FL label="Monitoring Plan">
                <RichTextEditor value={monitoringPlan} onChange={setMonitoringPlan} placeholder="How will progress be monitored and reported?" minHeight={100} />
              </FL>
              <FL label="Remarks">
                <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any additional remarks or special instructions…" className={ta} />
              </FL>
            </div>
          </div>

        </form>

        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving || !staffId || !title.trim() || !sponsoringAgency.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Submit Industry Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function OricPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [addResearch, setAddResearch] = useState(false);
  const [addIndustry, setAddIndustry] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (res.ok) setProjects(data.projects ?? []);
      else setBanner({ type: 'err', msg: data.error || 'Failed to load projects' });
    } catch {
      setBanner({ type: 'err', msg: 'Network error loading projects' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const flash = (type: 'ok' | 'err', msg: string) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner(null), 4000);
  };

  const handleProjectUpdated = (updated: AdminProject) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleProjectDeleted = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    flash('ok', 'Project deleted.');
  };

  const counts = useMemo(() => ({
    pending:   projects.filter((p) => p.verificationStatus === 'PENDING').length,
    approved:  projects.filter((p) => p.verificationStatus === 'VERIFIED').length,
    ongoing:   projects.filter((p) => p.status === 'ONGOING' && p.verificationStatus === 'VERIFIED').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
    rejected:  projects.filter((p) => p.verificationStatus === 'REJECTED').length,
    all:       projects.length,
  }), [projects]);

  const filtered = useMemo(() => {
    switch (tab) {
      case 'pending':   return projects.filter((p) => p.verificationStatus === 'PENDING');
      case 'approved':  return projects.filter((p) => p.verificationStatus === 'VERIFIED');
      case 'ongoing':   return projects.filter((p) => p.status === 'ONGOING' && p.verificationStatus === 'VERIFIED');
      case 'completed': return projects.filter((p) => p.status === 'COMPLETED');
      case 'rejected':  return projects.filter((p) => p.verificationStatus === 'REJECTED');
      default:          return projects;
    }
  }, [projects, tab]);

  const tabs: { key: Tab; label: string; urgent?: boolean }[] = [
    { key: 'pending',   label: 'Pending Approval', urgent: true },
    { key: 'approved',  label: 'Approved' },
    { key: 'ongoing',   label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected',  label: 'Rejected' },
    { key: 'all',       label: 'All Projects' },
  ];

  return (
    <div className="min-h-screen">
      <main className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#c9a961]/15 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-[#c9a961]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ORIC — Project Management</h1>
            <p className="text-sm text-gray-500">Office of Research, Innovation &amp; Commercialization · review and approve research projects, manage budgets &amp; installments</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setAddResearch(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2d6a4f] hover:bg-[#235a40] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Research Project
            </button>
            <button
              onClick={() => setAddIndustry(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Industry Project
            </button>
            <button
              onClick={loadProjects}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Pending Review', value: counts.pending,   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100' },
            { label: 'Approved',       value: counts.approved,  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
            { label: 'Ongoing',        value: counts.ongoing,   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
            { label: 'Completed',      value: counts.completed, color: 'text-gray-700',    bg: 'bg-gray-50 border-gray-100' },
            { label: 'Rejected',       value: counts.rejected,  color: 'text-red-700',     bg: 'bg-red-50 border-red-100' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.bg} flex items-center gap-3`}>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {banner && (
          <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 mb-4 border ${banner.type === 'ok' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
            {banner.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {banner.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                tab === t.key ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t.key
                  ? 'bg-white/20 text-white'
                  : counts[t.key] > 0 && t.urgent
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Project list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No projects in this view.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <ProjectRow key={p.id} project={p} onUpdated={handleProjectUpdated} onChanged={loadProjects} onDeleted={handleProjectDeleted} flash={flash} />
            ))}
          </div>
        )}
      </main>

      {addResearch && (
        <AddResearchModal
          onClose={() => setAddResearch(false)}
          onCreated={loadProjects}
          flash={flash}
        />
      )}
      {addIndustry && (
        <AddIndustryModal
          onClose={() => setAddIndustry(false)}
          onCreated={loadProjects}
          flash={flash}
        />
      )}
    </div>
  );
}
