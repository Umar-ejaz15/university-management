'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Plus, Edit2, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';

interface Program {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  head: string;
  faculty: {
    id: string;
    name: string;
    shortName: string;
  };
  programs: Program[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManageDepartmentProgramsPage({ params }: PageProps) {
  const router = useRouter();
  const [departmentId, setDepartmentId] = useState<string>('');
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programName, setProgramName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setDepartmentId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (departmentId) {
      fetchDepartment();
    }
  }, [departmentId]);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/departments/${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setDepartment(data.department);
      } else {
        router.push('/admin/departments');
      }
    } catch (error) {
      console.error('Error fetching department:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programName.trim()) {
      alert('Please enter a program name');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/departments/${departmentId}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: programName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setProgramName('');
        setShowModal(false);
        await fetchDepartment();
        alert('Program added successfully!');
      } else {
        alert(data.error || 'Failed to add program');
      }
    } catch (error) {
      console.error('Error adding program:', error);
      alert('Failed to add program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProgram || !programName.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/programs/${editingProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: programName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setProgramName('');
        setEditingProgram(null);
        setShowModal(false);
        await fetchDepartment();
        alert('Program updated successfully!');
      } else {
        alert(data.error || 'Failed to update program');
      }
    } catch (error) {
      console.error('Error updating program:', error);
      alert('Failed to update program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgram = async (programId: string, programName: string) => {
    if (!confirm(`Are you sure you want to delete the program "${programName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/programs/${programId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDepartment();
        alert('Program deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete program');
      }
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  if (loading || !department) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading department...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/admin/departments"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Programs</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {department.name} • {department.faculty.shortName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchDepartment}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingProgram(null);
                  setProgramName('');
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Program
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {department.programs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No programs found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Get started by adding a new program to this department
                </p>
              </div>
            ) : (
              department.programs.map((program, index) => (
                <div key={program.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProgram(program);
                          setProgramName(program.name);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit program"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id, program.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete program"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h3>

            <form onSubmit={editingProgram ? handleUpdateProgram : handleAddProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BS Computer Science"
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: BS Computer Science, MS Data Science, PhD Information Technology
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProgram(null);
                    setProgramName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingProgram ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
