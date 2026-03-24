'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import {
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FlaskConical,
  GraduationCap,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  ShieldCheck,
  Hash,
  Users,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type VerifStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface StaffRef { id: string; name: string; email: string; department: { name: string } }

interface PendingProfile {
  id: string; name: string; email: string; designation: string;
  bio: string | null; specialization: string | null; qualifications: string | null;
  experienceYears: string | null; profileImage: string | null;
  profileVerificationStatus: VerifStatus; profileRejectionReason: string | null;
  updatedAt: string; department: { name: string };
}
interface PendingPublication {
  id: string; title: string; year: number; journal: string | null;
  authors: string; doi: string | null; abstract: string | null; imageUrl: string | null;
  verificationStatus: VerifStatus; rejectionReason: string | null;
  updatedAt: string; staff: StaffRef;
}
interface PendingProject {
  id: string; title: string; description: string | null; status: string;
  imageUrl: string | null; verificationStatus: VerifStatus; rejectionReason: string | null;
  updatedAt: string; staff: StaffRef;
}
interface PendingCourse {
  id: string; name: string; credits: number; students: number;
  verificationStatus: VerifStatus; rejectionReason: string | null;
  updatedAt: string; staff: StaffRef;
}
interface VerifData {
  totalPending: number;
  counts: { profiles: number; publications: number; projects: number; courses: number };
  pendingProfiles: PendingProfile[];
  pendingPublications: PendingPublication[];
  pendingProjects: PendingProject[];
  pendingCourses: PendingCourse[];
}

