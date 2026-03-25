'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Plus, Edit2, Trash2, RefreshCw, BookOpen, Users, Building2, X } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAdminDepartments, type AdminDepartment } from '@/lib/queries/admin/departments';
import { useAdminFaculties } from '@/lib/queries/admin/faculties';

type Department = AdminDepartment;

export default function AdminDepartmentsPage() {
  const queryClient = useQueryClient();
  const { data: departments = [], isLoading } = useAdminDepartments();
  const { data: faculties = [] } = useAdminFaculties();

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    head: '',
    establishedYear: new Date().getFullYear(),
    totalStudents: 0,
    description: '',
    facultyId: '',
  });
  const [programs, setPrograms] = useState<string[]>([]);
  const [newProgram, setNewProgram] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.facultyId) {
      alert('Please select a faculty');
      return;
    }

    try {
      const url = editingDepartment
        ? `/api/admin/departments/${editingDepartment.id}`
        : '/api/admin/departments';

      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, programs }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingDepartment(null);
        setPrograms([]);
        setNewProgram('');
        setFormData({
          name: '',
          head: '',
          establishedYear: new Date().getFullYear(),
          totalStudents: 0,
          description: '',
          facultyId: '',
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Failed to save department');
    }
  };

  const handleEdit = async (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      head: department.head ?? '',
      establishedYear: department.establishedYear ?? 0,
      totalStudents: department.totalStudents,
      description: department.description || '',
      facultyId: department.facultyId,
    });

    // Fetch existing programs for this department
    try {
      const response = await fetch(`/api/admin/departments/${department.id}`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.department.programs?.map((p: any) => p.name) || []);
      }
    } catch (error) {
      console.error('Error fetching department programs:', error);
      setPrograms([]);
    }

    setShowModal(true);
  };

  const handleDelete = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? This will also delete all its staff and programs.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/departments/${departmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Header */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#c9a961]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Manage Departments</h1>
              </div>
              <p className="text-white/60 text-sm pl-13 ml-0">
                Add, edit, or remove departments across MNSUAM
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingDepartment(null);
                  setFormData({
                    name: '',
                    head: '',
                    establishedYear: new Date().getFullYear(),
                    totalStudents: 0,
                    description: '',
                    facultyId: '',
                  });
                  setPrograms([]);
                  setNewProgram('');
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#c9a961] hover:bg-[#b8954f] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Department
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-[#2d6a4f]/10 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-xs text-gray-500 font-medium">Total Departments</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, d) => sum + (d.totalStudents || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 font-medium">Total Students</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, d) => sum + (d._count?.programs || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 font-medium">Total Programs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
            <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Department</div>
              <div className="col-span-2 hidden sm:block">Faculty</div>
              <div className="col-span-2 hidden md:block">Head</div>
              <div className="col-span-1 text-center hidden lg:block">Students</div>
              <div className="col-span-1 text-center hidden lg:block">Programs</div>
              <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {departments.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold">No departments found</p>
                <p className="text-sm text-gray-400 mt-1">Get started by adding a new department</p>
                <button
                  onClick={() => {
                    setEditingDepartment(null);
                    setFormData({
                      name: '',
                      head: '',
                      establishedYear: new Date().getFullYear(),
                      totalStudents: 0,
                      description: '',
                      facultyId: '',
                    });
                    setPrograms([]);
                    setNewProgram('');
                    setShowModal(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Department
                </button>
              </div>
            ) : (
              departments.map((department) => (
                <div
                  key={department.id}
                  className="px-6 py-4 hover:bg-gray-50/60 transition-colors grid grid-cols-12 gap-4 items-center"
                >
                  {/* Department Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#2d6a4f]/10 rounded-xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{department.name}</p>
                      {department.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{department.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Faculty */}
                  <div className="col-span-2 hidden sm:block">
                    <span className="inline-block px-2 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-semibold rounded-lg">
                      {department.faculty.shortName}
                    </span>
                  </div>

                  {/* Head */}
                  <div className="col-span-2 hidden md:block">
                    <p className="text-sm text-gray-700 truncate">{department.head}</p>
                  </div>

                  {/* Students */}
                  <div className="col-span-1 hidden lg:block text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {department.totalStudents.toLocaleString()}
                    </span>
                  </div>

                  {/* Programs */}
                  <div className="col-span-1 hidden lg:block text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {department._count?.programs || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/departments/${department.id}/programs`}
                      className="p-2 text-[#2d6a4f] hover:bg-[#2d6a4f]/10 rounded-xl transition-colors"
                      title="Manage Programs"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEdit(department)}
                      title="Edit Department"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      title="Delete Department"
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setEditingDepartment(null);
              setPrograms([]);
              setNewProgram('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] px-6 py-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#c9a961]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>
              </div>
            </div>

            {/* Modal Body — scrollable */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">

                {/* Faculty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors bg-white"
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name} ({faculty.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Name + Head — 2 col */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Established Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      placeholder="e.g., 1995"
                      value={formData.establishedYear}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, establishedYear: parseInt(val) || new Date().getFullYear() });
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Total Students
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g., 450"
                      value={formData.totalStudents}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, totalStudents: parseInt(val) || 0 });
                      }}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Department Head */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Department Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                    placeholder="e.g., Dr. Jane Smith"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors resize-none"
                    placeholder="Brief description of the department..."
                  />
                </div>

                {/* Programs Offered */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Programs Offered
                  </label>
                  <div className="space-y-3">
                    {programs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {programs.map((program, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-semibold rounded-xl"
                          >
                            <BookOpen className="w-3 h-3" />
                            {program}
                            <button
                              type="button"
                              onClick={() => setPrograms(programs.filter((_, i) => i !== index))}
                              className="ml-0.5 text-[#2d6a4f]/60 hover:text-[#2d6a4f] transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProgram}
                        onChange={(e) => setNewProgram(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newProgram.trim() && !programs.includes(newProgram.trim())) {
                              setPrograms([...programs, newProgram.trim()]);
                              setNewProgram('');
                            }
                          }
                        }}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                        placeholder="e.g., BS Computer Science"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newProgram.trim() && !programs.includes(newProgram.trim())) {
                            setPrograms([...programs, newProgram.trim()]);
                            setNewProgram('');
                          }
                        }}
                        className="px-3 py-2.5 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Press Enter or click + to add a program</p>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDepartment(null);
                    setPrograms([]);
                    setNewProgram('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {editingDepartment ? 'Update' : 'Add'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
