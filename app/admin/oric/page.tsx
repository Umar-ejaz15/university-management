'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  CheckCircle,
  Clock,
  Shield,
  ShieldCheck,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useAdminVerifications } from '@/lib/queries/admin/verifications';

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
  funderType: string | null;
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

type Tab = 'profiles' | 'pending' | 'approved' | 'ongoing' | 'completed' | 'all';

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n: number, ccy = 'PKR') => `${ccy} ${n.toLocaleString()}`;

// ── Verif Types ────────────────────────────────────────────────────────────
type VerifStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
interface StaffRef { id: string; name: string; email: string; department: { name: string } }
interface PendingProfile {
  id: string; name: string; email: string; designation: string;
  bio: string | null; specialization: string | null; qualifications: string | null;
  experienceYears: string | null; profileImage: string | null;
  profileVerificationStatus: VerifStatus; profileRejectionReason: string | null;
  updatedAt: string; department: { name: string };
}
interface PendingProject {
  id: string; title: string; description: string | null; status: string;
  imageUrl: string | null; verificationStatus: VerifStatus; rejectionReason: string | null;
  updatedAt: string; staff: StaffRef;
}
interface TeacherPending {
  id: string; name: string; email: string; department: string;
  profileImage: string | null;
  profile: PendingProfile | null;
  projects: PendingProject[];
  total: number;
}

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
            <h3 className="text-base font-bold text-white">Reject</h3>
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

function InlineActions({ label, onVerify, onReject, processing }: {
  label: string; onVerify: () => void; onReject: (r: string) => void; processing: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        <button onClick={onVerify} disabled={processing}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          <CheckCircle className="w-3.5 h-3.5" /> Approve
        </button>
        <button onClick={() => setShowModal(true)} disabled={processing}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors">
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
        {processing && <span className="text-xs text-gray-400 animate-pulse">Processing…</span>}
      </div>
      {showModal && (
        <RejectModal title={label} onClose={() => setShowModal(false)}
          onConfirm={(r) => { setShowModal(false); onReject(r); }} processing={processing} />
      )}
    </>
  );
}

function VerifChip({ status }: { status: VerifStatus }) {
  if (status === 'VERIFIED') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
      <ShieldCheck className="w-3 h-3" /> Verified
    </span>
  );
  if (status === 'REJECTED') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

