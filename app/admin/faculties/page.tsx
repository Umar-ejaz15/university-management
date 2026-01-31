'use client';

import { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';

interface Faculty {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  description: string | null;
  _count?: {
    departments: number;
  };
}

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    dean: '',
    establishedYear: new Date().getFullYear(),
    description: '',
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/faculties');
      if (response.ok) {
        const data = await response.json();
        setFaculties(data.faculties);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

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
        await fetchFaculties();
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
        await fetchFaculties();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete faculty');
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Failed to delete faculty');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading faculties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Faculties</h1>
              <p className="text-sm text-gray-600 mt-1">Add, edit, or remove faculties</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchFaculties}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {faculties.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No faculties found</p>
                <p className="text-sm text-gray-500 mt-1">Get started by adding a new faculty</p>
              </div>
            ) : (
              faculties.map((faculty) => (
                <div key={faculty.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{faculty.name}</h3>
                          <p className="text-sm text-gray-600">
                            {faculty.shortName} • Dean: {faculty.dean}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Established:</span>
                          <p className="font-medium text-gray-900">{faculty.establishedYear}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Departments:</span>
                          <p className="font-medium text-gray-900">{faculty._count?.departments || 0}</p>
                        </div>
                      </div>

                      {faculty.description && (
                        <p className="mt-2 text-sm text-gray-600">{faculty.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(faculty)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faculty.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Faculty of Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., ENG"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dean Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dean}
                  onChange={(e) => setFormData({ ...formData, dean: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Year *
                </label>
                <input
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of the faculty..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFaculty(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
