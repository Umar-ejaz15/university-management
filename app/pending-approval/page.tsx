'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, RefreshCw, Mail, Shield, FileCheck, AlertCircle } from 'lucide-react';

interface StaffStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt?: string;
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StaffStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [reapplying, setReapplying] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      setChecking(true);

      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!response.ok || !data.user) {
        router.push('/login');
        return;
      }

      if (data.user.role !== 'FACULTY') {
        router.push('/uni-dashboard');
        return;
      }

      // If faculty is approved, redirect to dashboard
      if (data.staff?.status === 'APPROVED') {
        router.push('/uni-dashboard');
        return;
      }

      setStatus({
        status: data.staff?.status || 'PENDING',
        rejectionReason: data.staff?.rejectionReason,
        createdAt: data.staff?.createdAt,
      });
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setChecking(false);
      setLoading(false);
    }
  }, [router]);

  const handleReapply = async () => {
    try {
      setReapplying(true);

      const response = await fetch('/api/faculty/reapply', {
        method: 'POST',
      });

      if (response.ok) {
        await checkStatus();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reapply');
      }
    } catch (error) {
      console.error('Error reapplying:', error);
      alert('Failed to reapply. Please try again.');
    } finally {
      setReapplying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">Loading your application status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-9xl mx-auto">
        <div className="max-w-2xl w-full mx-auto">
        {/* Pending Status */}
        {status?.status === 'PENDING' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
              <div className="flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-pulse">
                  <Clock className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white text-center mt-4">
                Application Under Review
              </h1>
              <p className="text-green-50 text-center mt-2">
                Your profile has been successfully submitted
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Status Message */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Shield className="w-6 h-6 text-yellow-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Verification in Progress</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our administrative team is carefully reviewing your faculty profile to ensure
                      all credentials and information meet our university standards. This process
                      typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">Application Timeline</h3>
                <div className="space-y-3">
                  {/* Step 1 - Completed */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="w-0.5 h-12 bg-green-200"></div>
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-medium text-gray-900">Profile Submitted</p>
                      <p className="text-sm text-gray-600">
                        {status.createdAt
                          ? new Date(status.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2 - In Progress */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse">
                        <FileCheck className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="w-0.5 h-12 bg-gray-200"></div>
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-medium text-gray-900">Under Review</p>
                      <p className="text-sm text-gray-600">Admin team is verifying your credentials</p>
                    </div>
                  </div>

                  {/* Step 3 - Pending */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="font-medium text-gray-400">Decision & Notification</p>
                      <p className="text-sm text-gray-500">You&apos;ll be notified via email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Your credentials and academic qualifications will be verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Our admin will review your specialization and experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Once approved, you&apos;ll gain full access to the faculty portal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>You can view and manage your profile, publications, and courses</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={checkStatus}
                  disabled={checking}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                  {checking ? 'Checking...' : 'Refresh Status'}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Logout
                </button>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need assistance? Contact our administration office
                </p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  admin@mnsuam.edu.pk
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Status */}
        {status?.status === 'REJECTED' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6">
              <div className="flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white text-center mt-4">
                Application Not Approved
              </h1>
              <p className="text-red-50 text-center mt-2">
                Your application requires attention
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-6">
              {/* Rejection Reason */}
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reason for Rejection</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {status.rejectionReason || 'No specific reason provided. Please contact administration for details.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">What you can do</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">1.</span>
                    <span>Review the rejection reason carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">2.</span>
                    <span>Address the issues mentioned above</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">3.</span>
                    <span>Update your credentials or documentation if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">4.</span>
                    <span>Click &quot;Reapply&quot; below to submit your application again</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReapply}
                  disabled={reapplying}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  {reapplying ? 'Processing...' : 'Reapply Now'}
                </button>

                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Logout
                </button>
              </div>

              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-600">
                  Have questions? Contact our administration office
                </p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  admin@mnsuam.edu.pk
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
