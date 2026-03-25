'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit2, Trash2, RefreshCw, GraduationCap, Calendar, Users } from 'lucide-react';
import Header from '@/components/Header';
import { useAdminFaculties } from '@/lib/queries/admin/faculties';

interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  description: string | null;
  totalPublications: number;
  totalProjects: number;
  _count?: {
    departments: number;
  };
}

export default function AdminFacultiesPage() {
  const queryClient = useQueryClient();
  const { data: faculties = [], isLoading } = useAdminFaculties();

  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    dean: '',
    establishedYear: new Date().getFullYear(),
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingFaculty
        ? `/api/admin/faculties/${editingFaculty.id}`
        : '/api/admin/faculties';

      const method = editingFaculty ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingFaculty(null);
        setFormData({
          name: '',
          shortName: '',
          dean: '',
          establishedYear: new Date().getFullYear(),
          description: '',
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'faculties'] });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save faculty');
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      alert('Failed to save faculty');
    }
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      shortName: faculty.shortName,
      dean: faculty.dean,
      establishedYear: faculty.establishedYear,
      description: faculty.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty? This will also delete all its departments.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/faculties/${facultyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'faculties'] });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete faculty');
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Failed to delete faculty');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading faculties...</p>
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
                  <Building2 className="w-5 h-5 text-[#c9a961]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Manage Faculties</h1>
              </div>
              <p className="text-white/60 text-sm ml-13 pl-13">
                Add, edit, or remove faculties across MNSUAM
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'faculties'] })}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingFaculty(null);
                  setFormData({
                    name: '',
                    shortName: '',
                    dean: '',
                    establishedYear: new Date().getFullYear(),
                    description: '',
                  });
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#c9a961] hover:bg-[#b8954f] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Faculty
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
              <Building2 className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{faculties.length}</p>
              <p className="text-xs text-gray-500 font-medium">Total Faculties</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {faculties.reduce((sum, f) => sum + (f._count?.departments || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 font-medium">Total Departments</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {faculties.reduce((sum, f) => sum + (f.totalPublications || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 font-medium">Total Publications</p>
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
              <div className="col-span-4">Faculty Name</div>
              <div className="col-span-1 hidden sm:block">Short Name</div>
              <div className="col-span-2 hidden md:block">Dean</div>
              <div className="col-span-1 text-center hidden lg:block">Depts</div>
              <div className="col-span-1 text-center hidden lg:block">Estd.</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {faculties.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-semibold">No faculties found</p>
                <p className="text-sm text-gray-400 mt-1">Get started by adding a new faculty</p>
                <button
                  onClick={() => {
                    setEditingFaculty(null);
                    setFormData({
                      name: '',
                      shortName: '',
                      dean: '',
                      establishedYear: new Date().getFullYear(),
                      description: '',
                    });
                    setShowModal(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Faculty
                </button>
              </div>
            ) : (
              faculties.map((faculty) => (
                <div
                  key={faculty.id}
                  className="px-6 py-4 hover:bg-gray-50/60 transition-colors grid grid-cols-12 gap-4 items-center"
                >
                  {/* Faculty Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#2d6a4f]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{faculty.name}</p>
                      {faculty.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{faculty.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Short Name */}
                  <div className="col-span-1 hidden sm:block">
                    <span className="inline-block px-2 py-0.5 bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-semibold rounded-lg">
                      {faculty.shortName}
                    </span>
                  </div>

                  {/* Dean */}
                  <div className="col-span-2 hidden md:block">
                    <p className="text-sm text-gray-700 truncate">{faculty.dean}</p>
                  </div>

                  {/* Departments */}
                  <div className="col-span-1 hidden lg:block text-center">
                    <span className="text-sm font-semibold text-gray-900">{faculty._count?.departments || 0}</span>
                  </div>

                  {/* Established */}
                  <div className="col-span-1 hidden lg:block text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {faculty.establishedYear}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(faculty)}
                      title="Edit Faculty"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faculty.id)}
                      title="Delete Faculty"
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
              setEditingFaculty(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#c9a961]" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Faculty Name + Short Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                    placeholder="e.g., Faculty of Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Short Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                    placeholder="e.g., ENG"
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
                    placeholder="e.g., 1990"
                    value={formData.establishedYear}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, establishedYear: parseInt(val) || new Date().getFullYear() });
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Dean */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Dean Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.dean}
                  onChange={(e) => setFormData({ ...formData, dean: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] outline-none transition-colors"
                  placeholder="e.g., Dr. John Smith"
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
                  placeholder="Brief description of the faculty..."
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFaculty(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  {editingFaculty ? 'Update' : 'Add'} Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
