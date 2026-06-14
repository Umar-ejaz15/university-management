'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  FlaskConical,
  Search,
  Users,
  CalendarDays,
  Briefcase,
  ChevronRight,
  X,
  BookOpen,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Globe,
  Landmark,
  TrendingUp,
  Clock,
  BadgeCheck,
  RefreshCw,
} from 'lucide-react';
import { useProjects, useInvalidateProjects, type Project } from '@/lib/queries/projects';
import { useCurrentUser } from '@/lib/queries/auth';
import { useProjectsFilterStore } from '@/lib/store/projectsFilterStore';
import { statusLabel, statusBadge as statusStyle, statusDot } from '@/lib/projectStatus';

function kindStyle(k: string) {
  return k === 'INDUSTRY'
    ? 'bg-[#c9a961]/15 text-[#8a6b2e] border-[#c9a961]/30'
    : 'bg-teal-50 text-teal-700 border-teal-200';
}

function scopeStyle(s: string) {
  return s === 'INTERNATIONAL'
    ? 'bg-purple-50 text-purple-700 border-purple-200'
    : 'bg-sky-50 text-sky-700 border-sky-200';
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Submit Modal ─────────────────────────────────────────────────────────────

interface ProjectFormState {
  title: string;
  description: string;
  projectKind: 'RESEARCH' | 'INDUSTRY';
  scope: 'NATIONAL' | 'INTERNATIONAL';
  objectives: string;
  methodology: string;
  outcomes: string;
  collaborators: string;
  startDate: string;
  endDate: string;
  studentCount: string;
}

function SubmitProjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<ProjectFormState>({
    title: '',
    description: '',
    projectKind: 'RESEARCH',
    scope: 'NATIONAL',
    objectives: '',
    methodology: '',
    outcomes: '',
    collaborators: '',
    startDate: '',
    endDate: '',
    studentCount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const patch = (k: Partial<ProjectFormState>) => setForm((f) => ({ ...f, ...k }));
  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] transition bg-gray-50 focus:bg-white';

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
          projectKind: form.projectKind,
          scope: form.scope,
          objectives: form.objectives.trim() || null,
          methodology: form.methodology.trim() || null,
          outcomes: form.outcomes.trim() || null,
          collaborators: form.collaborators.trim() || null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          studentCount: form.studentCount ? parseInt(form.studentCount) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit.'); return; }
      onSuccess();
      onClose();
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d6a4f]/10 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-[#2d6a4f]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Submit Project for ORIC</h2>
              <p className="text-xs text-gray-500">Budget & installments are set by ORIC after approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input required type="text" placeholder="e.g., AI-Powered Crop Disease Detection"
              value={form.title} onChange={(e) => patch({ title: e.target.value })} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project Type</label>
              <select value={form.projectKind} onChange={(e) => patch({ projectKind: e.target.value as 'RESEARCH' | 'INDUSTRY' })} className={inputCls}>
                <option value="RESEARCH">Research</option>
                <option value="INDUSTRY">Industry</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Scope</label>
              <select value={form.scope} onChange={(e) => patch({ scope: e.target.value as 'NATIONAL' | 'INTERNATIONAL' })} className={inputCls}>
                <option value="NATIONAL">National</option>
                <option value="INTERNATIONAL">International</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea rows={3} placeholder="Brief overview of the project..."
              value={form.description} onChange={(e) => patch({ description: e.target.value })}
              className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Objectives</label>
            <textarea rows={2} placeholder="What are the key goals of this project?"
              value={form.objectives} onChange={(e) => patch({ objectives: e.target.value })}
              className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Methodology</label>
              <textarea rows={2} value={form.methodology} onChange={(e) => patch({ methodology: e.target.value })}
                placeholder="Research approach..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expected Outcomes</label>
              <textarea rows={2} value={form.outcomes} onChange={(e) => patch({ outcomes: e.target.value })}
                placeholder="Anticipated results..." className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Collaborators</label>
            <input type="text" placeholder="Names of collaborating researchers or institutions"
              value={form.collaborators} onChange={(e) => patch({ collaborators: e.target.value })} className={inputCls} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => patch({ startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => patch({ endDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Students Involved</label>
              <input type="number" min="0" placeholder="0"
                value={form.studentCount} onChange={(e) => patch({ studentCount: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            Budget and installment schedule will be set by ORIC after your project is approved.
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#2d6a4f] hover:bg-[#235a40] disabled:opacity-60 rounded-xl transition-colors">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><FileText className="w-4 h-4" />Submit to ORIC</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const budget = project.budgetAmount
    ? `${project.currency ?? 'PKR'} ${parseFloat(project.budgetAmount).toLocaleString()}`
    : project.fundingAmount ?? null;

  return (
    <Link href={`/uni-dashboard/project/${project.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#2d6a4f]/20 transition-all overflow-hidden group flex flex-col cursor-pointer">
      {/* Image / Hero */}
      <div className="relative h-40 overflow-hidden bg-linear-to-br from-[#1a3d2b] to-[#2d6a4f] shrink-0">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FlaskConical className="w-14 h-14 text-white/15" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm bg-white/90 ${statusStyle(project.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(project.status)}`} />
          {statusLabel(project.status)}
        </span>
        {/* Kind badge */}
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border bg-white/90 ${kindStyle(project.projectKind)}`}>
          {project.projectKind === 'INDUSTRY' ? <Landmark className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          {project.projectKind === 'INDUSTRY' ? 'Industry' : 'Research'}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scopeStyle(project.scope)}`}>
            {project.scope === 'INTERNATIONAL' ? <Globe className="w-2.5 h-2.5" /> : null}
            {project.scope === 'NATIONAL' ? 'National' : 'International'}
          </span>
          {project.fundingAgency && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#c9a961]/10 text-[#8a6b2e] border border-[#c9a961]/20">
              <Briefcase className="w-2.5 h-2.5" />{project.fundingAgency}
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-[#2d6a4f] transition-colors">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
          {(project.startDate || project.endDate) && (
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {fmtDate(project.startDate)}
              {project.startDate && project.endDate && ' → '}
              {fmtDate(project.endDate)}
            </span>
          )}
          {project.studentCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.studentCount} students
            </span>
          )}
          {budget && (
            <span className="flex items-center gap-1 text-[#c9a961] font-semibold">
              {budget}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-gray-100">
            {project.staff.profileImage ? (
              <img src={project.staff.profileImage} alt={project.staff.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center">
                <span className="text-[#2d6a4f] font-bold text-[10px]">{getInitials(project.staff.name)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/faculty/${project.staff.id}`); }}
              className="text-xs font-semibold text-gray-800 hover:text-[#2d6a4f] truncate block transition-colors text-left w-full"
            >
              {project.staff.name}
            </button>
            <p className="text-[10px] text-gray-400 truncate">{project.staff.department.name}</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#2d6a4f] transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'all',       label: 'All Statuses', icon: null },
  { value: 'SUBMITTED', label: 'Submitted',    icon: Clock      },
  { value: 'ONGOING',   label: 'Ongoing',      icon: TrendingUp },
  { value: 'COMPLETED', label: 'Completed',    icon: CheckCircle2 },
  { value: 'PENDING',   label: 'Pending',      icon: AlertCircle },
];

const KIND_OPTIONS = [
  { value: 'all',      label: 'All Types'  },
  { value: 'RESEARCH', label: 'Research'   },
  { value: 'INDUSTRY', label: 'Industry'   },
];

const SCOPE_OPTIONS = [
  { value: 'all',           label: 'All Scopes'    },
  { value: 'NATIONAL',      label: 'National'      },
  { value: 'INTERNATIONAL', label: 'International' },
];

const FUNDING_TYPE_OPTIONS = [
  'HEC', 'PSF', 'International', 'Industry', 'Government', 'MNSUAM Self-Funded',
];

const THEMATIC_AREA_OPTIONS = [
  'Agriculture & Food Security', 'Water & Environment', 'Health & Biotechnology',
  'Engineering & Technology', 'Social Sciences', 'Climate Change', 'Other',
];

const FINANCIAL_YEAR_OPTIONS = [
  '2024-25', '2023-24', '2022-23', '2021-22', '2020-21',
];

function FilterSidebar({
  departments,
  counts,
  totalFiltered,
}: {
  departments: { id: string; name: string }[];
  counts: Record<string, number>;
  totalFiltered: number;
}) {
  const {
    statusFilter, kindFilter, scopeFilter, deptFilter, dateFrom, dateTo,
    fundingTypeFilter, funderFilter, thematicAreaFilter, financialYearFilter,
    setStatusFilter, setKindFilter, setScopeFilter, setDeptFilter, setDateFrom, setDateTo,
    setFundingTypeFilter, setFunderFilter, setThematicAreaFilter, setFinancialYearFilter,
    clearFilters,
  } = useProjectsFilterStore();

  const hasFilters = statusFilter !== 'all' || kindFilter !== 'all' || scopeFilter !== 'all'
    || deptFilter !== 'all' || dateFrom !== '' || dateTo !== ''
    || fundingTypeFilter !== 'all' || funderFilter !== 'all'
    || thematicAreaFilter !== 'all' || financialYearFilter !== 'all';

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2';
  const inputCls = 'w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition bg-white';
  const chipCls = (active: boolean) =>
    `px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
      active ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#2d6a4f]/30 hover:text-[#2d6a4f]'
    }`;

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#2d6a4f]" />
            <span className="text-sm font-semibold text-gray-900">Filters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">{totalFiltered} results</span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[#2d6a4f] font-semibold hover:underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-4 space-y-5">
          {/* Date Range */}
          <div>
            <p className={labelCls}>Start Date Range</p>
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
              </div>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" /> Clear dates
                </button>
              )}
            </div>
          </div>

          {/* Financial Year */}
          <div>
            <p className={labelCls}>Financial Year</p>
            <select value={financialYearFilter} onChange={(e) => setFinancialYearFilter(e.target.value)} className={inputCls}>
              <option value="all">All Years</option>
              {FINANCIAL_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <p className={labelCls}>Status</p>
            <div className="space-y-1">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = statusFilter === opt.value;
                const cnt = opt.value === 'all' ? undefined : (counts[opt.value] ?? 0);
                return (
                  <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active ? 'bg-[#2d6a4f] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-gray-400'}`} />}
                      <span>{opt.label}</span>
                    </div>
                    {cnt !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{cnt}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Kind */}
          <div>
            <p className={labelCls}>Project Type</p>
            <div className="flex flex-wrap gap-1.5">
              {KIND_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setKindFilter(opt.value)} className={chipCls(kindFilter === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <p className={labelCls}>Scope</p>
            <div className="flex flex-wrap gap-1.5">
              {SCOPE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setScopeFilter(opt.value)} className={chipCls(scopeFilter === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Funding Type */}
          <div>
            <p className={labelCls}>Funding Type</p>
            <select value={fundingTypeFilter} onChange={(e) => setFundingTypeFilter(e.target.value)} className={inputCls}>
              <option value="all">All Funding Types</option>
              {FUNDING_TYPE_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Funder / Agency */}
          <div>
            <p className={labelCls}>Funder / Agency</p>
            <input
              type="text"
              value={funderFilter === 'all' ? '' : funderFilter}
              onChange={(e) => setFunderFilter(e.target.value.trim() || 'all')}
              placeholder="e.g. HEC, PSF, USDA…"
              className={inputCls}
            />
            {funderFilter !== 'all' && (
              <button onClick={() => setFunderFilter('all')} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mt-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Thematic Area */}
          <div>
            <p className={labelCls}>Thematic Area</p>
            <select value={thematicAreaFilter} onChange={(e) => setThematicAreaFilter(e.target.value)} className={inputCls}>
              <option value="all">All Areas</option>
              {THEMATIC_AREA_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Department */}
          <div>
            <p className={labelCls}>Department</p>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={inputCls}>
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicProjectsPage() {
  const { data, isLoading, refetch } = useProjects();
  const { data: user } = useCurrentUser();
  const invalidateProjects = useInvalidateProjects();

  const projects    = data?.projects   ?? [];
  const departments = data?.departments ?? [];

  const {
    search, statusFilter, kindFilter, scopeFilter, deptFilter, dateFrom, dateTo,
    fundingTypeFilter, funderFilter, thematicAreaFilter, financialYearFilter,
    setSearch, clearFilters,
  } = useProjectsFilterStore();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess,   setSubmitSuccess  ] = useState('');

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (kindFilter   !== 'all') list = list.filter((p) => p.projectKind === kindFilter);
    if (scopeFilter  !== 'all') list = list.filter((p) => p.scope === scopeFilter);
    if (deptFilter   !== 'all') list = list.filter((p) => p.staff.department.id === deptFilter);
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((p) => p.startDate && new Date(p.startDate) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      list = list.filter((p) => p.startDate && new Date(p.startDate) <= to);
    }
    if (fundingTypeFilter !== 'all') {
      const q = fundingTypeFilter.toLowerCase();
      list = list.filter((p) =>
        p.funderType?.toLowerCase().includes(q) ||
        p.fundingAgency?.toLowerCase().includes(q)
      );
    }
    if (funderFilter !== 'all' && funderFilter.trim()) {
      const q = funderFilter.toLowerCase();
      list = list.filter((p) =>
        p.fundingAgency?.toLowerCase().includes(q) ||
        p.sponsoringAgency?.toLowerCase().includes(q)
      );
    }
    if (thematicAreaFilter !== 'all') {
      list = list.filter((p) =>
        p.thematicArea?.toLowerCase().includes(thematicAreaFilter.toLowerCase())
      );
    }
    if (financialYearFilter !== 'all') {
      list = list.filter((p) => p.financialYear === financialYearFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.staff.name.toLowerCase().includes(q) ||
        p.staff.department.name.toLowerCase().includes(q) ||
        p.fundingAgency?.toLowerCase().includes(q) ||
        p.thematicArea?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, kindFilter, scopeFilter, deptFilter, dateFrom, dateTo,
      fundingTypeFilter, funderFilter, thematicAreaFilter, financialYearFilter, search]);

  const counts = useMemo(() => ({
    all:       projects.length,
    SUBMITTED: projects.filter((p) => p.status === 'SUBMITTED').length,
    ONGOING:   projects.filter((p) => p.status === 'ONGOING').length,
    COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
    PENDING:   projects.filter((p) => p.status === 'PENDING').length,
  }), [projects]);

  const hasFilters = statusFilter !== 'all' || kindFilter !== 'all' || scopeFilter !== 'all'
    || deptFilter !== 'all' || search.trim() !== '' || dateFrom !== '' || dateTo !== ''
    || fundingTypeFilter !== 'all' || funderFilter !== 'all'
    || thematicAreaFilter !== 'all' || financialYearFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="px-6 py-10">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-5">
            <Link href="/uni-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-white/80">Projects</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">University Projects</h1>
              </div>
              <p className="text-white/60 text-sm">
                All research & industry projects across the university
              </p>
              {submitSuccess && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-200 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />{submitSuccess}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-4">
              {/* Stats pills */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'Total',      value: counts.all,       color: 'bg-white/15'       },
                  { label: 'Ongoing',    value: counts.ONGOING,   color: 'bg-emerald-500/30' },
                  { label: 'Completed',  value: counts.COMPLETED, color: 'bg-white/10'        },
                  { label: 'Under Review', value: counts.SUBMITTED, color: 'bg-blue-400/30'  },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} backdrop-blur-sm rounded-xl px-3 py-2.5 text-center border border-white/10 min-w-14`}>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-white/60">{s.label}</p>
                  </div>
                ))}
              </div>
              {user?.role === 'FACULTY' && (
                <button onClick={() => { setSubmitSuccess(''); setShowSubmitModal(true); }}
                  className="flex items-center gap-2 bg-white text-[#2d6a4f] hover:bg-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0">
                  <Plus className="w-4 h-4" /> Submit Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search bar (sticky under hero) ───────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects, researchers, departments…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Main content: left filter sidebar + grid ─────────────────────── */}
      <div className="px-6 py-8 flex gap-6 items-start">

        {/* Left filter sidebar */}
        <FilterSidebar departments={departments} counts={counts} totalFiltered={filtered.length} />

        {/* Projects grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-100" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-lg w-full" />
                    <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-[#2d6a4f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#2d6a4f]/40" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No projects found</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasFilters ? 'Try adjusting or clearing your filters.' : 'No projects have been published yet.'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 px-5 py-2.5 bg-[#2d6a4f] text-white rounded-xl text-sm font-semibold hover:bg-[#235a40] transition-colors">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

      </div>

      {showSubmitModal && (
        <SubmitProjectModal
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setSubmitSuccess('Project submitted to ORIC for review. It will appear here once approved.');
            invalidateProjects();
          }}
        />
      )}
    </div>
  );
}
