'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, RefreshCw, GraduationCap, Users, X } from 'lucide-react';
import { useAdminFaculties } from '@/lib/queries/admin/faculties';
import { ActionButtons } from '@/components/admin/ActionButtons';
import { toast } from '@/lib/store/uiStore';

interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  description: string | null;
  totalPublications: number;
  totalProjects: number;
  _count?: { departments: number };
}

const BLANK = { name: '', shortName: '', dean: '', establishedYear: new Date().getFullYear(), description: '' };

export default function AdminFacultiesPage() {
  const queryClient = useQueryClient();
  const { data: faculties = [], isLoading } = useAdminFaculties();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm(BLANK); setShowModal(true); };
  const openEdit = (f: Faculty) => {
    setEditing(f);
    setForm({ name: f.name, shortName: f.shortName, dean: f.dean, establishedYear: f.establishedYear, description: f.description ?? '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url    = editing ? `/api/admin/faculties/${editing.id}` : '/api/admin/faculties';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculties'] });
      closeModal();
      toast.success(editing ? 'Faculty updated.' : 'Faculty added.');
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (f: Faculty) => {
    if (!confirm(`Delete "${f.name}"? This will also delete all its departments.`)) return;
    const res = await fetch(`/api/admin/faculties/${f.id}`, { method: 'DELETE' });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculties'] });
      toast.success('Faculty deleted.');
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? 'Delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  const totalDepts = faculties.reduce((s, f) => s + (f._count?.departments ?? 0), 0);
  const totalPubs  = faculties.reduce((s, f) => s + (f.totalPublications ?? 0), 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculties</h1>
            <p className="text-xs text-gray-400 mt-0.5">Add, edit, or remove faculties across MNSUAM</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'faculties'] })}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Faculty
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Building2 className="w-4 h-4 text-[#2d6a4f]" />, count: faculties.length, label: 'Total Faculties' },
            { icon: <GraduationCap className="w-4 h-4 text-blue-600" />, count: totalDepts, label: 'Total Departments' },
            { icon: <Users className="w-4 h-4 text-amber-600" />, count: totalPubs, label: 'Total Publications' },
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Faculty Name', 'Short Name', 'Dean', 'Depts', 'Estd.', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {faculties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                      No faculties yet.{' '}
                      <button onClick={openAdd} className="text-[#2d6a4f] font-medium hover:underline">Add the first one</button>
                    </td>
                  </tr>
                )}
                {faculties.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{f.name}</p>
                      {f.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{f.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-semibold rounded-lg">{f.shortName}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{f.dean}</td>
                    <td className="px-4 py-3 text-gray-600 text-center">{f._count?.departments ?? 0}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{f.establishedYear}</td>
                    <td className="px-4 py-3 text-right">
                      <ActionButtons onEdit={() => openEdit(f)} onDelete={() => handleDelete(f)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{editing ? 'Edit Faculty' : 'Add Faculty'}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Faculty Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Faculty of Engineering"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Short Name *</label>
                  <input required value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                    placeholder="e.g. ENG"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Established Year *</label>
                  <input required type="number" min="1800" max="2100"
                    value={form.establishedYear}
                    onChange={e => setForm(f => ({ ...f, establishedYear: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dean Name *</label>
                <input required value={form.dean} onChange={e => setForm(f => ({ ...f, dean: e.target.value }))}
                  placeholder="e.g. Prof. Dr. John Smith"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the faculty…"
                  className="desc-word-like w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-medium hover:bg-[#245a42] transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Faculty')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
