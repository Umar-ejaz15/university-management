'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';

interface Faculty {
  id: string;
  name: string;
  shortName: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  establishedYear: number;
  totalStudents: number;
  description: string | null;
  facultyId: string;
  faculty: Faculty;
  _count?: {
    staff: number;
    programs: number;
  };
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/admin/faculties');
      if (response.ok) {
        const data = await response.json();
        setFaculties(data.faculties);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

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
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingDepartment(null);
        setFormData({
          name: '',
          head: '',
          establishedYear: new Date().getFullYear(),
          totalStudents: 0,
          description: '',
          facultyId: '',
        });
        await fetchDepartments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Failed to save department');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      head: department.head,
      establishedYear: department.establishedYear,
      totalStudents: department.totalStudents,
      description: department.description || '',
      facultyId: department.facultyId,
    });
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
        await fetchDepartments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
              <p className="text-sm text-gray-600 mt-1">Add, edit, or remove departments</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchDepartments}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Department
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {departments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No departments found</p>
                <p className="text-sm text-gray-500 mt-1">Get started by adding a new department</p>
              </div>
            ) : (
              departments.map((department) => (
                <div key={department.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                          <p className="text-sm text-gray-600">
                            Faculty: {department.faculty.shortName} • Head: {department.head}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Established:</span>
                          <p className="font-medium text-gray-900">{department.establishedYear}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Students:</span>
                          <p className="font-medium text-gray-900">{department.totalStudents}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Staff:</span>
                          <p className="font-medium text-gray-900">{department._count?.staff || 0}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Programs:</span>
                          <p className="font-medium text-gray-900">{department._count?.programs || 0}</p>
                        </div>
                      </div>

                      {department.description && (
                        <p className="mt-2 text-sm text-gray-600">{department.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(department)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
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
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty *
                </label>
                <select
                  required
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Head *
                </label>
                <input
                  type="text"
                  required
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Dr. Jane Smith"
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
                  Total Students
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })}
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
                  placeholder="Brief description of the department..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDepartment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
