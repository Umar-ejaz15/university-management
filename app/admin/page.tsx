'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, Clock, RefreshCw, CheckCircle, XCircle, Building2, GraduationCap, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';

interface AdminStats {
  totalFaculty: number;
  pendingCount: number;
  rejectedCount: number;
  totalDepartments: number;
}

interface PendingFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: {
    name: string;
    faculty: string;
  };
  specialization: string | null;
  experienceYears: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingFaculty, setPendingFaculty] = useState<PendingFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    facultyId: string;
    facultyName: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/pending-faculty'),
      ]);

      if (!statsRes.ok || !pendingRes.ok) {
        router.push('/login');
        return;
      }

      const statsData = await statsRes.json();
      const pendingData = await pendingRes.json();

      setStats(statsData);
      setPendingFaculty(pendingData.faculty || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleApprove = async (facultyId: string) => {
    if (!confirm('Are you sure you want to approve this faculty member?')) return;

    try {
      setProcessing(facultyId);

      const response = await fetch(`/api/admin/faculty/${facultyId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve faculty');
      }
    } catch (error) {
      console.error('Error approving faculty:', error);
      alert('Failed to approve faculty');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModal || rejectionReason.trim().length < 20) {
      alert('Rejection reason must be at least 20 characters');
      return;
    }

    try {
      setProcessing(rejectionModal.facultyId);

      const response = await fetch(`/api/admin/faculty/${rejectionModal.facultyId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setRejectionModal(null);
        setRejectionReason('');
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject faculty');
      }
    } catch (error) {
      console.error('Error rejecting faculty:', error);
      alert('Failed to reject faculty');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage faculty applications and system overview</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pendingCount || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Faculty</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.totalFaculty || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats?.rejectedCount || 0}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.totalDepartments || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/admin/faculties')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Faculties</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add, edit, or remove faculties in the system
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/departments')}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Departments</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add, edit, or remove departments across faculties
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Pending Faculty List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Faculty Applications ({pendingFaculty.length})
            </h2>
          </div>

          {pendingFaculty.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending applications</p>
              <p className="text-sm text-gray-500 mt-1">All faculty members have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingFaculty.map((faculty) => (
                <div key={faculty.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-semibold text-lg">
                            {faculty.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{faculty.name}</h3>
                          <p className="text-sm text-gray-600">{faculty.email}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Designation:</span>
                          <p className="font-medium text-gray-900">{faculty.designation}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Department:</span>
                          <p className="font-medium text-gray-900">{faculty.department.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Faculty:</span>
                          <p className="font-medium text-gray-900">{faculty.department.faculty}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>
                          <p className="font-medium text-gray-900">{faculty.experienceYears || 'N/A'}</p>
                        </div>
                      </div>

                      {faculty.specialization && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Specialization:</span>
                          <p className="text-sm text-gray-900">{faculty.specialization}</p>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Submitted: {new Date(faculty.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(faculty.id)}
                        disabled={processing === faculty.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processing === faculty.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() =>
                          setRejectionModal({
                            isOpen: true,
                            facultyId: faculty.id,
                            facultyName: faculty.name,
                          })
                        }
                        disabled={processing === faculty.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Faculty Application
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Rejecting: <span className="font-medium">{rejectionModal.facultyName}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (minimum 20 characters)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Please provide a clear reason for rejection..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectionReason.length}/500 characters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectionModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectionReason.trim().length < 20}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
