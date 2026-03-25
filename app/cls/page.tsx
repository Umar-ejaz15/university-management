'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import {
  FlaskConical,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Building2,
  AlertCircle,
  X,
  Loader2,
  Inbox,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Equipment {
  id: string;
  srNo: number;
  name: string;
  model: string | null;
  quantity: number;
  availableQty: number;
  activeLoans: number;
  notes: string | null;
  labId: string;
}

interface Lab {
  id: string;
  name: string;
  floor: 'GROUND FLOOR' | 'FIRST FLOOR';
  labInCharge: string;
  equipment: Equipment[];
}

interface EquipmentRequest {
  id: string;
  purpose: string;
  studentInfo: string | null;
  requestedFrom: string;
  requestedTo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  adminNotes: string | null;
  approvedAt: string | null;
  borrowedAt: string | null;
  returnedAt: string | null;
  equipment: {
    id: string;
    name: string;
    model: string | null;
    srNo: number;
    lab: {
      id: string;
      name: string;
    };
  };
}

interface EquipmentHistory {
  equipmentId: string;
  equipmentName: string;
  labName: string;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  returned: number;
  lastRequestedAt: string;
}

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface RequestFormState {
  equipmentId: string;
  equipmentName: string;
  labName: string;
  purpose: string;
  studentInfo: string;
  requestedFrom: string;
  requestedTo: string;
}