// ── Teacher Verification Card ──────────────────────────────────────────────
function TeacherVerifCard({ teacher, act, isProc }: {
  teacher: TeacherPending;
  act: (type: string, id: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => Promise<void>;
  isProc: (type: string, id: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const initials = teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors text-left">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-gray-100">
          {teacher.profileImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center">
              <span className="text-[#2d6a4f] font-bold text-sm">{initials}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{teacher.name}</p>
          <p className="text-xs text-gray-500 truncate">{teacher.email} · {teacher.department}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {teacher.profile && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                <User className="w-3 h-3" />1 Profile
              </span>
            )}
            {teacher.projects.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2d6a4f]/10 text-[#2d6a4f]">
                <FlaskConical className="w-3 h-3" />{teacher.projects.length} Project{teacher.projects.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">
            {teacher.total}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {teacher.profile && (
            <div className="bg-purple-50/20">
              <div className="flex items-center gap-2 px-6 py-3 bg-purple-100/40 border-b border-purple-100">
                <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-purple-800 text-sm uppercase tracking-wide">Profile</span>
                <VerifChip status={teacher.profile.profileVerificationStatus} />
                <span className="ml-auto text-xs text-gray-400">
                  Updated {new Date(teacher.profile.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-1">
                  {teacher.profile.designation && (
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-0.5">Designation</p>
                      <p className="text-gray-800 font-medium">{teacher.profile.designation}</p>
                    </div>
                  )}
                  {teacher.profile.experienceYears && (
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-0.5">Experience</p>
                      <p className="text-gray-800 font-medium">{teacher.profile.experienceYears}</p>
                    </div>
                  )}
                  {teacher.profile.specialization && (
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-0.5">Specialization</p>
                      <p className="text-gray-700 line-clamp-2">{teacher.profile.specialization}</p>
                    </div>
                  )}
                  {teacher.profile.qualifications && (
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-0.5">Qualifications</p>
                      <p className="text-gray-700">{teacher.profile.qualifications}</p>
                    </div>
                  )}
                  {teacher.profile.bio && (
                    <div className="bg-white rounded-xl p-3 border border-gray-100 sm:col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Bio</p>
                      <p className="text-gray-700 line-clamp-3">{teacher.profile.bio}</p>
                    </div>
                  )}
                </div>
                <InlineActions
                  label={`${teacher.name}'s profile`}
                  onVerify={() => act('profile', teacher.profile!.id, 'VERIFIED')}
                  onReject={(r) => act('profile', teacher.profile!.id, 'REJECTED', r)}
                  processing={isProc('profile', teacher.profile.id)}
                />
              </div>
            </div>
          )}

          {teacher.projects.length > 0 && (
            <div className="bg-[#2d6a4f]/5">
              <div className="flex items-center gap-2 px-6 py-3 bg-[#2d6a4f]/10 border-b border-[#2d6a4f]/10">
                <div className="w-6 h-6 rounded-md bg-[#2d6a4f] flex items-center justify-center">
                  <FlaskConical className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-[#1a3d2b] text-sm uppercase tracking-wide">Projects</span>
                <span className="ml-1 px-2 py-0.5 bg-[#2d6a4f]/20 text-[#2d6a4f] rounded-full text-xs font-bold">{teacher.projects.length}</span>
              </div>
              {teacher.projects.map((proj) => (
                <div key={proj.id} className="px-6 py-4 border-b border-[#2d6a4f]/5 last:border-0">
                  <div className="flex items-start gap-3">
                    {proj.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={proj.imageUrl} alt={proj.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{proj.title}</span>
                        <VerifChip status={proj.verificationStatus} />
                      </div>
                      {proj.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-1">{proj.description}</p>
                      )}
                      <InlineActions
                        label={proj.title}
                        onVerify={() => act('project', proj.id, 'VERIFIED')}
                        onReject={(r) => act('project', proj.id, 'REJECTED', r)}
                        processing={isProc('project', proj.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function OricPage() {
  const queryClient = useQueryClient();

  // Project state
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('profiles');
  const [banner, setBanner] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Verifications state
  const { data: verifData, isLoading: verifLoading, refetch: refetchVerif } = useAdminVerifications();
  const [verifProcessing, setVerifProcessing] = useState<string | null>(null);
  const [verifSearch, setVerifSearch] = useState('');

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

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const flash = (type: 'ok' | 'err', msg: string) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner(null), 4000);
  };

  // Verif actions
  const verifAct = async (type: string, id: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => {
    setVerifProcessing(`${type}:${id}`);
    try {
      const res = await fetch(`/api/admin/verifications/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        flash('ok', action === 'VERIFIED' ? 'Approved successfully.' : 'Rejected.');
      } else {
        const d = await res.json();
        flash('err', d.error || 'Failed');
      }
    } catch {
      flash('err', 'Network error');
    } finally {
      setVerifProcessing(null);
    }
  };
  const isVerifProc = (type: string, id: string) => verifProcessing === `${type}:${id}`;

  // Build teacher groups for profiles tab
  const teachers = useMemo<TeacherPending[]>(() => {
    if (!verifData) return [];
    const map = new Map<string, TeacherPending>();
    const ensure = (id: string, name: string, email: string, dept: string, img: string | null) => {
      if (!map.has(id)) map.set(id, { id, name, email, department: dept, profileImage: img, profile: null, projects: [], total: 0 });
      return map.get(id)!;
    };
    verifData.pendingProfiles.forEach((p) => {
      const t = ensure(p.id, p.name, p.email, p.department.name, p.profileImage);
      t.profile = p;
    });
    verifData.pendingProjects.forEach((proj) => {
      const t = ensure(proj.staff.id, proj.staff.name, proj.staff.email, proj.staff.department.name, null);
      t.projects.push(proj);
    });
    return Array.from(map.values())
      .map((t) => ({ ...t, total: (t.profile ? 1 : 0) + t.projects.length }))
      .sort((a, b) => b.total - a.total);
  }, [verifData]);

  const filteredTeachers = useMemo(() => {
    if (!verifSearch.trim()) return teachers;
    const q = verifSearch.toLowerCase();
    return teachers.filter((t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.department.toLowerCase().includes(q));
  }, [teachers, verifSearch]);

  // Project tab counts
  const counts = useMemo(() => ({
    profiles: (verifData?.totalPending ?? 0),
    pending: projects.filter((p) => p.verificationStatus === 'PENDING').length,
    approved: projects.filter((p) => p.verificationStatus === 'VERIFIED').length,
    ongoing: projects.filter((p) => p.status === 'ONGOING' && p.verificationStatus === 'VERIFIED').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
    all: projects.length,
  }), [projects, verifData]);

  const filtered = useMemo(() => {
    switch (tab) {
      case 'pending': return projects.filter((p) => p.verificationStatus === 'PENDING');
      case 'approved': return projects.filter((p) => p.verificationStatus === 'VERIFIED');
      case 'ongoing': return projects.filter((p) => p.status === 'ONGOING' && p.verificationStatus === 'VERIFIED');
      case 'completed': return projects.filter((p) => p.status === 'COMPLETED');
      default: return projects;
    }
  }, [projects, tab]);

  const tabs: { key: Tab; label: string; color?: string }[] = [
    { key: 'profiles', label: 'Verifications', color: 'amber' },
    { key: 'pending', label: 'Pending Approval', color: 'amber' },
    { key: 'approved', label: 'Approved', color: 'green' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
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
            <h1 className="text-2xl font-bold text-gray-900">ORIC</h1>
            <p className="text-sm text-gray-500">Office of Research, Innovation &amp; Commercialization — verify profiles, approve projects, manage budgets</p>
          </div>
          <button
            onClick={() => { loadProjects(); refetchVerif(); }}
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
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
                  : counts[t.key] > 0 && (t.key === 'profiles' || t.key === 'pending')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Profiles / Verifications Tab ── */}
        {tab === 'profiles' && (
          <div className="space-y-4">
            {verifLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : teachers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-gray-800 font-semibold text-lg">All verified!</p>
                <p className="text-sm text-gray-400 mt-1">No pending profile or project submissions.</p>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{verifData?.counts.profiles ?? 0}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pending Profiles</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#2d6a4f]">{verifData?.counts.projects ?? 0}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pending Projects</p>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" value={verifSearch} onChange={(e) => setVerifSearch(e.target.value)}
                      placeholder="Search by teacher name or department…"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
                    />
                  </div>
                  {verifSearch && (
                    <button onClick={() => setVerifSearch('')} className="text-xs text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-sm text-gray-400">{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Teacher cards */}
                {filteredTeachers.map((teacher) => (
                  <TeacherVerifCard key={teacher.id} teacher={teacher} act={verifAct} isProc={isVerifProc} />
                ))}
                {filteredTeachers.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">No teachers match &ldquo;{verifSearch}&rdquo;</div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Project Tabs ── */}
        {tab !== 'profiles' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                No projects in this view.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((p) => (
                  <ProjectRow key={p.id} project={p} onChanged={loadProjects} flash={flash} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Project row ────────────────────────────────────────────────────────────
function ProjectRow({
  project,
  onChanged,
  flash,
}: {
  project: AdminProject;
  onChanged: () => void;
  flash: (t: 'ok' | 'err', m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  // Editable fields
  const [budget, setBudget] = useState(project.budgetAmount ?? '');
  const [currency, setCurrency] = useState(project.currency ?? 'PKR');
  const [agency, setAgency] = useState(project.fundingAgency ?? '');
  const [status, setStatus] = useState(project.status);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? '');
  // ORIC post-award fields
  const [overhead, setOverhead] = useState(project.oricOverheadAmount ?? '');
  const [overheadStatus, setOverheadStatus] = useState(project.overheadStatus ?? 'Approved');
  const [awardLetterDate, setAwardLetterDate] = useState(project.awardLetterDate ? project.awardLetterDate.split('T')[0] : '');
  const [agencyRefNo, setAgencyRefNo] = useState(project.fundingAgencyRefNo ?? '');
  const [specialConditions, setSpecialConditions] = useState(project.specialConditions ?? '');
  // Report tracking
  const [reports, setReports] = useState<ProjectReportItem[]>(project.reports ?? []);
  const [newReport, setNewReport] = useState({ reportType: 'Progress', dueDate: '', status: 'Due' });
  // File / status tracking
  const [reportsStatus, setReportsStatus] = useState(project.reportsStatus ?? 'No Report Due');
  const [fileStatus, setFileStatus] = useState(project.fileStatus ?? 'File Received');
  const [remarks, setRemarks] = useState(project.remarks ?? '');

  // New installment state
  const [instAmount, setInstAmount] = useState('');
  const [instDue, setInstDue] = useState('');
  const [instNote, setInstNote] = useState('');

  const verify = async (action: 'VERIFIED' | 'REJECTED') => {
    if (action === 'REJECTED' && reason.trim().length < 5) {
      flash('err', 'Please give a rejection reason (min 5 chars).');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/verifications/project/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return flash('err', data.error || 'Action failed');
      flash('ok', action === 'VERIFIED' ? 'Project approved — now Ongoing.' : 'Project rejected.');
      setRejecting(false);
      setReason('');
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const saveProject = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim() || null,
          budgetAmount: budget === '' ? null : budget,
          currency,
          fundingAgency: agency,
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
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const addInstallment = async () => {
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
      onChanged();
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
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const deleteInstallment = async (inst: Installment) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/installments/${inst.id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); return flash('err', d.error || 'Delete failed'); }
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const addReport = async () => {
    if (!newReport.reportType) return flash('err', 'Select a report type.');
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

  const released = project.installments.filter((i) => i.status === 'RELEASED').reduce((s, i) => s + Number(i.amount), 0);
  const scheduled = project.installments.reduce((s, i) => s + Number(i.amount), 0);

  const verifBadge = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  }[project.verificationStatus];

  const statusBadge: Record<string, string> = {
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
    ONGOING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{project.title}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${verifBadge}`}>{project.verificationStatus}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge[project.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>{project.status}</span>
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
              <p className="text-xs text-gray-600 mt-2">
                Budget: <span className="font-semibold text-[#c9a961]">{fmtMoney(Number(project.budgetAmount), project.currency ?? 'PKR')}</span>
                {project.installments.length > 0 && (
                  <> · Released {fmtMoney(released, project.currency ?? 'PKR')} of {fmtMoney(scheduled, project.currency ?? 'PKR')}</>
                )}
              </p>
            )}
            {project.rejectionReason && (
              <p className="text-xs text-red-600 mt-1">Rejected: {project.rejectionReason}</p>
            )}
          </div>

          {/* Approve / Reject for pending */}
          {project.verificationStatus === 'PENDING' && !rejecting && (
            <div className="flex gap-2">
              <button onClick={() => verify('VERIFIED')} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => setRejecting(true)} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-lg">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
          {project.verificationStatus !== 'PENDING' && (
            <button onClick={() => setExpanded((v) => !v)} className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
              {expanded ? 'Close' : 'Manage'}
            </button>
          )}
        </div>

        {/* Reject reason box */}
        {rejecting && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (min 5 chars)"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="flex gap-2">
              <button onClick={() => verify('REJECTED')} disabled={busy} className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg">Confirm Reject</button>
              <button onClick={() => { setRejecting(false); setReason(''); }} className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Management panel — for approved projects */}
      {expanded && project.verificationStatus !== 'PENDING' && (
        <div className="border-t border-gray-100 bg-gray-50/60 p-5 space-y-5">
          {/* Title + Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Project Details</h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 resize-none" />
              </div>
            </div>
          </div>

          {/* Budget + status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Budget &amp; Status</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Budget</label>
                <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Currency</label>
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Funding Agency</label>
                <input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="e.g. HEC" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as AdminProject['status'])} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
            <button onClick={saveProject} disabled={busy} className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2d6a4f] hover:bg-[#235a40] disabled:opacity-60 rounded-lg">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Changes
            </button>
          </div>

          {/* Installments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Installment Schedule</h4>
            {project.installments.length > 0 ? (
              <div className="space-y-2 mb-3">
                {project.installments.map((inst) => (
                  <div key={inst.id} className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <span className="font-semibold text-gray-700">#{inst.installmentNo}</span>
                    <span className="text-gray-900">{fmtMoney(Number(inst.amount), project.currency ?? 'PKR')}</span>
                    <span className="text-xs text-gray-400">Due {fmtDate(inst.dueDate)}</span>
                    {inst.note && <span className="text-xs text-gray-400 italic">{inst.note}</span>}
                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${inst.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {inst.status === 'RELEASED' ? `Released ${fmtDate(inst.releaseDate)}` : 'Pending'}
                    </span>
                    <button onClick={() => toggleInstallment(inst)} disabled={busy} className="text-xs font-medium text-[#2d6a4f] hover:underline disabled:opacity-60">
                      {inst.status === 'RELEASED' ? 'Mark Pending' : 'Mark Released'}
                    </button>
                    <button onClick={() => deleteInstallment(inst)} disabled={busy} className="text-red-500 hover:text-red-700 disabled:opacity-60">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">No installments scheduled yet.</p>
            )}
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount</label>
                <input type="number" min="0" value={instAmount} onChange={(e) => setInstAmount(e.target.value)} className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={instDue} onChange={(e) => setInstDue(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
                <input value={instNote} onChange={(e) => setInstNote(e.target.value)} placeholder="e.g. 1st tranche" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <button onClick={addInstallment} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#c9a961] hover:bg-[#b8985a] disabled:opacity-60 rounded-lg">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Post-Award Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Post-Award Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Award Letter Date</label>
                <input type="date" value={awardLetterDate} onChange={(e) => setAwardLetterDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Funding Agency Ref No</label>
                <input value={agencyRefNo} onChange={(e) => setAgencyRefNo(e.target.value)} placeholder="e.g. HEC/R&D/2024/001" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">ORIC Overhead Amount</label>
                <input type="number" min="0" value={overhead} onChange={(e) => setOverhead(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Overhead Status</label>
                <select value={overheadStatus} onChange={(e) => setOverheadStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Waived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reports Status</label>
                <select value={reportsStatus} onChange={(e) => setReportsStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>No Report Due</option>
                  <option>Report Due</option>
                  <option>Report Submitted</option>
                  <option>Report Reviewed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">File Status</label>
                <select value={fileStatus} onChange={(e) => setFileStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>File Received</option>
                  <option>File Pending</option>
                  <option>File Incomplete</option>
                  <option>File Closed</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Special Conditions</label>
                <textarea rows={2} value={specialConditions} onChange={(e) => setSpecialConditions(e.target.value)} placeholder="Any special conditions imposed by funder…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Internal ORIC remarks…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 resize-none" />
              </div>
            </div>
          </div>

          {/* Submission Info (read-only) */}
          {(project.thematicArea || project.projectCategory || project.funderType || project.sponsoringAgency || project.coPIs.length > 0 || project.teamMembers.length > 0) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Submission Info</h4>
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 text-sm">
                {(project.thematicArea || project.projectCategory || project.projectType || project.funderType) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {project.thematicArea && <div><span className="text-gray-400">Thematic Area</span><p className="font-medium text-gray-800 mt-0.5">{project.thematicArea}</p></div>}
                    {project.projectCategory && <div><span className="text-gray-400">Category</span><p className="font-medium text-gray-800 mt-0.5">{project.projectCategory}</p></div>}
                    {project.projectType && <div><span className="text-gray-400">Type</span><p className="font-medium text-gray-800 mt-0.5">{project.projectType}</p></div>}
                    {project.funderType && <div><span className="text-gray-400">Funder Type</span><p className="font-medium text-gray-800 mt-0.5">{project.funderType}{project.funderLocation ? ` · ${project.funderLocation}` : ''}</p></div>}
                  </div>
                )}
                {(project.sponsoringAgency || project.sponsorCountry || project.counterpartName) && (
                  <div className="text-xs">
                    <span className="text-gray-400">Sponsoring Agency</span>
                    <p className="font-medium text-gray-800 mt-0.5">
                      {project.sponsoringAgency}{project.sponsorCountry ? ` (${project.sponsorCountry})` : ''}
                      {project.counterpartName ? ` · Counterpart: ${project.counterpartName}` : ''}
                    </p>
                  </div>
                )}
                {project.coPIs.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 block mb-1.5">Co-PIs ({project.coPIs.length})</span>
                    <div className="space-y-1">
                      {project.coPIs.map((c) => (
                        <div key={c.id} className="flex flex-wrap gap-x-3 text-xs bg-gray-50 rounded-lg px-3 py-2">
                          <span className="font-medium text-gray-800">{c.name}</span>
                          {c.designation && <span className="text-gray-500">{c.designation}</span>}
                          {c.organization && <span className="text-gray-400">{c.organization}</span>}
                          {c.email && <span className="text-gray-400">{c.email}</span>}
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${c.type === 'External' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{c.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {project.teamMembers.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 block mb-1.5">Team Members ({project.teamMembers.length})</span>
                    <div className="space-y-1">
                      {project.teamMembers.map((m) => (
                        <div key={m.id} className="flex flex-wrap gap-x-3 text-xs bg-gray-50 rounded-lg px-3 py-2">
                          <span className="font-medium text-gray-800">{m.name}</span>
                          {m.designation && <span className="text-gray-500">{m.designation}</span>}
                          {m.department && <span className="text-gray-400">{m.department}</span>}
                          {m.role && <span className="text-[#2d6a4f] font-medium">{m.role}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Project Reports</h4>
            {reports.length > 0 ? (
              <div className="space-y-2 mb-3">
                {reports.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-gray-700">{r.reportType}</span>
                    {r.dueDate && <span className="text-xs text-gray-400">Due {fmtDate(r.dueDate)}</span>}
                    {r.submissionDate && <span className="text-xs text-gray-400">Submitted {fmtDate(r.submissionDate)}</span>}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700' :
                      r.status === 'Reviewed' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{r.status}</span>
                    <button onClick={() => deleteReport(r.id)} disabled={busy} className="ml-auto text-red-500 hover:text-red-700 disabled:opacity-60">
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
                <select value={newReport.reportType} onChange={(e) => setNewReport((p) => ({ ...p, reportType: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>Progress</option>
                  <option>Mid-Term</option>
                  <option>Final</option>
                  <option>Financial</option>
                  <option>Annual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={newReport.dueDate} onChange={(e) => setNewReport((p) => ({ ...p, dueDate: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={newReport.status} onChange={(e) => setNewReport((p) => ({ ...p, status: e.target.value }))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30">
                  <option>Due</option>
                  <option>Submitted</option>
                  <option>Reviewed</option>
                  <option>Overdue</option>
                </select>
              </div>
              <button onClick={addReport} disabled={busy} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#c9a961] hover:bg-[#b8985a] disabled:opacity-60 rounded-lg">
                <Plus className="w-4 h-4" /> Add Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
