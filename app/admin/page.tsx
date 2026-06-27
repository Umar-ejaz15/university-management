'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Clock,
  RefreshCw,
  Building2,
  GraduationCap,
  ArrowRight,
  FlaskConical,
  Briefcase,
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, count, label, sub, accent,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-3xl font-bold ${accent ?? 'text-gray-900'}`}>{count}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

function ActionCard({
  icon, title, description, href, badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-[#2d6a4f]/20 transition-all text-left w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          {icon}
        </div>
        {badge && (
          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-semibold">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#2d6a4f] transition-colors">
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-[#2d6a4f] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ArrowRight className="w-3 h-3" />
      </div>
    </button>
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  const pending = (pendingFaculty as PendingFaculty[]).length;

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            count={stats?.pendingCount ?? 0}
            label="Pending Applications"
            sub={(stats?.pendingCount ?? 0) > 0 ? 'Needs review' : 'All reviewed'}
            accent={(stats?.pendingCount ?? 0) > 0 ? 'text-amber-600' : 'text-gray-900'}
          />
          <StatCard
            icon={<UserCheck className="w-5 h-5 text-[#2d6a4f]" />}
            count={stats?.totalFaculty ?? 0}
            label="Active Faculty"
            sub="Approved members"
          />
          <StatCard
            icon={<Building2 className="w-5 h-5 text-blue-500" />}
            count={stats?.totalDepartments ?? 0}
            label="Departments"
            sub="Across all faculties"
          />
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <ActionCard
              icon={<Building2 className="w-4 h-4 text-[#2d6a4f]" />}
              title="Faculties"
              description="Add, edit, or remove faculties"
              href="/admin/faculties"
            />
            <ActionCard
              icon={<GraduationCap className="w-4 h-4 text-blue-600" />}
              title="Departments"
              description="Manage departments across faculties"
              href="/admin/departments"
            />
            <ActionCard
              icon={<FlaskConical className="w-4 h-4 text-purple-600" />}
              title="Labs"
              description="Manage labs and equipment"
              href="/admin/labs"
            />
            <ActionCard
              icon={<Briefcase className="w-4 h-4 text-amber-600" />}
              title="Applications"
              description="Review faculty membership applications"
              href="/admin/applications"
              badge={pending > 0 ? `${pending} pending` : undefined}
            />
            <ActionCard
              icon={<FlaskConical className="w-4 h-4 text-teal-600" />}
              title="CLS Requests"
              description="Lab equipment borrowing requests"
              href="/admin/cls"
              badge={(stats?.pendingClsCount ?? 0) > 0 ? `${stats?.pendingClsCount} pending` : undefined}
            />
            <ActionCard
              icon={<CalendarDays className="w-4 h-4 text-rose-600" />}
              title="Events"
              description="Create and manage university events"
              href="/admin/events"
            />
            <ActionCard
              icon={<Globe className="w-4 h-4 text-gray-500" />}
              title="University Dashboard"
              description="View the public university overview"
              href="/uni-dashboard"
            />
          </div>
        </div>

        {/* ── Pending Faculty ───────────────────────────────────────── */}
        {pending > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Pending Faculty Applications</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Name', 'Email', 'Designation', 'Department', 'Applied'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(pendingFaculty as PendingFaculty[]).slice(0, 8).map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{f.email}</td>
                        <td className="px-4 py-3 text-gray-600">{f.designation}</td>
                        <td className="px-4 py-3 text-gray-600">{f.department?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(f.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => router.push('/admin/applications')}
                            className="text-xs text-[#2d6a4f] font-medium hover:underline"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pending > 8 && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/admin/applications')}
                    className="text-xs text-[#2d6a4f] font-medium hover:underline flex items-center gap-1"
                  >
                    View all {pending} applications <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {pending === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2d6a4f]/8 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-[#2d6a4f]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No pending applications</p>
                <p className="text-xs text-gray-400 mt-0.5">All faculty applications have been reviewed.</p>
              </div>
              <button
                onClick={() => router.push('/admin/applications')}
                className="ml-auto text-xs text-[#2d6a4f] font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
