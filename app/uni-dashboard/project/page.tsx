'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  FlaskConical,
  Search,
  Users,
  CalendarDays,
  Briefcase,
  ChevronRight,
  X,
  Filter,
  BookOpen,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useProjects, useInvalidateProjects, type Project } from '@/lib/queries/projects';
import { useCurrentUser } from '@/lib/queries/auth';
import { useProjectsFilterStore } from '@/lib/store/projectsFilterStore';

interface ProjectFormState {
  title: string;
  description: string;
  status: 'ONGOING' | 'COMPLETED' | 'PENDING';
  startDate: string;
  endDate: string;
  studentCount: string;
  fundingAgency: string;
  fundingAmount: string;
}

function SubmitProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<ProjectFormState>({
    title: '',
    description: '',
    status: 'ONGOING',
    startDate: '',
    endDate: '',
    studentCount: '',
    fundingAgency: '',
    fundingAmount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Project title is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teacher/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          studentCount: form.studentCount ? parseInt(form.studentCount) : 0,
          fundingAgency: form.fundingAgency.trim() || null,
          fundingAmount: form.fundingAmount.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit request.'); return; }
      onSuccess();
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-[#2d6a4f]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Submit Project Request</h2>
              <p className="text-xs text-gray-500">Your request will be reviewed by admin</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Title <span className="text-red-500">*</span></label>
            <input required type="text" placeholder="e.g., AI-Powered Crop Disease Detection" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea rows={3} placeholder="Briefly describe the project objectives and methodology..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectFormState['status'] })} className={inputCls}>
              <option value="ONGOING">Ongoing</option>
              <option value="PENDING">Pending / Proposed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Students Involved</label>
              <input type="number" min="0" placeholder="0" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Funding Agency</label>
              <input type="text" placeholder="e.g., HEC, NSF" value={form.fundingAgency} onChange={(e) => setForm({ ...form, fundingAgency: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Funding Amount</label>
            <input type="text" placeholder="e.g., PKR 1,500,000" value={form.fundingAmount} onChange={(e) => setForm({ ...form, fundingAmount: e.target.value })} className={inputCls} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#2d6a4f] hover:bg-[#235a40] disabled:opacity-60 rounded-lg transition-colors">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><FileText className="w-4 h-4" />Submit Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Projects' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
];

function statusStyle(s: string) {
  if (s === 'ONGOING') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'COMPLETED') return 'bg-gray-100 text-gray-600 border-gray-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function statusDot(s: string) {
  if (s === 'ONGOING') return 'bg-emerald-500';
  if (s === 'COMPLETED') return 'bg-gray-400';
  return 'bg-amber-500';
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#2d6a4f]/20 transition-all overflow-hidden group flex flex-col">
      <div className="relative h-44 overflow-hidden bg-linear-to-br from-[#1a3d2b] to-[#2d6a4f]">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FlaskConical className="w-16 h-16 text-white/20" />
          </div>
        )}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm bg-white/90 ${statusStyle(project.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(project.status)}`} />
          {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
        </span>
        {project.fundingAgency && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-[#c9a961]/90 text-[#1a3d2b] backdrop-blur-sm">
            <Briefcase className="w-3 h-3" /> {project.fundingAgency}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#2d6a4f] transition-colors">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
          {(project.startDate || project.endDate) && (
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {fmtDate(project.startDate)}
              {project.startDate && project.endDate && ' → '}
              {fmtDate(project.endDate)}
            </span>
          )}
          {project.studentCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {project.studentCount} students
            </span>
          )}
          {project.fundingAmount && (
            <span className="flex items-center gap-1 text-[#c9a961] font-medium">
              {project.fundingAmount}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100">
            {project.staff.profileImage ? (
              <img src={project.staff.profileImage} alt={project.staff.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center">
                <span className="text-[#2d6a4f] font-bold text-xs">{getInitials(project.staff.name)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/faculty/${project.staff.id}`}
              className="text-sm font-semibold text-gray-800 hover:text-[#2d6a4f] truncate block transition-colors"
            >
              {project.staff.name}
            </Link>
            <p className="text-xs text-gray-400 truncate">{project.staff.department.name}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2d6a4f] transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default function PublicProjectsPage() {
  const { data, isLoading } = useProjects();
  const { data: user } = useCurrentUser();
  const invalidateProjects = useInvalidateProjects();

  const projects    = data?.projects   ?? [];
  const departments = data?.departments ?? [];

  // Persistent filter state — survives navigation back to this page
  const {
    search, statusFilter, deptFilter,
    setSearch, setStatusFilter, setDeptFilter, clearFilters,
  } = useProjectsFilterStore();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess,   setSubmitSuccess  ] = useState('');

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (deptFilter !== 'all') list = list.filter((p) => p.staff.department.id === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.staff.name.toLowerCase().includes(q) ||
        p.staff.department.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, deptFilter, search]);

  const counts = useMemo(() => ({
    all:       projects.length,
    ONGOING:   projects.filter((p) => p.status === 'ONGOING').length,
    COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
    PENDING:   projects.filter((p) => p.status === 'PENDING').length,
  }), [projects]);

  const hasFilters = statusFilter !== 'all' || deptFilter !== 'all' || search.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-6">
            <Link href="/uni-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-white/80">Research Projects</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Research Projects</h1>
              </div>
              <p className="text-white/60 text-sm">
                Explore verified research initiatives across all departments
              </p>
              {submitSuccess && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-200 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {submitSuccess}
                </div>
              )}
            </div>
            {user?.role === 'FACULTY' && (
              <button
                onClick={() => { setSubmitSuccess(''); setShowSubmitModal(true); }}
                className="flex items-center gap-2 bg-white text-[#2d6a4f] hover:bg-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                Submit Project Request
              </button>
            )}
            {/* Quick stats */}
            <div className="flex gap-3">
              {[
                { label: 'Total',     value: counts.all,       color: 'bg-white/15'      },
                { label: 'Ongoing',   value: counts.ONGOING,   color: 'bg-emerald-500/30' },
                { label: 'Completed', value: counts.COMPLETED, color: 'bg-white/10'       },
              ].map((s) => (
                <div key={s.label} className={`${s.color} backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10 min-w-16`}>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, researchers…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === opt.value
                      ? 'bg-white text-[#2d6a4f] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                  {opt.value !== 'all' && (
                    <span className="ml-1 text-gray-400">
                      {counts[opt.value as keyof typeof counts] ?? 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Department filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] appearance-none cursor-pointer min-w-40"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}

            <span className="ml-auto text-xs text-gray-400 font-medium">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-lg w-full" />
                  <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-[#2d6a4f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#2d6a4f]/40" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No projects found</p>
            <p className="text-sm text-gray-400 mt-1">
              {hasFilters ? 'Try adjusting your filters.' : 'No verified research projects have been published yet.'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#235a40] transition-colors">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {showSubmitModal && (
        <SubmitProjectModal
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setSubmitSuccess('Project request submitted! It will appear here once verified by admin.');
            invalidateProjects();
          }}
        />
      )}
    </div>
  );
}
