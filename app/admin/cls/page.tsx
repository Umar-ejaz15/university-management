'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FlaskConical,
  PackageCheck,
  PackageX,
  Layers,
  CalendarRange,
  ChevronDown,
} from 'lucide-react';
import Header from '@/components/Header';

// ─── Types ───────────────────────────────────────────────────────────────────

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

interface CLSRequest {
  id: string;
  teacherName: string;
  teacherEmail: string;
  equipmentName: string;
  labName: string;
  purpose: string;
  fromDate: string;
  toDate: string;
  status: RequestStatus;
  approvedAt?: string;
  returnedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

interface CLSStats {
  total: number;
  pending: number;
  approved: number;
  returned: number;
  rejected: number;
}

type TabValue = 'ALL' | RequestStatus;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(a: string, b: string): number {
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const badgeCfg: Record<RequestStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-amber-100  text-amber-700  border-amber-200'  },
  APPROVED: { label: 'Active',   cls: 'bg-blue-100   text-blue-700   border-blue-200'   },
  REJECTED: { label: 'Rejected', cls: 'bg-red-100    text-red-700    border-red-200'    },
  RETURNED: { label: 'Returned', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

function StatusBadge({ status }: { status: RequestStatus }) {
  const { label, cls } = badgeCfg[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

interface ApproveModalProps {
  request: CLSRequest;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  processing: boolean;
}

function ApproveModal({ request, onClose, onConfirm, processing }: ApproveModalProps) {
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d6a4f] to-[#40916c] px-6 py-4">
          <h3 className="text-lg font-bold text-white">Approve Equipment Request</h3>
          <p className="text-sm text-white/80 mt-0.5">Confirm loan approval for this request</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Teacher</span>
              <span className="font-medium text-gray-900">{request.teacherName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Equipment</span>
              <span className="font-medium text-gray-900">{request.equipmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Period</span>
              <span className="font-medium text-gray-900">{fmtDate(request.fromDate)} → {fmtDate(request.toDate)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Admin Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] outline-none resize-none"
              placeholder="Add any notes for the teacher…"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(notes)}
            disabled={processing}
            className="flex-1 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#245a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {processing ? 'Approving…' : 'Approve Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

interface RejectModalProps {
  request: CLSRequest;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  processing: boolean;
}

function RejectModal({ request, onClose, onConfirm, processing }: RejectModalProps) {
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 20;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Reject Equipment Request</h3>
          <p className="text-sm text-white/80 mt-0.5">Provide a reason for the teacher</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <p className="text-gray-500 mb-1">Request by</p>
            <p className="font-semibold text-gray-900">{request.teacherName}</p>
            <p className="text-gray-600 mt-0.5">{request.equipmentName} — {request.labName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rejection Reason{' '}
              <span className="text-red-500">*</span>{' '}
              <span className="text-gray-400 font-normal">(min 20 characters)</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 outline-none resize-none transition-colors ${
                valid
                  ? 'border-gray-200 focus:ring-red-200 focus:border-red-400'
                  : 'border-gray-200 focus:ring-red-100 focus:border-red-300'
              }`}
              placeholder="Explain why this request cannot be approved…"
            />
            <p className={`text-xs mt-1 ${valid ? 'text-emerald-600' : 'text-gray-400'}`}>
              {reason.trim().length} / 20 minimum characters
            </p>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={!valid || processing}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            {processing ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ request, onClose }: { request: CLSRequest; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d6a4f] to-[#40916c] px-6 py-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Request Details</h3>
            <p className="text-sm text-white/80 mt-0.5">Full information for this loan request</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white mt-0.5 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center font-bold text-[#2d6a4f]">
              {(request.teacherName ?? '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{request.teacherName}</p>
              <p className="text-sm text-gray-500">{request.teacherEmail}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={request.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-0.5">Equipment</p>
              <p className="font-semibold text-gray-900">{request.equipmentName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-0.5">Lab</p>
              <p className="font-semibold text-gray-900">{request.labName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-0.5">From</p>
              <p className="font-semibold text-gray-900">{fmtDate(request.fromDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-0.5">To</p>
              <p className="font-semibold text-gray-900">{fmtDate(request.toDate)}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <p className="text-gray-500 text-xs mb-1">Purpose</p>
            <p className="text-gray-800 leading-relaxed">{request.purpose}</p>
          </div>

          {request.status === 'REJECTED' && request.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm">
              <p className="text-red-500 text-xs mb-1 font-medium">Rejection Reason</p>
              <p className="text-red-800 leading-relaxed">{request.rejectionReason}</p>
            </div>
          )}

          {request.adminNotes && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
              <p className="text-blue-500 text-xs mb-1 font-medium">Admin Notes</p>
              <p className="text-blue-800 leading-relaxed">{request.adminNotes}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCLSPage() {
  const [requests, setRequests]   = useState<CLSRequest[]>([]);
  const [stats, setStats]         = useState<CLSStats | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const [approveModal, setApproveModal] = useState<CLSRequest | null>(null);
  const [rejectModal,  setRejectModal]  = useState<CLSRequest | null>(null);
  const [viewModal,    setViewModal]    = useState<CLSRequest | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const statusParam = activeTab === 'ALL' ? '' : activeTab;
      const [reqRes, statsRes] = await Promise.all([
        fetch(`/api/admin/cls/requests?status=${statusParam}&page=1&limit=50`),
        fetch('/api/admin/cls/stats'),
      ]);
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.requests ?? data ?? []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      console.error('CLS fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleApprove = async (id: string, notes: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/cls/requests/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setApproveModal(null);
        await fetchData(true);
      } else {
        const d = await res.json();
        alert(d.error ?? 'Failed to approve request');
      }
    } catch { alert('Failed to approve request'); }
    finally { setProcessing(null); }
  };

  const handleReject = async (id: string, reason: string) => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/cls/requests/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setRejectModal(null);
        await fetchData(true);
      } else {
        const d = await res.json();
        alert(d.error ?? 'Failed to reject request');
      }
    } catch { alert('Failed to reject request'); }
    finally { setProcessing(null); }
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'ALL',      label: 'All'      },
    { value: 'PENDING',  label: 'Pending'  },
    { value: 'APPROVED', label: 'Active'   },
    { value: 'RETURNED', label: 'Returned' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  const displayedRequests =
    activeTab === 'ALL'
      ? requests
      : requests.filter((r) => r.status === activeTab);

  // ── Duration cell ─────────────────────────────────────────────────────────

  function DurationCell({ req }: { req: CLSRequest }) {
    if (req.status === 'RETURNED' && req.returnedAt) {
      const days = daysBetween(req.approvedAt ?? req.fromDate, req.returnedAt);
      return <span className="text-gray-700 font-medium">{days}d borrowed</span>;
    }
    if (req.status === 'APPROVED' && req.approvedAt) {
      const days = daysBetween(req.approvedAt, new Date().toISOString());
      return <span className="text-blue-600 font-medium">{days}d active</span>;
    }
    const planned = daysBetween(req.fromDate, req.toDate);
    return <span className="text-gray-500">{planned}d planned</span>;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#40916c] flex items-center justify-center shadow-lg shadow-[#2d6a4f]/20">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CLS Management</h1>
                <p className="text-sm text-gray-500 mt-0.5">Central Lab System — Equipment Requests</p>
              </div>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.total ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Requests</p>
            </div>
          </div>
          {/* Pending */}
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats?.pending ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Pending</p>
            </div>
          </div>
          {/* Active loans */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <PackageCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats?.approved ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Active Loans</p>
            </div>
          </div>
          {/* Completed */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <PackageX className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{stats?.returned ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Completed</p>
            </div>
          </div>
        </div>

        {/* ── Table card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 mb-[-1px] text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.value
                    ? 'border-[#2d6a4f] text-[#2d6a4f] bg-[#2d6a4f]/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.value !== 'ALL' && stats && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value ? 'bg-[#2d6a4f] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.value === 'PENDING'  ? stats.pending  :
                     tab.value === 'APPROVED' ? stats.approved :
                     tab.value === 'RETURNED' ? stats.returned :
                     stats.rejected}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading requests…</p>
              </div>
            </div>
          ) : displayedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <FlaskConical className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No requests found</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === 'ALL' ? 'No equipment requests have been submitted yet.' : `No ${activeTab.toLowerCase()} requests at this time.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><CalendarRange className="w-3.5 h-3.5" />Period</span>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Teacher */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center flex-shrink-0 font-semibold text-[#2d6a4f] text-xs">
                            {(req.teacherName ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 leading-tight">{req.teacherName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{req.teacherEmail}</p>
                          </div>
                        </div>
                      </td>
                      {/* Equipment */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 leading-tight">{req.equipmentName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" />{req.labName}
                        </p>
                      </td>
                      {/* Purpose */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-gray-600 leading-snug">{truncate(req.purpose, 50)}</p>
                      </td>
                      {/* Period */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-gray-700">
                          <p>{fmtDate(req.fromDate)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <ChevronDown className="w-3 h-3" />{fmtDate(req.toDate)}
                          </p>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      {/* Duration */}
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        <DurationCell req={req} />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => setApproveModal(req)}
                                disabled={processing === req.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d6a4f] text-white rounded-lg text-xs font-semibold hover:bg-[#245a42] disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModal(req)}
                                disabled={processing === req.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setViewModal(req)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {approveModal && (
        <ApproveModal
          request={approveModal}
          onClose={() => setApproveModal(null)}
          onConfirm={(notes) => handleApprove(approveModal.id, notes)}
          processing={processing === approveModal.id}
        />
      )}
      {rejectModal && (
        <RejectModal
          request={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={(reason) => handleReject(rejectModal.id, reason)}
          processing={processing === rejectModal.id}
        />
      )}
      {viewModal && (
        <ViewModal
          request={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}
    </div>
  );
}
