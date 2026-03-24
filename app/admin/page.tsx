'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Building2,
  GraduationCap,
  ArrowRight,
  FlaskConical,
  Briefcase,
  Calendar,
  Sparkles,
  AlertCircle,
  Shield,
} from 'lucide-react';
import Header from '@/components/Header';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminStats {
  totalFaculty: number;
  pendingCount: number;
  rejectedCount: number;
  totalDepartments: number;
  pendingVerifications?: number;
}

interface PendingFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: {
    name: string;
    faculty: string;
  };
  specialization: string | null;
  experienceYears: string | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

interface QuickActionProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

function QuickActionCard({ icon, iconBg, title, description, href, badge }: QuickActionProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#2d6a4f]/20 transition-all duration-200 text-left w-full"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#2d6a4f] transition-colors">
                {title}
              </h3>
              {badge && (
                <span className="px-1.5 py-0.5 text-xs bg-[#c9a961]/20 text-[#8a6e2f] rounded font-medium">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2d6a4f] group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [pendingFaculty, setPendingFaculty] = useState<PendingFaculty[]>([]);
  const [loading, setLoading]           = useState(true);
  const [processing, setProcessing]     = useState<string | null>(null);
  const [now, setNow]                   = useState(new Date());

  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    facultyId: string;
    facultyName: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, verifRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/pending-faculty'),
        fetch('/api/admin/verifications'),
      ]);
      if (!statsRes.ok || !pendingRes.ok) {
        router.push('/login');
        return;
      }
      const statsData   = await statsRes.json();
      const pendingData = await pendingRes.json();
      const verifData   = verifRes.ok ? await verifRes.json() : null;
      setStats({ ...statsData, pendingVerifications: verifData?.totalPending ?? 0 });
      setPendingFaculty(pendingData.faculty || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleApprove = async (facultyId: string) => {
    if (!confirm('Are you sure you want to approve this faculty member?')) return;
    try {
      setProcessing(facultyId);
      const response = await fetch(`/api/admin/faculty/${facultyId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      });
      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve faculty');
      }
    } catch (error) {
      console.error('Error approving faculty:', error);
      alert('Failed to approve faculty');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModal || rejectionReason.trim().length < 20) {
      alert('Rejection reason must be at least 20 characters');
      return;
    }
    try {
      setProcessing(rejectionModal.facultyId);
      const response = await fetch(`/api/admin/faculty/${rejectionModal.facultyId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (response.ok) {
        setRejectionModal(null);
        setRejectionReason('');
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject faculty');
      }
    } catch (error) {
      console.error('Error rejecting faculty:', error);
      alert('Failed to reject faculty');
    } finally {
      setProcessing(null);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Loading administration portal…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const rejectionValid = rejectionReason.trim().length >= 20;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#c9a961]" />
                <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">Administration Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MNSUAM Admin Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm text-gray-500">
                  {now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  {now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] transition-colors shadow-sm shadow-[#2d6a4f]/20"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Pending Approvals — amber */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-2xl border border-amber-100 shadow-sm p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-700">{stats?.pendingCount ?? 0}</p>
              <p className="text-sm font-medium text-amber-800 mt-0.5">Pending Approvals</p>
              {(stats?.pendingCount ?? 0) > 0 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Requires attention
                </p>
              )}
            </div>
          </div>

          {/* Approved Faculty — green */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2d6a4f]/5 to-[#2d6a4f]/10 rounded-2xl border border-[#2d6a4f]/15 shadow-sm p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#2d6a4f]/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                <UserCheck className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <p className="text-3xl font-bold text-[#2d6a4f]">{stats?.totalFaculty ?? 0}</p>
              <p className="text-sm font-medium text-[#2d6a4f] mt-0.5">Approved Faculty</p>
              <p className="text-xs text-[#2d6a4f]/60 mt-1">Active members</p>
            </div>
          </div>

          {/* Rejected — red */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/60 rounded-2xl border border-red-100 shadow-sm p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/30 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-700">{stats?.rejectedCount ?? 0}</p>
              <p className="text-sm font-medium text-red-800 mt-0.5">Rejected</p>
              <p className="text-xs text-red-400 mt-1">Applications denied</p>
            </div>
          </div>

          {/* Total Departments — blue */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/60 rounded-2xl border border-blue-100 shadow-sm p-5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{stats?.totalDepartments ?? 0}</p>
              <p className="text-sm font-medium text-blue-800 mt-0.5">Total Departments</p>
              <p className="text-xs text-blue-400 mt-1">Across all faculties</p>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Navigate to management sections</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Building2 className="w-5 h-5 text-[#2d6a4f]" />}
              iconBg="bg-[#2d6a4f]/10"
              title="Manage Faculties"
              description="Add, edit, or remove faculties in the system"
              href="/admin/faculties"
            />
            <QuickActionCard
              icon={<GraduationCap className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50"
              title="Manage Departments"
              description="Add, edit, or remove departments across faculties"
              href="/admin/departments"
            />
            <QuickActionCard
              icon={<FlaskConical className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-50"
              title="CLS Equipment"
              description="Review and manage lab equipment borrowing requests"
              href="/admin/cls"
              badge="New"
            />
            <QuickActionCard
              icon={<Users className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-50"
              title="Faculty Members"
              description="Browse all active faculty members across departments"
              href="/staff"
            />
            <QuickActionCard
              icon={<Briefcase className="w-5 h-5 text-rose-600" />}
              iconBg="bg-rose-50"
              title="Pending Applications"
              description={`${stats?.pendingCount ?? 0} application${(stats?.pendingCount ?? 0) !== 1 ? 's' : ''} awaiting review`}
              href="#pending"
            />
            <QuickActionCard
              icon={<UserCheck className="w-5 h-5 text-teal-600" />}
              iconBg="bg-teal-50"
              title="University Dashboard"
              description="View the public university overview and statistics"
              href="/uni-dashboard"
            />
            <QuickActionCard
              icon={<FlaskConical className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              title="Manage Labs"
              description="Add, edit, or remove labs and their equipment"
              href="/admin/labs"
              badge="Labs"
            />
            <QuickActionCard
              icon={<Shield className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50"
              title="Content Verification"
              description={`Review teacher-submitted publications, projects, courses & profiles`}
              href="/admin/verifications"
              badge={(stats?.pendingVerifications ?? 0) > 0 ? `${stats?.pendingVerifications} pending` : undefined}
            />
          </div>
        </div>

        {/* ── Pending Faculty Applications ────────────────────────────────── */}
        <div id="pending">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Pending Faculty Applications</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {pendingFaculty.length === 0
                  ? 'No applications awaiting review'
                  : `${pendingFaculty.length} application${pendingFaculty.length !== 1 ? 's' : ''} require your attention`}
              </p>
            </div>
            {pendingFaculty.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                <Clock className="w-3 h-3" />
                {pendingFaculty.length} pending
              </span>
            )}
          </div>

          {pendingFaculty.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
              <div className="w-16 h-16 bg-[#2d6a4f]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-[#2d6a4f]/60" />
              </div>
              <p className="text-gray-600 font-medium">All caught up!</p>
              <p className="text-sm text-gray-400 mt-1">No pending faculty applications at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFaculty.map((faculty) => (
                <div
                  key={faculty.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#2d6a4f]/20 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-5">

                    {/* Avatar + identity */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#2d6a4f]/20">
                        <span className="text-white font-bold text-sm">
                          {getInitials(faculty.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="text-base font-semibold text-gray-900">{faculty.name}</h3>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{faculty.email}</p>

                        {/* Info grid */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs">
                          <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Designation</p>
                            <p className="text-gray-800 font-semibold mt-0.5">{faculty.designation}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Department</p>
                            <p className="text-gray-800 font-semibold mt-0.5">{faculty.department.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Faculty</p>
                            <p className="text-gray-800 font-semibold mt-0.5">{faculty.department.faculty}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px]">Experience</p>
                            <p className="text-gray-800 font-semibold mt-0.5">{faculty.experienceYears ?? 'N/A'}</p>
                          </div>
                        </div>

                        {faculty.specialization && (
                          <p className="mt-2 text-xs text-gray-500">
                            <span className="text-gray-400">Specialization: </span>
                            {faculty.specialization}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Submitted {fmtDateTime(faculty.createdAt)}
                          <span className="text-gray-300">·</span>
                          {timeAgo(faculty.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:w-36 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(faculty.id)}
                        disabled={processing === faculty.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#245a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#2d6a4f]/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processing === faculty.id ? 'Processing…' : 'Approve'}
                      </button>
                      <button
                        onClick={() =>
                          setRejectionModal({
                            isOpen: true,
                            facultyId: faculty.id,
                            facultyName: faculty.name,
                          })
                        }
                        disabled={processing === faculty.id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 bg-red-50 rounded-xl text-sm font-semibold hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Rejection Modal ───────────────────────────────────────────────── */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white">Reject Faculty Application</h3>
              <p className="text-sm text-white/80 mt-0.5">
                Rejecting: <span className="font-semibold">{rejectionModal.facultyName}</span>
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Rejection Reason{' '}
                  <span className="text-red-500">*</span>{' '}
                  <span className="text-gray-400 font-normal">(min 20 characters)</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 outline-none resize-none transition-colors ${
                    rejectionValid
                      ? 'border-gray-200 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-200 focus:ring-red-100 focus:border-red-300'
                  }`}
                  placeholder="Please provide a clear reason for rejection…"
                />
                <p className={`text-xs mt-1.5 ${rejectionValid ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {rejectionReason.length} / 500 characters
                  {rejectionValid && ' ✓ Minimum met'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setRejectionModal(null); setRejectionReason(''); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionValid || processing === rejectionModal.facultyId}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {processing === rejectionModal.facultyId ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