// Per-teacher aggregated pending data
interface TeacherPending {
  id: string; name: string; email: string; department: string;
  profileImage: string | null;
  profile: PendingProfile | null;
  publications: PendingPublication[];
  projects: PendingProject[];
  courses: PendingCourse[];
  total: number;
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

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
            <h3 className="text-base font-bold text-white">Reject Section</h3>
            <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">Provide a clear reason so the teacher knows exactly what to fix.</p>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason <span className="text-red-500">*</span>{' '}
              <span className="text-gray-400 font-normal">(min 10 chars)</span>
            </label>
            <textarea
              rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Missing DOI, incorrect year, incomplete author list…"
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

// ─── Small action buttons inline ──────────────────────────────────────────────

function InlineActions({ label, onVerify, onReject, processing }: {
  label: string; onVerify: () => void; onReject: (r: string) => void; processing: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onVerify} disabled={processing}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Approve
        </button>
        <button
          onClick={() => setShowModal(true)} disabled={processing}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
        {processing && <span className="text-xs text-gray-400 animate-pulse">Processing…</span>}
      </div>
      {showModal && (
        <RejectModal
          title={label}
          onClose={() => setShowModal(false)}
          onConfirm={(r) => { setShowModal(false); onReject(r); }}
          processing={processing}
        />
      )}
    </>
  );
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function Chip({ status }: { status: VerifStatus }) {
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

// ─── Section tag (mini pill showing how many pending per type) ────────────────

function SectionTag({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {icon}{count} {label}
    </span>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────

function TeacherCard({
  teacher, act, isProc,
}: {
  teacher: TeacherPending;
  act: (type: string, id: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => Promise<void>;
  isProc: (type: string, id: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const initials = teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Teacher header row — click to expand */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-gray-100">
          {teacher.profileImage ? (
            <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center">
              <span className="text-[#2d6a4f] font-bold text-sm">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{teacher.name}</p>
          <p className="text-xs text-gray-500 truncate">{teacher.email} · {teacher.department}</p>
          {/* Section tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {teacher.profile && (
              <SectionTag icon={<User className="w-3 h-3" />} count={1} label="Profile" color="bg-purple-50 text-purple-700" />
            )}
            <SectionTag icon={<BookOpen className="w-3 h-3" />} count={teacher.publications.length} label="Publications" color="bg-blue-50 text-blue-700" />
            <SectionTag icon={<FlaskConical className="w-3 h-3" />} count={teacher.projects.length} label="Projects" color="bg-[#2d6a4f]/10 text-[#2d6a4f]" />
            <SectionTag icon={<GraduationCap className="w-3 h-3" />} count={teacher.courses.length} label="Courses" color="bg-amber-50 text-amber-700" />
          </div>
        </div>

        {/* Total badge + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">
            {teacher.total}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded sections */}
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">

          {/* ── Profile section ── */}
          {teacher.profile && (
            <div className="bg-purple-50/20">
              {/* Section heading */}
              <div className="flex items-center gap-2 px-6 py-3 bg-purple-100/40 border-b border-purple-100">
                <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-purple-800 text-sm uppercase tracking-wide">Profile</span>
                <Chip status={teacher.profile.profileVerificationStatus} />
                <span className="ml-auto text-xs text-gray-400">
                  Updated {new Date(teacher.profile.updatedAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
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
              </div>{/* end px-6 py-5 */}
            </div>
          )}

          {/* ── Publications ── */}
          {teacher.publications.length > 0 && (
            <div className="bg-blue-50/10">
              <div className="flex items-center gap-2 px-6 py-3 bg-blue-100/40 border-b border-blue-100">
                <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-blue-800 text-sm uppercase tracking-wide">Publications</span>
                <span className="ml-1 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">{teacher.publications.length}</span>
              </div>
              {teacher.publications.map((pub) => (
              <div key={pub.id} className="px-6 py-4 border-b border-blue-50/50 last:border-0">
              <div className="flex items-start gap-3">
                {pub.imageUrl && (
                  <img src={pub.imageUrl} alt={pub.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900 text-sm line-clamp-1">{pub.title}</span>
                    <Chip status={pub.verificationStatus} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
                    <span>{pub.year}</span>
                    {pub.journal && <><span>·</span><span>{pub.journal}</span></>}
                    {pub.doi && <><span>·</span><span className="font-mono">DOI: {pub.doi}</span></>}
                  </div>
                  {pub.abstract && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{pub.abstract}</p>
                  )}
                  <InlineActions
                    label={pub.title}
                    onVerify={() => act('publication', pub.id, 'VERIFIED')}
                    onReject={(r) => act('publication', pub.id, 'REJECTED', r)}
                    processing={isProc('publication', pub.id)}
                  />
                </div>
              </div>
              </div>
              ))}
            </div>
          )}

          {/* ── Projects ── */}
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
                  <img src={proj.imageUrl} alt={proj.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{proj.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      proj.status === 'ONGOING' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      proj.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>{proj.status}</span>
                    <Chip status={proj.verificationStatus} />
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

          {/* ── Courses ── */}
          {teacher.courses.length > 0 && (
            <div className="bg-amber-50/20">
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-100/40 border-b border-amber-100">
                <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-amber-800 text-sm uppercase tracking-wide">Courses</span>
                <span className="ml-1 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">{teacher.courses.length}</span>
              </div>
              {teacher.courses.map((course) => (
              <div key={course.id} className="px-6 py-4 border-b border-amber-50 last:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{course.name}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] rounded-full text-xs font-semibold">
                      <Hash className="w-3 h-3" />{course.credits} cr
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold">
                      <Users className="w-3 h-3" />{course.students} students
                    </span>
                    <Chip status={course.verificationStatus} />
                  </div>
                  <InlineActions
                    label={course.name}
                    onVerify={() => act('course', course.id, 'VERIFIED')}
                    onReject={(r) => act('course', course.id, 'REJECTED', r)}
                    processing={isProc('course', course.id)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminVerificationsPage() {
  const [data, setData] = useState<VerifData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/admin/verifications');
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const act = async (type: string, id: string, action: 'VERIFIED' | 'REJECTED', reason?: string) => {
    setProcessing(`${type}:${id}`);
    try {
      const res = await fetch(`/api/admin/verifications/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) await fetchData(true);
      else { const d = await res.json(); alert(d.error || 'Failed'); }
    } catch { alert('Network error'); }
    finally { setProcessing(null); }
  };

  const isProc = (type: string, id: string) => processing === `${type}:${id}`;

  // Group all pending items by teacher
  const teachers = useMemo<TeacherPending[]>(() => {
    if (!data) return [];
    const map = new Map<string, TeacherPending>();

    const ensure = (id: string, name: string, email: string, dept: string, img: string | null) => {
      if (!map.has(id)) map.set(id, { id, name, email, department: dept, profileImage: img, profile: null, publications: [], projects: [], courses: [], total: 0 });
      return map.get(id)!;
    };

    data.pendingProfiles.forEach((p) => {
      const t = ensure(p.id, p.name, p.email, p.department.name, p.profileImage);
      t.profile = p;
    });
    data.pendingPublications.forEach((pub) => {
      const t = ensure(pub.staff.id, pub.staff.name, pub.staff.email, pub.staff.department.name, null);
      t.publications.push(pub);
    });
    data.pendingProjects.forEach((proj) => {
      const t = ensure(proj.staff.id, proj.staff.name, proj.staff.email, proj.staff.department.name, null);
      t.projects.push(proj);
    });
    data.pendingCourses.forEach((c) => {
      const t = ensure(c.staff.id, c.staff.name, c.staff.email, c.staff.department.name, null);
      t.courses.push(c);
    });

    // compute totals and sort by total desc
    return Array.from(map.values())
      .map((t) => ({ ...t, total: (t.profile ? 1 : 0) + t.publications.length + t.projects.length + t.courses.length }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter((t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.department.toLowerCase().includes(q));
  }, [teachers, search]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading verifications…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center shadow-lg shadow-[#2d6a4f]/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Verification</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Review pending submissions from {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
                  {data && data.totalPending > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      <Clock className="w-3 h-3" />{data.totalPending} pending
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchData(true)} disabled={refreshing}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Profiles', count: data?.counts.profiles, icon: <User className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', txt: 'text-purple-700' },
            { label: 'Publications', count: data?.counts.publications, icon: <BookOpen className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', txt: 'text-blue-700' },
            { label: 'Projects', count: data?.counts.projects, icon: <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />, bg: 'bg-[#2d6a4f]/10', txt: 'text-[#2d6a4f]' },
            { label: 'Courses', count: data?.counts.courses, icon: <GraduationCap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', txt: 'text-amber-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className={`text-2xl font-bold ${s.txt}`}>{s.count ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pending {s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* All clear */}
        {teachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-gray-800 font-semibold text-lg">All verified!</p>
            <p className="text-sm text-gray-400 mt-1">No pending submissions at this time.</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by teacher name, email or department…"
                className="flex-1 max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="text-sm text-gray-400">{filtered.length} teacher{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Teacher cards */}
            <div className="space-y-4">
              {filtered.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} act={act} isProc={isProc} />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No teachers match &ldquo;{search}&rdquo;</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
