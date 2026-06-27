'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users, Plus, RefreshCw, Search, Mail, BookOpen,
  Briefcase, X, AlertTriangle, GraduationCap, FlaskConical,
} from 'lucide-react';
import { useAdminStaff, type AdminStaffMember } from '@/lib/queries/admin/staff';
import { useAdminDepartments } from '@/lib/queries/admin/departments';
import { ActionButtons } from '@/components/admin/ActionButtons';
import { toast } from '@/lib/store/uiStore';

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  member,
  onClose,
  onConfirm,
  deleting,
}: {
  member: AdminStaffMember;
  onClose: () => void;
  onConfirm: (cascade: boolean) => void;
  deleting: boolean;
}) {
  const [cascade, setCascade] = useState(false);

  const totalRelated =
    member._count.publications +
    member._count.projects +
    member._count.courses +
    member._count.consultancies +
    member._count.patents +
    member._count.mous +
    member._count.events +
    member._count.industrialVisits +
    member._count.policyAdvocacies +
    member._count.ipDisclosures +
    member._count.ipLicensings +
    member._count.equipmentRequests;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Delete Staff Member</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">{member.name}</span>?
            This action cannot be undone.
          </p>

          {totalRelated > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800">
                This member has {totalRelated} linked record{totalRelated !== 1 ? 's' : ''}:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-amber-700">
                {member._count.publications > 0   && <span>• {member._count.publications} publication{member._count.publications !== 1 ? 's' : ''}</span>}
                {member._count.projects > 0       && <span>• {member._count.projects} project{member._count.projects !== 1 ? 's' : ''}</span>}
                {member._count.courses > 0        && <span>• {member._count.courses} course{member._count.courses !== 1 ? 's' : ''}</span>}
                {member._count.consultancies > 0  && <span>• {member._count.consultancies} consultan{member._count.consultancies !== 1 ? 'cies' : 'cy'}</span>}
                {member._count.patents > 0        && <span>• {member._count.patents} patent{member._count.patents !== 1 ? 's' : ''}</span>}
                {member._count.mous > 0           && <span>• {member._count.mous} MOU{member._count.mous !== 1 ? 's' : ''}</span>}
                {member._count.events > 0         && <span>• {member._count.events} event{member._count.events !== 1 ? 's' : ''}</span>}
                {member._count.industrialVisits > 0 && <span>• {member._count.industrialVisits} industrial visit{member._count.industrialVisits !== 1 ? 's' : ''}</span>}
                {member._count.policyAdvocacies > 0 && <span>• {member._count.policyAdvocacies} policy record{member._count.policyAdvocacies !== 1 ? 's' : ''}</span>}
                {member._count.ipDisclosures > 0  && <span>• {member._count.ipDisclosures} IP disclosure{member._count.ipDisclosures !== 1 ? 's' : ''}</span>}
                {member._count.ipLicensings > 0   && <span>• {member._count.ipLicensings} IP licensing{member._count.ipLicensings !== 1 ? 's' : ''}</span>}
                {member._count.equipmentRequests > 0 && <span>• {member._count.equipmentRequests} equipment request{member._count.equipmentRequests !== 1 ? 's' : ''}</span>}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cascade}
                  onChange={e => setCascade(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-red-600 shrink-0"
                />
                <span className="text-sm text-amber-900 font-medium leading-snug">
                  Also delete all related data (publications, projects, ORIC records, equipment requests, etc.)
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(cascade)}
            disabled={deleting || (totalRelated > 0 && !cascade)}
            className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting…' : 'Delete Member'}
          </button>
        </div>
        {totalRelated > 0 && !cascade && (
          <p className="px-6 pb-4 text-xs text-red-500 -mt-2">
            Check the box above to enable deletion — this member has linked records.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

const BLANK = {
  name: '', email: '', designation: '', departmentId: '',
  specialization: '', experienceYears: '', bio: '', qualifications: '',
};

function StaffModal({
  editing,
  departments,
  onClose,
  onSaved,
}: {
  editing: AdminStaffMember | null;
  departments: { id: string; name: string; faculty: { shortName: string } }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(
    editing
      ? {
          name: editing.name,
          email: editing.email,
          designation: editing.designation,
          departmentId: editing.departmentId,
          specialization: editing.specialization ?? '',
          experienceYears: editing.experienceYears ?? '',
          bio: '',
          qualifications: '',
        }
      : BLANK
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k: keyof typeof BLANK, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    const url    = editing ? `/api/admin/staff/${editing.id}` : '/api/admin/staff';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      onSaved();
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-semibold text-gray-900">
            {editing ? 'Edit Staff Member' : 'Add Staff Member'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            {err && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{err}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address *</label>
                <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="e.g. jane.smith@mnsuam.edu.pk"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Designation *</label>
                <input required value={form.designation} onChange={e => set('designation', e.target.value)}
                  placeholder="e.g. Associate Professor"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Experience (years)</label>
                <input value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department *</label>
                <select required value={form.departmentId} onChange={e => set('departmentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] bg-white">
                  <option value="">Select a department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.faculty.shortName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialization</label>
                <input value={form.specialization} onChange={e => set('specialization', e.target.value)}
                  placeholder="e.g. Machine Learning, Remote Sensing"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Qualifications</label>
                <input value={form.qualifications} onChange={e => set('qualifications', e.target.value)}
                  placeholder="e.g. PhD (Computer Science), MSc"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              {!editing && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bio</label>
                  <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)}
                    placeholder="Brief professional bio…"
                    className="desc-word-like w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] resize-none" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-semibold hover:bg-[#245a42] transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminStaffPage() {
  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useAdminStaff();
  const { data: departments = [] } = useAdminDepartments();

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [modal, setModal] = useState<{ open: boolean; editing: AdminStaffMember | null }>({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState<AdminStaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'staff'] });

  const filtered = useMemo(() => {
    let list = staff;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.specialization ?? '').toLowerCase().includes(q)
      );
    }
    if (filterDept) list = list.filter(m => m.departmentId === filterDept);
    return list;
  }, [staff, search, filterDept]);

  const handleSaved = (msg: string) => {
    invalidate();
    setModal({ open: false, editing: null });
    toast.success(msg);
  };

  const handleDelete = async (cascade: boolean) => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(
      `/api/admin/staff/${deleteTarget.id}?cascade=${cascade}`,
      { method: 'DELETE' }
    );
    if (res.ok) {
      invalidate();
      toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? 'Delete failed');
    }
    setDeleting(false);
  };

  const totalPubs  = staff.reduce((s, m) => s + m._count.publications, 0);
  const totalProjs = staff.reduce((s, m) => s + m._count.projects, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculty Members</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage all academic staff across MNSUAM departments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={invalidate}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={() => setModal({ open: true, editing: null })}
              className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4 text-[#2d6a4f]" />,      count: staff.length,  label: 'Total Staff'    },
            { icon: <GraduationCap className="w-4 h-4 text-blue-600" />, count: departments.length, label: 'Departments' },
            { icon: <BookOpen className="w-4 h-4 text-amber-600" />,    count: totalPubs,     label: 'Publications'   },
            { icon: <FlaskConical className="w-4 h-4 text-purple-600" />, count: totalProjs,  label: 'Projects'       },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">{s.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, designation…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]"
            />
          </div>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] bg-white min-w-48"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">
              {filtered.length} member{filtered.length !== 1 ? 's' : ''}
              {(search || filterDept) ? ' (filtered)' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Name & Email', 'Department', 'Designation', 'Specialization', 'Exp.', 'Pubs', 'Projects', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                      {search || filterDept
                        ? 'No members match the current filter.'
                        : <>No staff members yet.{' '}
                            <button onClick={() => setModal({ open: true, editing: null })}
                              className="text-[#2d6a4f] font-medium hover:underline">
                              Add the first one
                            </button>
                          </>
                      }
                    </td>
                  </tr>
                )}
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />{m.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 whitespace-nowrap">{m.department.name}</p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] text-[10px] font-semibold rounded">
                        {m.department.faculty.shortName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{m.designation}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-40">
                      <span className="truncate block">{m.specialization ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {m.experienceYears ? `${m.experienceYears} yr` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">
                        <BookOpen className="w-3 h-3" />{m._count.publications}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                        <Briefcase className="w-3 h-3" />{m._count.projects}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionButtons
                        onEdit={() => setModal({ open: true, editing: m })}
                        onDelete={() => setDeleteTarget(m)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (
        <StaffModal
          editing={modal.editing}
          departments={departments.map(d => ({
            id: d.id,
            name: d.name,
            faculty: { shortName: d.faculty?.shortName ?? '' },
          }))}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={() => handleSaved(modal.editing ? 'Staff member updated.' : 'Staff member added.')}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteModal
          member={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
