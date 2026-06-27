'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, GraduationCap, Users, BookOpen, Briefcase, Mail,
  Calendar, Building2, Pencil, Trash2, Plus, X, RefreshCw,
} from 'lucide-react';
import { toast } from '@/lib/store/uiStore';

interface Program { id: string; name: string; }

interface StaffMember {
  id: string;
  name: string;
  email: string;
  designation: string | null;
  specialization: string | null;
  experienceYears: string | null;
  _count: { publications: number; projects: number; courses: number };
}

interface Department {
  id: string;
  name: string;
  head: string | null;
  establishedYear: number | null;
  totalStudents: number;
  description: string | null;
  faculty: { id: string; name: string; shortName: string };
  programs: Program[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DepartmentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [dept, setDept]         = useState<Department | null>(null);
  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);

  // Edit modal
  const [showEdit, setShowEdit]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editForm, setEditForm]   = useState({ name: '', head: '', establishedYear: 0, totalStudents: 0, description: '' });
  const [newProgram, setNewProgram] = useState('');
  const [programs, setPrograms]   = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    const [dRes, sRes] = await Promise.all([
      fetch(`/api/admin/departments/${id}`),
      fetch(`/api/staff/all`),
    ]);
    if (!dRes.ok) { setLoading(false); return; }
    const { department } = await dRes.json();
    setDept(department);

    if (sRes.ok) {
      const { staff: allStaff } = await sRes.json();
      setStaff((allStaff as (StaffMember & { department?: { name: string } })[])
        .filter(s => s.department?.name === department.name));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const openEdit = () => {
    if (!dept) return;
    setEditForm({
      name: dept.name,
      head: dept.head ?? '',
      establishedYear: dept.establishedYear ?? new Date().getFullYear(),
      totalStudents: dept.totalStudents,
      description: dept.description ?? '',
    });
    setPrograms(dept.programs.map(p => p.name));
    setShowEdit(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, facultyId: dept?.faculty.id, programs }),
    });
    if (res.ok) {
      setShowEdit(false);
      toast.success('Department updated.');
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? 'Update failed');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!dept) return;
    if (!confirm(`Delete "${dept.name}"? This will also delete all its staff and programs.`)) return;
    const res = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/departments');
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  if (!dept) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500">Department not found.</p>
        <Link href="/admin/departments" className="mt-2 inline-flex items-center gap-1 text-sm text-[#2d6a4f] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to departments
        </Link>
      </div>
    );
  }

  const totalPubs = staff.reduce((s, m) => s + m._count.publications, 0);
  const totalProj = staff.reduce((s, m) => s + m._count.projects, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/departments"
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{dept.name}</h1>
                <span className="px-2 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-semibold rounded-lg">
                  {dept.faculty.shortName}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{dept.faculty.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load()}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button onClick={openEdit}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-4 h-4 text-[#2d6a4f]" />, count: staff.length, label: 'Staff Members' },
            { icon: <GraduationCap className="w-4 h-4 text-blue-600" />, count: dept.totalStudents, label: 'Total Students' },
            { icon: <BookOpen className="w-4 h-4 text-amber-600" />, count: totalPubs, label: 'Publications' },
            { icon: <Briefcase className="w-4 h-4 text-purple-600" />, count: totalProj, label: 'Projects' },
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

        {/* Info + Programs row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Department Info</h2>
            <div className="space-y-3 text-sm">
              {[
                { icon: <Building2 className="w-3.5 h-3.5 text-gray-400" />, label: 'Faculty', value: dept.faculty.name },
                { icon: <Users className="w-3.5 h-3.5 text-gray-400" />, label: 'Head', value: dept.head ?? '—' },
                { icon: <Calendar className="w-3.5 h-3.5 text-gray-400" />, label: 'Established', value: dept.establishedYear ? String(dept.establishedYear) : '—' },
                { icon: <GraduationCap className="w-3.5 h-3.5 text-gray-400" />, label: 'Students', value: dept.totalStudents.toLocaleString() },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-2">
                  <span className="mt-0.5">{row.icon}</span>
                  <span className="text-gray-400 w-24 shrink-0">{row.label}</span>
                  <span className="text-gray-700 font-medium">{row.value}</span>
                </div>
              ))}
              {dept.description && (
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{dept.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Programs card */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Programs Offered</h2>
              <Link href={`/admin/departments/${id}/programs`}
                className="text-xs text-[#2d6a4f] font-medium hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Manage programs
              </Link>
            </div>
            {dept.programs.length === 0 ? (
              <p className="text-sm text-gray-400">No programs added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dept.programs.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl">
                    <BookOpen className="w-3 h-3 text-gray-400" />
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Staff table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Staff Members</h2>
            <span className="ml-auto px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{staff.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Name', 'Designation', 'Specialization', 'Exp.', 'Pubs', 'Projects', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                      No approved staff members in this department.
                    </td>
                  </tr>
                )}
                {staff.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />{m.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.designation ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-45">
                      <span className="truncate block">{m.specialization ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {m.experienceYears ? `${m.experienceYears} yr` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m._count.publications}</td>
                    <td className="px-4 py-3 text-gray-600">{m._count.projects}</td>
                    <td className="px-4 py-3">
                      <Link href={`/faculty/${m.id}`}
                        className="text-xs text-[#2d6a4f] font-medium hover:underline whitespace-nowrap">
                        View profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-base font-semibold text-gray-900">Edit Department</h3>
              <button onClick={() => setShowEdit(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Department Name *</label>
                  <input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Head *</label>
                    <input required value={editForm.head} onChange={e => setEditForm(f => ({ ...f, head: e.target.value }))}
                      placeholder="Dr. Jane Smith"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Established Year</label>
                    <input type="number" min="1800" max="2100" value={editForm.establishedYear}
                      onChange={e => setEditForm(f => ({ ...f, establishedYear: parseInt(e.target.value) || f.establishedYear }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Students</label>
                  <input type="number" min="0" value={editForm.totalStudents}
                    onChange={e => setEditForm(f => ({ ...f, totalStudents: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <textarea rows={3} value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="desc-word-like w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Programs</label>
                  {programs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {programs.map((p, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                          {p}
                          <button type="button" onClick={() => setPrograms(ps => ps.filter((_, j) => j !== i))}
                            className="text-gray-400 hover:text-gray-600 ml-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input value={newProgram} onChange={e => setNewProgram(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const v = newProgram.trim();
                          if (v && !programs.includes(v)) { setPrograms(ps => [...ps, v]); setNewProgram(''); }
                        }
                      }}
                      placeholder="e.g. BS Computer Science"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f]" />
                    <button type="button"
                      onClick={() => { const v = newProgram.trim(); if (v && !programs.includes(v)) { setPrograms(ps => [...ps, v]); setNewProgram(''); } }}
                      className="px-3 py-2 bg-[#2d6a4f] text-white rounded-xl hover:bg-[#245a42] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-white text-sm font-medium hover:bg-[#245a42] transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
