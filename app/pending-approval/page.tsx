'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Shield,
  FileCheck,
  AlertCircle,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useAuthMe, useLogout } from '@/lib/queries/auth';
import { useQueryClient } from '@tanstack/react-query';

export default function PendingApprovalPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();
  const logout      = useLogout();
  const [reapplying, setReapplying] = useState(false);

  // Shared auth cache — same request used by Header and every other page
  const { data: authData, isLoading: loading, refetch } = useAuthMe();
  const user  = authData?.user;
  const staff = authData?.staff;

  // Redirect logic
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'FACULTY') { router.push('/uni-dashboard'); return; }
    if (staff?.status === 'APPROVED') { router.push('/uni-dashboard'); return; }
  }, [user, staff, loading, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const handleReapply = async () => {
    try {
      setReapplying(true);
      const response = await fetch('/api/faculty/reapply', { method: 'POST' });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reapply');
      }
    } catch {
      alert('Failed to reapply. Please try again.');
    } finally {
      setReapplying(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const [checking, setChecking] = useState(false);
  const checkStatus = async () => {
    setChecking(true);
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    setChecking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white/60 mx-auto" />
          <p className="mt-4 text-white/60 text-sm">Loading your application status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Page hero */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] px-6 py-10 text-center">
        <p className="text-[#c9a961] text-xs font-semibold uppercase tracking-widest mb-2">
          MNSUAM Portal
        </p>
        <h1 className="text-2xl font-bold text-white">Application Status</h1>
        <p className="text-white/60 text-sm mt-1">
          Muhammad Nawaz Sharif University of Agriculture, Multan
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-xl">

          {/* PENDING STATUS */}
          {staff?.status === 'PENDING' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Status banner */}
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Application Under Review</h2>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Your profile has been successfully submitted and is pending admin approval.
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* What to expect */}
                <div className="bg-[#2d6a4f]/5 border border-[#2d6a4f]/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-[#2d6a4f]" />
                    <p className="text-sm font-semibold text-[#2d6a4f]">Verification in Progress</p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our administrative team is carefully reviewing your faculty profile to ensure
                    all credentials meet university standards. This typically takes 24–48 hours.
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Application Timeline
                  </p>

                  <div className="relative pl-5">
                    {/* Vertical line */}
                    <div className="absolute left-4.5 top-5 bottom-5 w-px bg-gray-200" />

                    <div className="space-y-0">
                      {/* Step 1 — done */}
                      <div className="flex items-start gap-4 pb-6">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center shrink-0 relative z-10">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-semibold text-gray-900 text-sm">Profile Submitted</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {staff?.createdAt
                              ? new Date(staff?.createdAt).toLocaleDateString('en-US', {
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

                      {/* Step 2 — in progress */}
                      <div className="flex items-start gap-4 pb-6">
                        <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shrink-0 relative z-10 animate-pulse">
                          <FileCheck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-semibold text-gray-900 text-sm">Under Review</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Admin team is verifying your credentials
                          </p>
                        </div>
                      </div>

                      {/* Step 3 — pending */}
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shrink-0 relative z-10">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="pt-1.5">
                          <p className="font-semibold text-gray-400 text-sm">Decision &amp; Notification</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            You&apos;ll be notified via email once reviewed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-700">What happens next?</p>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Your credentials and academic qualifications will be verified',
                      'Our admin will review your specialization and experience',
                      'Once approved, you\'ll gain full access to the faculty portal',
                      'You can view and manage your profile, publications, and courses',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]/50 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={checkStatus}
                    disabled={checking}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? 'Checking...' : 'Refresh Status'}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>

                {/* Contact */}
                <div className="border-t border-gray-100 pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Need assistance? Contact our administration office
                  </p>
                  <a
                    href="mailto:admin@mnsuam.edu.pk"
                    className="text-sm font-semibold text-[#2d6a4f] hover:text-[#235a40] mt-1 inline-block transition-colors"
                  >
                    admin@mnsuam.edu.pk
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* REJECTED STATUS */}
          {staff?.status === 'REJECTED' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Status banner */}
              <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Application Not Approved</h2>
                  <p className="text-red-600 text-xs mt-0.5">
                    Your application requires attention before it can be approved.
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Rejection reason */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-semibold text-red-700">Reason for Rejection</p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {staff?.rejectionReason ||
                      'No specific reason provided. Please contact administration for details.'}
                  </p>
                </div>

                {/* Next steps */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">What you can do</p>
                  <ol className="space-y-2">
                    {[
                      'Review the rejection reason carefully',
                      'Address the issues mentioned above',
                      'Update your credentials or documentation if needed',
                      'Click "Reapply" below to submit your application again',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className="font-bold text-[#2d6a4f] shrink-0">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleReapply}
                    disabled={reapplying}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#2d6a4f] hover:bg-[#235a40] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-sm"
                  >
                    {reapplying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Reapply Now
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>

                {/* Contact */}
                <div className="border-t border-gray-100 pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Have questions? Contact our administration office
                  </p>
                  <a
                    href="mailto:admin@mnsuam.edu.pk"
                    className="text-sm font-semibold text-[#2d6a4f] hover:text-[#235a40] mt-1 inline-block transition-colors"
                  >
                    admin@mnsuam.edu.pk
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