// ─── Helper utilities ─────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysBetween(from: string | null, to: string | null): number {
  if (!from || !to) return 0;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function StatusBadge({ status }: { status: EquipmentRequest['status'] }) {
  const map: Record<
    EquipmentRequest['status'],
    { label: string; classes: string; Icon: React.ElementType }
  > = {
    PENDING: {
      label: 'Pending',
      classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      Icon: Clock,
    },
    APPROVED: {
      label: 'Approved',
      classes: 'bg-green-100 text-green-800 border border-green-200',
      Icon: CheckCircle,
    },
    REJECTED: {
      label: 'Rejected',
      classes: 'bg-red-100 text-red-800 border border-red-200',
      Icon: XCircle,
    },
    RETURNED: {
      label: 'Returned',
      classes: 'bg-gray-100 text-gray-700 border border-gray-200',
      Icon: RotateCcw,
    },
  };

  const { label, classes, Icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function FloorBadge({ floor }: { floor: Lab['floor'] }) {
  const isGround = floor === 'GROUND FLOOR';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${
        isGround
          ? 'bg-[#2d6a4f]/10 text-[#2d6a4f]'
          : 'bg-[#c9a961]/15 text-[#8a6b2e]'
      }`}
    >
      {floor}
    </span>
  );
}

// ─── Request Modal ─────────────────────────────────────────────────────────────

interface RequestModalProps {
  form: RequestFormState;
  onClose: () => void;
  onSubmit: (form: RequestFormState) => Promise<void>;
  submitting: boolean;
}

function RequestModal({ form: initialForm, onClose, onSubmit, submitting }: RequestModalProps) {
  const [form, setForm] = useState<RequestFormState>(initialForm);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#2d6a4f]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Request Equipment</h2>
              <p className="text-xs text-gray-500">{form.labName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Equipment name (readonly) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Equipment
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <FlaskConical className="w-4 h-4 text-[#2d6a4f] shrink-0" />
              <span className="text-sm font-medium text-gray-800">{form.equipmentName}</span>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Purpose / Why you need it <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe why you need this equipment and how it will be used…"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] resize-none transition"
            />
          </div>

          {/* Student Info */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Student Information <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Who will use the equipment? e.g., Student names, roll numbers, class section…"
              value={form.studentInfo}
              onChange={(e) => setForm({ ...form, studentInfo: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] resize-none transition"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Calendar className="inline w-3 h-3 mr-1" />
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={today}
                value={form.requestedFrom}
                onChange={(e) => setForm({ ...form, requestedFrom: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <Calendar className="inline w-3 h-3 mr-1" />
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={form.requestedFrom || today}
                value={form.requestedTo}
                onChange={(e) => setForm({ ...form, requestedTo: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2d6a4f] hover:bg-[#235a40] disabled:opacity-60 rounded-lg transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Lab Card (expandable) ────────────────────────────────────────────────────

interface LabCardProps {
  lab: Lab;
  user: User | null;
  onRequestClick: (equipment: Equipment, lab: Lab) => void;
}

function LabCard({ lab, user, onRequestClick }: LabCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Lab header / toggle */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{lab.name}</span>
              <FloorBadge floor={lab.floor} />
            </div>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                In-charge: {lab.labInCharge}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {lab.equipment.length} item{lab.equipment.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 ml-3 text-gray-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Equipment table */}
      {expanded && (
        <div className="border-t border-gray-100">
          {lab.equipment.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No equipment listed for this lab.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14">
                      Sr#
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Equipment Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Model
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
                      Total
                    </th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">
                      Available
                    </th>
                    {(user?.role === 'FACULTY' || !user) && (
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lab.equipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{eq.srNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{eq.name}</td>
                      <td className="px-4 py-3 text-gray-500">{eq.model || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                          {eq.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {eq.availableQty > 0 ? (
                          <span className="inline-block px-2 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] rounded text-xs font-semibold">
                            {eq.availableQty} free
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold">
                            In use
                          </span>
                        )}
                      </td>
                      {(user?.role === 'FACULTY' || !user) && (
                        <td className="px-4 py-3 text-center">
                          {!user ? (
                            <span className="text-xs text-gray-400 italic">Login to request</span>
                          ) : eq.availableQty > 0 ? (
                            <button
                              onClick={() => onRequestClick(eq, lab)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#2d6a4f] hover:bg-[#235a40] rounded-lg transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Request
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg cursor-default">
                              <Clock className="w-3 h-3" />
                              Awaiting return
                            </span>
                          )}
                        </td>
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
  );
}

// ─── Equipment Catalog Tab ────────────────────────────────────────────────────

interface CatalogTabProps {
  labs: Lab[];
  loading: boolean;
  user: User | null;
  onRequestClick: (equipment: Equipment, lab: Lab) => void;
}

function CatalogTab({ labs, loading, user, onRequestClick }: CatalogTabProps) {
  const [search, setSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState<'ALL' | 'GROUND FLOOR' | 'FIRST FLOOR'>('ALL');

  const filtered = labs
    .map((lab) => {
      const labMatches =
        floorFilter === 'ALL' || lab.floor === floorFilter;

      const matchedEquipment =
        search.trim() === ''
          ? lab.equipment
          : lab.equipment.filter((eq) =>
              eq.name.toLowerCase().includes(search.toLowerCase())
            );

      const labNameMatches = lab.name.toLowerCase().includes(search.toLowerCase());

      if (!labMatches) return null;
      if (search.trim() !== '' && !labNameMatches && matchedEquipment.length === 0) return null;

      return {
        ...lab,
        equipment: labNameMatches ? lab.equipment : matchedEquipment,
      };
    })
    .filter(Boolean) as Lab[];

  const groundFloorLabs = filtered.filter((l) => l.floor === 'GROUND FLOOR');
  const firstFloorLabs = filtered.filter((l) => l.floor === 'FIRST FLOOR');

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-3 bg-gray-100 rounded w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by equipment name or lab…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white transition"
          />
        </div>

        {/* Floor filter pills */}
        <div className="flex items-center gap-2">
          {(['ALL', 'GROUND FLOOR', 'FIRST FLOOR'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFloorFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                floorFilter === f
                  ? 'bg-[#2d6a4f] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2d6a4f] hover:text-[#2d6a4f]'
              }`}
            >
              {f === 'ALL' ? 'All Floors' : f === 'GROUND FLOOR' ? 'Ground Floor' : 'First Floor'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Inbox className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-base font-medium text-gray-500">No labs found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groundFloorLabs.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-[#2d6a4f] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Ground Floor
                <span className="text-xs font-normal text-gray-400 normal-case tracking-normal">
                  ({groundFloorLabs.length} lab{groundFloorLabs.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-3">
                {groundFloorLabs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    user={user}
                    onRequestClick={onRequestClick}
                  />
                ))}
              </div>
            </section>
          )}

          {firstFloorLabs.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-[#c9a961] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                First Floor
                <span className="text-xs font-normal text-gray-400 normal-case tracking-normal">
                  ({firstFloorLabs.length} lab{firstFloorLabs.length !== 1 ? 's' : ''})
                </span>
              </h3>
              <div className="space-y-3">
                {firstFloorLabs.map((lab) => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    user={user}
                    onRequestClick={onRequestClick}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── My Requests Tab ──────────────────────────────────────────────────────────

interface MyRequestsTabProps {
  requests: EquipmentRequest[];
  loading: boolean;
  onMarkReturned: (requestId: string) => Promise<void>;
  processingId: string | null;
}

function MyRequestsTab({
  requests,
  loading,
  onMarkReturned,
  processingId,
}: MyRequestsTabProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FileText className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-base font-medium text-gray-500">No requests yet</p>
        <p className="text-sm mt-1">
          Browse the Equipment Catalog to submit your first request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const duration =
          req.status === 'RETURNED' && req.borrowedAt && req.returnedAt
            ? daysBetween(req.borrowedAt, req.returnedAt)
            : null;

        return (
          <div
            key={req.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Top row */}
            <div className="flex items-start justify-between px-5 py-4 gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#2d6a4f]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {req.equipment?.name ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {req.equipment?.lab?.name ?? '—'}
                  </p>
                </div>
              </div>
              <StatusBadge status={req.status} />
            </div>

            {/* Details grid */}
            <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Purpose</p>
                <p className="text-sm text-gray-700 line-clamp-2">{req.purpose}</p>
                {req.studentInfo && (
                  <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">Students: {req.studentInfo}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Requested Period</p>
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                  {formatDate(req.requestedFrom)} – {formatDate(req.requestedTo)}
                </p>
              </div>
              <div>
                {req.status === 'REJECTED' && req.adminNotes ? (
                  <>
                    <p className="text-xs text-red-400 font-medium mb-0.5">Admin Note</p>
                    <p className="text-sm text-red-600 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      {req.adminNotes}
                    </p>
                  </>
                ) : req.status === 'RETURNED' && duration !== null ? (
                  <>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Duration</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      Borrowed for {duration} day{duration !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : req.status === 'APPROVED' && req.approvedAt ? (
                  <>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">Approved On</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {formatDate(req.approvedAt)}
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            {/* Footer action for APPROVED */}
            {req.status === 'APPROVED' && (
              <div className="px-5 py-3 bg-green-50 border-t border-green-100 flex items-center justify-between">
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Equipment approved — mark as returned when done.
                </p>
                <button
                  onClick={() => onMarkReturned(req.id)}
                  disabled={processingId === req.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#2d6a4f] hover:bg-[#235a40] disabled:opacity-60 rounded-lg transition-colors"
                >
                  {processingId === req.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Mark as Returned
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ history, loading }: { history: EquipmentHistory[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-3 bg-gray-100 rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Clock className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-base font-medium text-gray-500">No request history</p>
        <p className="text-sm mt-1">Your equipment request history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Showing how many times you have requested each piece of equipment.
      </p>
      {history.map((item) => (
        <div key={item.equipmentId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
                <FlaskConical className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{item.equipmentName}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3 shrink-0" />
                  {item.labName}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold text-[#2d6a4f]">{item.totalRequests}</p>
              <p className="text-xs text-gray-400">total requests</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: 'Pending', value: item.pending, color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'Approved', value: item.approved, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Returned', value: item.returned, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { label: 'Rejected', value: item.rejected, color: 'bg-red-50 text-red-700 border-red-200' },
            ].map((s) => (
              <div key={s.label} className={`text-center py-2 rounded-lg border text-xs font-semibold ${s.color}`}>
                <p className="text-lg font-bold">{s.value}</p>
                {s.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Last requested: {new Date(item.lastRequestedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CLSPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [labs, setLabs] = useState<Lab[]>([]);
  const [labsLoading, setLabsLoading] = useState(true);

  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [history, setHistory] = useState<EquipmentHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'catalog' | 'requests' | 'history'>('catalog');

  const [modal, setModal] = useState<RequestFormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [processingId, setProcessingId] = useState<string | null>(null);

  // ── Fetch user ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // unauthenticated
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);

  // ── Fetch labs ──
  const fetchLabs = useCallback(async () => {
    setLabsLoading(true);
    try {
      const res = await fetch('/api/cls/labs');
      if (res.ok) {
        const data = await res.json();
        setLabs(data.labs ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLabsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // ── Fetch requests (FACULTY + My Requests tab) ──
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch('/api/cls/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests ?? []);
      }
    } catch {
      // ignore
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'requests' && user?.role === 'FACULTY') {
      fetchRequests();
    }
  }, [activeTab, user, fetchRequests]);

  // ── Fetch history (FACULTY + History tab) ──
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/cls/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history ?? []);
      }
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && user?.role === 'FACULTY') {
      fetchHistory();
    }
  }, [activeTab, user, fetchHistory]);

  // ── Open request modal ──
  const handleRequestClick = (equipment: Equipment, lab: Lab) => {
    setSubmitError('');
    setSubmitSuccess('');
    setModal({
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      labName: lab.name,
      purpose: '',
      studentInfo: '',
      requestedFrom: '',
      requestedTo: '',
    });
  };

  // ── Submit request ──
  const handleSubmitRequest = async (form: RequestFormState) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/cls/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: form.equipmentId,
          purpose: form.purpose,
          studentInfo: form.studentInfo || null,
          requestedFrom: form.requestedFrom,
          requestedTo: form.requestedTo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit request.');
        return;
      }

      setSubmitSuccess(`Request for "${form.equipmentName}" submitted successfully.`);
      setModal(null);

      // Refresh requests list if visible
      if (activeTab === 'requests') fetchRequests();
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mark as returned ──
  const handleMarkReturned = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/cls/requests/${requestId}/return`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  // ── Derived ──
  const totalEquipment = labs.reduce((s, l) => s + l.equipment.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page hero */}
      <div className="bg-[#2d6a4f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Central Lab System</h1>
                <p className="text-white/70 text-sm mt-0.5">MNSUAM Equipment Management</p>
              </div>
            </div>

            {/* Quick stats */}
            {!labsLoading && (
              <div className="flex gap-4 flex-wrap">
                <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-2xl font-bold">{labs.length}</p>
                  <p className="text-xs text-white/70 mt-0.5">Labs</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-2xl font-bold">{totalEquipment}</p>
                  <p className="text-xs text-white/70 mt-0.5">Equipment</p>
                </div>
                <div className="bg-[#c9a961]/20 border border-[#c9a961]/30 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-2xl font-bold text-[#c9a961]">2</p>
                  <p className="text-xs text-white/70 mt-0.5">Floors</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`relative px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'text-[#2d6a4f]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Equipment Catalog
              </span>
              {activeTab === 'catalog' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d6a4f] rounded-t" />
              )}
            </button>

            {!userLoading && user?.role === 'FACULTY' && (
              <>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`relative px-5 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === 'requests'
                      ? 'text-[#2d6a4f]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    My Requests
                  </span>
                  {activeTab === 'requests' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d6a4f] rounded-t" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`relative px-5 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'text-[#2d6a4f]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Request History
                  </span>
                  {activeTab === 'history' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d6a4f] rounded-t" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast messages */}
        {submitSuccess && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{submitSuccess}</span>
            <button onClick={() => setSubmitSuccess('')} className="shrink-0 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {submitError && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{submitError}</span>
            <button onClick={() => setSubmitError('')} className="shrink-0 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'catalog' && (
          <CatalogTab
            labs={labs}
            loading={labsLoading}
            user={userLoading ? null : user}
            onRequestClick={handleRequestClick}
          />
        )}

        {activeTab === 'requests' && user?.role === 'FACULTY' && (
          <MyRequestsTab
            requests={requests}
            loading={requestsLoading}
            onMarkReturned={handleMarkReturned}
            processingId={processingId}
          />
        )}

        {activeTab === 'history' && user?.role === 'FACULTY' && (
          <HistoryTab history={history} loading={historyLoading} />
        )}
      </main>

      {/* Request modal */}
      {modal && (
        <RequestModal
          form={modal}
          onClose={() => setModal(null)}
          onSubmit={handleSubmitRequest}
          submitting={submitting}
        />
      )}
    </div>
  );
}
