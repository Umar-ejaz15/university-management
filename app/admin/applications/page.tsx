'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  GraduationCap,
  Calendar,
  Briefcase,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { usePendingFaculty, type PendingFaculty } from '@/lib/queries/admin/stats';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon, label, count, color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${color} bg-white`}>
      <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{count}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Faculty Card ─────────────────────────────────────────────────────────────

function FacultyCard({
  faculty,
  processing,
  onApprove,
  onReject,
}: {
  faculty: PendingFaculty;
  processing: string | null;
  onApprove: (id: string) => void;
  onReject: (faculty: PendingFaculty) => void;
}) {
  const isProcessing = processing === faculty.id;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#2d6a4f]/20 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
        {/* Avatar + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white font-bold text-sm">{getInitials(faculty.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="text-base font-semibold text-gray-900">{faculty.name}</h3>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending Review
              </span>
            </div>
            <p className="text-sm text-gray-500">{faculty.email}</p>

            {/* Details grid */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-xs">
              {([
                ['Designation', faculty.designation, <Briefcase key="d" className="w-3 h-3" />],
                ['Department',  faculty.department.name, <GraduationCap key="dep" className="w-3 h-3" />],
                ['Faculty',     faculty.department.faculty, <Users key="f" className="w-3 h-3" />],
                ['Experience',  faculty.experienceYears ?? 'N/A', <Calendar key="e" className="w-3 h-3" />],
              ] as [string, string, React.ReactNode][]).map(([label, val, icon]) => (
                <div key={label}>
                  <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] flex items-center gap-1">
                    {icon} {label}
                  </p>
                  <p className="text-gray-800 font-semibold mt-0.5 truncate">{val}</p>
                </div>
              ))}
            </div>

            {faculty.specialization && (
              <p className="mt-2.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-400 font-medium">Specialization: </span>
                {faculty.specialization}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Applied {fmtDateTime(faculty.createdAt)}
              <span className="text-gray-300">·</span>
              {timeAgo(faculty.createdAt)}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:w-36 shrink-0">
          <button
            onClick={() => onApprove(faculty.id)}
            disabled={isProcessing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#245a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            {isProcessing ? 'Processing…' : 'Approve'}
          </button>
          <button
            onClick={() => onReject(faculty)}
            disabled={isProcessing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 bg-red-50 rounded-xl text-sm font-semibold hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rejection Modal ──────────────────────────────────────────────────────────

function RejectionModal({
  faculty,
  processing,
  onConfirm,
  onCancel,
}: {
  faculty: PendingFaculty;
  processing: string | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-linear-to-r from-red-600 to-red-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Reject Application</h3>
          <p className="text-sm text-white/80 mt-0.5">
            Rejecting: <span className="font-semibold">{faculty.name}</span>
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rejection Reason <span className="text-red-500">*</span>{' '}
              <span className="text-gray-400 font-normal">(min 20 characters)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none transition-colors"
              placeholder="Please provide a clear reason for rejection…"
            />
            <p className={`text-xs mt-1 ${valid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {reason.length} characters{valid && ' ✓'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!valid || processing === faculty.id}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            {processing === faculty.id ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const { data: pendingFaculty = [], isLoading, refetch } = usePendingFaculty();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingFaculty | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'pending-faculty'] });
  };

  const handleApprove = async (facultyId: string) => {
    if (!confirm('Approve this faculty member?')) return;
    setProcessing(facultyId);
    try {
      const res = await fetch(`/api/admin/faculty/${facultyId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      });
      if (res.ok) {
        invalidate();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to approve');
      }
    } catch { alert('Network error — please try again.'); }
    finally { setProcessing(null); }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setProcessing(rejectTarget.id);
    try {
      const res = await fetch(`/api/admin/faculty/${rejectTarget.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setRejectTarget(null);
        invalidate();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to reject');
      }
    } catch { alert('Network error — please try again.'); }
    finally { setProcessing(null); }
  };

  // Filter + sort
  const filtered = pendingFaculty
    .filter((f) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        f.department.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading applications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-[#2d6a4f]" />
              <span className="text-xs font-semibold text-[#2d6a4f] uppercase tracking-wider">
                Faculty Applications
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Applications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review and approve faculty members requesting access to the system
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3 mt-4">
          <StatPill
            icon={<Clock className="w-4 h-4 text-amber-600" />}
            label="Pending Review"
            count={pendingFaculty.length}
            color="border-amber-200 text-amber-600"
          />
          <StatPill
            icon={<UserCheck className="w-4 h-4 text-[#2d6a4f]" />}
            label="Shown after filter"
            count={filtered.length}
            color="border-[#2d6a4f]/20 text-[#2d6a4f]"
          />
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* ── Search + Sort ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, designation, department…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
              className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
            <div className="w-16 h-16 bg-[#2d6a4f]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-[#2d6a4f]/50" />
            </div>
            {search ? (
              <>
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-medium">All caught up!</p>
                <p className="text-sm text-gray-400 mt-1">No pending faculty applications at the moment.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faculty) => (
              <FacultyCard
                key={faculty.id}
                faculty={faculty}
                processing={processing}
                onApprove={handleApprove}
                onReject={setRejectTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Rejection Modal ──────────────────────────────────────────────── */}
      {rejectTarget && (
        <RejectionModal
          faculty={rejectTarget}
          processing={processing}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
