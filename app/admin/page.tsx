'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  Building2,
  GraduationCap,
  ArrowRight,
  FlaskConical,
  Briefcase,
  Calendar,
  Sparkles,
  Shield,
  Globe,
  CalendarDays,
} from 'lucide-react';
import { useAdminStats, usePendingFaculty } from '@/lib/queries/admin/stats';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PendingFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: { name: string; faculty: string };
  specialization: string | null;
  experienceYears: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Quick Action Card ────────────────────────────────────────────────────────

function QuickActionCard({
  icon, iconBg, title, description, href, badge,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#2d6a4f]/20 transition-all duration-200 text-left w-full"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#2d6a4f] transition-colors">
                {title}
              </h3>
              {badge && (
                <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded font-semibold">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#2d6a4f] group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
      </div>
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, iconColor, bg, border, count, label, sub,
}: {
  icon: React.ReactNode;
  iconColor: string;
  bg: string;
  border: string;
  count: number;
  label: string;
  sub?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bg} rounded-2xl border ${border} shadow-sm p-5`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-8 translate-x-8" />
      <div className="relative">
        <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center mb-3 shadow-sm">
          {icon}
        </div>
        <p className={`text-3xl font-bold ${iconColor}`}>{count}</p>
        <p className={`text-sm font-medium mt-0.5 ${iconColor}`}>{label}</p>
        {sub && <p className={`text-xs mt-1 ${iconColor}/60`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useAdminStats();
  const { data: pendingFaculty = [] } = usePendingFaculty();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#c9a961]" />
              <span className="text-xs font-semibold text-[#c9a961] uppercase tracking-wider">
                Administration Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MNSUAM Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm text-gray-500">
                {now.toLocaleDateString('en-GB', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
                {' · '}
                {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button
            onClick={refresh}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-medium hover:bg-[#245a42] transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">

        {/* ── Stat Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconColor="text-amber-700"
            bg="from-amber-50 to-amber-100/60"
            border="border-amber-100"
            count={stats?.pendingCount ?? 0}
            label="Pending Approvals"
            sub={(stats?.pendingCount ?? 0) > 0 ? 'Requires attention' : undefined}
          />
          <StatCard
            icon={<UserCheck className="w-5 h-5 text-[#2d6a4f]" />}
            iconColor="text-[#2d6a4f]"
            bg="from-[#2d6a4f]/5 to-[#2d6a4f]/10"
            border="border-[#2d6a4f]/15"
            count={stats?.totalFaculty ?? 0}
            label="Approved Faculty"
            sub="Active members"
          />
          <StatCard
            icon={<UserX className="w-5 h-5 text-red-600" />}
            iconColor="text-red-700"
            bg="from-red-50 to-red-100/60"
            border="border-red-100"
            count={stats?.rejectedCount ?? 0}
            label="Rejected"
            sub="Applications denied"
          />
          <StatCard
            icon={<Building2 className="w-5 h-5 text-blue-600" />}
            iconColor="text-blue-700"
            bg="from-blue-50 to-blue-100/60"
            border="border-blue-100"
            count={stats?.totalDepartments ?? 0}
            label="Total Departments"
            sub="Across all faculties"
          />
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Quick Actions</h2>
          <p className="text-xs text-gray-500 mb-4">Navigate to management sections</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Building2 className="w-5 h-5 text-[#2d6a4f]" />}
              iconBg="bg-[#2d6a4f]/10"
              title="Manage Faculties"
              description="Add, edit, or remove faculties in the system"
              href="/admin/faculties"
            />
            <QuickActionCard
              icon={<GraduationCap className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50"
              title="Manage Departments"
              description="Add, edit, or remove departments across faculties"
              href="/admin/departments"
            />
            <QuickActionCard
              icon={<FlaskConical className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-50"
              title="CLS Equipment"
              description="Review and manage lab equipment borrowing requests"
              href="/admin/cls"
            />
            <QuickActionCard
              icon={<Briefcase className="w-5 h-5 text-rose-600" />}
              iconBg="bg-rose-50"
              title="Faculty Applications"
              description={`${stats?.pendingCount ?? 0} application${(stats?.pendingCount ?? 0) !== 1 ? 's' : ''} awaiting review`}
              href="/admin/applications"
              badge={(stats?.pendingCount ?? 0) > 0 ? `${stats?.pendingCount} pending` : undefined}
            />
            <QuickActionCard
              icon={<Globe className="w-5 h-5 text-teal-600" />}
              iconBg="bg-teal-50"
              title="University Dashboard"
              description="View the public university overview and statistics"
              href="/uni-dashboard"
            />
            <QuickActionCard
              icon={<FlaskConical className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              title="Manage Labs"
              description="Add, edit, or remove labs and their equipment"
              href="/admin/labs"
            />
            <QuickActionCard
              icon={<Shield className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50"
              title="Content Verification"
              description="Review teacher-submitted publications, projects, courses & profiles"
              href="/admin/verifications"
              badge={(stats?.pendingVerifications ?? 0) > 0 ? `${stats?.pendingVerifications} pending` : undefined}
            />
            <QuickActionCard
              icon={<CalendarDays className="w-5 h-5 text-rose-600" />}
              iconBg="bg-rose-50"
              title="Events"
              description="Create and manage university-wide events, conferences, workshops, and fairs"
              href="/admin/events"
            />
          </div>
        </div>

        {/* ── Pending Applications Summary ──────────────────────────── */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Faculty Applications</h2>
          <p className="text-xs text-gray-500 mb-4">Faculty members awaiting account approval</p>
          <button
            onClick={() => router.push('/admin/applications')}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#2d6a4f]/20 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  (pendingFaculty as PendingFaculty[]).length > 0
                    ? 'bg-amber-100'
                    : 'bg-[#2d6a4f]/8'
                }`}>
                  <UserCheck className={`w-6 h-6 ${
                    (pendingFaculty as PendingFaculty[]).length > 0
                      ? 'text-amber-600'
                      : 'text-[#2d6a4f]/60'
                  }`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {(pendingFaculty as PendingFaculty[]).length === 0
                      ? 'All caught up'
                      : `${(pendingFaculty as PendingFaculty[]).length} application${(pendingFaculty as PendingFaculty[]).length !== 1 ? 's' : ''} pending`}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {(pendingFaculty as PendingFaculty[]).length === 0
                      ? 'No pending faculty applications'
                      : 'Click to review and approve'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(pendingFaculty as PendingFaculty[]).length > 0 && (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {(pendingFaculty as PendingFaculty[]).length} pending
                  </span>
                )}
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#2d6a4f] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
