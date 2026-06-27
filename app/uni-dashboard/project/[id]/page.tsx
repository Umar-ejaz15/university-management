/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import { statusLabel, statusBadge, statusDot } from '@/lib/projectStatus';
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Wallet,
  Building2,
  Mail,
  Globe,
  Landmark,
  TrendingUp,
  Target,
  FlaskConical,
  BookOpen,
  Lightbulb,
  ClipboardList,
  Heart,
  Package,
  MapPin,
  ExternalLink,
  Phone,
  ChevronRight,
  FileText,
  Clock,
  Award,
  BarChart3,
  DollarSign,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function fmtDate(d: Date | string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtYear(d: Date | string | null) {
  if (!d) return null;
  return new Date(d).getFullYear();
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

/* ── Small reusable components ─────────────────────────────────────────── */

function SectionTitle({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[#1a3d2b]/8 flex items-center justify-center text-[#1a3d2b] shrink-0">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      {count !== undefined && (
        <span className="ml-auto text-sm font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{count}</span>
      )}
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  if (!value) return null;
  const isRich = typeof value === 'string' && isHtml(value);
  return (
    <div className="flex flex-col gap-1 py-3.5 border-b border-gray-100 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </span>
      {isRich ? (
        <div className="text-sm font-medium text-gray-800 rich-content" dangerouslySetInnerHTML={{ __html: value as string }} />
      ) : (
        <span className="text-sm font-medium text-gray-800 leading-relaxed">{value}</span>
      )}
    </div>
  );
}

function isHtml(s: string) {
  return /<[a-z][\s\S]*>/i.test(s);
}

function ContentBlock({ label, value, icon }: { label: string; value: string | null | undefined; icon: React.ReactNode }) {
  if (!value) return null;
  const html = isHtml(value);
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#1a3d2b]">{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</h3>
      </div>
      {html ? (
        <div
          className="text-sm text-gray-700 rich-content"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          designation: true,
          profileImage: true,
          email: true,
          department: { select: { id: true, name: true } },
        },
      },
      coPIs: { orderBy: { createdAt: 'asc' } },
      teamMembers: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!project) notFound();

  const budget = project.budgetAmount
    ? `${project.currency ?? 'PKR'} ${project.budgetAmount.toNumber().toLocaleString()}`
    : null;

  const startYear = fmtYear(project.startDate);
  const endYear   = fmtYear(project.endDate);
  const durationYears = startYear && endYear ? endYear - startYear : null;

  const hasContent =
    project.description || project.objectives || project.methodology ||
    project.outcomes || project.deliverables || project.targetBeneficiaries ||
    project.collaborators || project.monitoringPlan;

  const hasSponsor =
    project.sponsoringAgency || project.sponsorCountry || project.sponsorAddress ||
    project.counterpartName || project.counterpartCountry || project.counterpartAddress;

  return (
    <div className="min-h-screen bg-[#f5f6f4]">
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#0c1f12] via-[#1a3d2b] to-[#2d6a4f] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        {project.imageUrl && (
          <img src={project.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.07]" />
        )}

        <div className="relative px-6 sm:px-14 py-12 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-10 flex-wrap">
            <Link href="/uni-dashboard" className="hover:text-white/70 transition-colors">Dashboard</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/uni-dashboard/project" className="hover:text-white/70 transition-colors">Projects</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/55 line-clamp-1 max-w-[300px]">{project.title}</span>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusBadge(project.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot(project.status)}`} />
              {statusLabel(project.status)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white">
              {project.projectKind === 'INDUSTRY'
                ? <><Landmark className="w-3.5 h-3.5" /> Industry Project</>
                : <><TrendingUp className="w-3.5 h-3.5" /> Research Project</>}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white">
              {project.scope === 'INTERNATIONAL'
                ? <><Globe className="w-3.5 h-3.5" /> International</>
                : <><MapPin className="w-3.5 h-3.5" /> National</>}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight max-w-4xl mb-8 tracking-tight">
            {project.title}
          </h1>

          {/* Key stats bar */}
          <div className="flex flex-wrap gap-8 pt-6 border-t border-white/10">
            {(project.startDate || project.endDate) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Project Period</p>
                <p className="text-sm font-semibold text-white/80">
                  {fmtDate(project.startDate) ?? '?'} — {project.endDate ? fmtDate(project.endDate) : 'Present'}
                  {durationYears !== null && durationYears > 0 && (
                    <span className="ml-2 text-xs font-normal text-white/40">({durationYears} yr{durationYears > 1 ? 's' : ''})</span>
                  )}
                </p>
              </div>
            )}
            {budget && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Budget</p>
                <p className="text-base font-bold text-[#e5c97e]">{budget}</p>
              </div>
            )}
            {project.fundingAgency && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Funding Agency</p>
                <p className="text-sm font-semibold text-white/80">{project.fundingAgency}</p>
              </div>
            )}
            {project.studentCount > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Students</p>
                <p className="text-sm font-semibold text-white/80">{project.studentCount} involved</p>
              </div>
            )}
            {project.financialYear && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Financial Year</p>
                <p className="text-sm font-semibold text-white/80">{project.financialYear}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div className="px-4 sm:px-14 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          {/* ── LEFT COLUMN (main content) ──────────────────────────────── */}
          <div className="space-y-7">

            {/* Principal Investigator */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                <SectionTitle icon={<FlaskConical className="w-5 h-5" />} title="Principal Investigator" />
              </div>
              <div className="px-7 py-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-gray-100 shadow-sm">
                    {project.staff.profileImage ? (
                      <img src={project.staff.profileImage} alt={project.staff.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2d6a4f] to-[#0c1f12] flex items-center justify-center text-white text-xl font-bold">
                        {initials(project.staff.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/faculty/${project.staff.id}`}
                      className="inline-flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-[#1a3d2b] transition-colors group"
                    >
                      {project.staff.name}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
                    </Link>
                    {project.staff.designation && (
                      <p className="text-base text-gray-500 mt-1">{project.staff.designation}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2.5 mt-3">
                      {project.staff.department && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a3d2b] bg-[#1a3d2b]/8 px-3 py-1.5 rounded-full border border-[#1a3d2b]/12">
                          <Building2 className="w-3.5 h-3.5" />
                          {project.staff.department.name}
                        </span>
                      )}
                    </div>
                    {project.staff.email && (
                      <a
                        href={`mailto:${project.staff.email}`}
                        className="inline-flex items-center gap-2 text-sm text-[#1a3d2b] mt-3 hover:underline font-medium"
                      >
                        <Mail className="w-4 h-4" />
                        {project.staff.email}
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/faculty/${project.staff.id}`}
                    className="shrink-0 hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1a3d2b] border border-[#1a3d2b]/25 rounded-xl hover:bg-[#1a3d2b]/5 transition-colors"
                  >
                    View Profile <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Project Overview */}
            {hasContent && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                  <SectionTitle icon={<BookOpen className="w-5 h-5" />} title="Project Overview" />
                </div>
                <div className="px-7 py-6 space-y-5">
                  {project.description && (
                    <div className="border-l-4 border-[#2d6a4f]/35 pl-5 py-1">
                      <p className="text-base text-gray-700 leading-relaxed">{project.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <ContentBlock label="Objectives" value={project.objectives} icon={<Target className="w-4 h-4" />} />
                    <ContentBlock label="Methodology" value={project.methodology} icon={<FlaskConical className="w-4 h-4" />} />
                    <ContentBlock label="Expected Outcomes" value={project.outcomes} icon={<Lightbulb className="w-4 h-4" />} />
                    <ContentBlock label="Deliverables" value={project.deliverables} icon={<Package className="w-4 h-4" />} />
                    <ContentBlock label="Target Beneficiaries" value={project.targetBeneficiaries} icon={<Heart className="w-4 h-4" />} />
                    <ContentBlock label="Collaborators" value={project.collaborators} icon={<Users className="w-4 h-4" />} />
                    <ContentBlock label="Monitoring Plan" value={project.monitoringPlan} icon={<BarChart3 className="w-4 h-4" />} />
                  </div>
                </div>
              </section>
            )}

            {/* Co-PIs */}
            {project.coPIs.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                  <SectionTitle icon={<Users className="w-5 h-5" />} title="Co-Principal Investigators" count={project.coPIs.length} />
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.coPIs.map((copi) => (
                    <div
                      key={copi.id}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#1a3d2b]/20 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d6a4f] to-[#0c1f12] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initials(copi.name)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-bold text-gray-900 text-base leading-tight">{copi.name}</p>
                        {copi.designation && <p className="text-sm text-gray-500">{copi.designation}</p>}
                        {copi.organization && (
                          <p className="text-sm text-gray-400 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{copi.organization}</span>
                          </p>
                        )}
                        {copi.email && (
                          <a href={`mailto:${copi.email}`} className="text-sm text-[#1a3d2b] flex items-center gap-1.5 hover:underline pt-0.5">
                            <Mail className="w-3.5 h-3.5" /> {copi.email}
                          </a>
                        )}
                        {copi.contact && (
                          <p className="text-sm text-gray-400 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> {copi.contact}
                          </p>
                        )}
                        {copi.type && (
                          <span className="mt-1 inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-[#1a3d2b]/8 text-[#1a3d2b] border border-[#1a3d2b]/12">
                            {copi.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Research Team */}
            {project.teamMembers.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                  <SectionTitle icon={<Users className="w-5 h-5" />} title="Research Team" count={project.teamMembers.length} />
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.teamMembers.map((member, i) => (
                    <div
                      key={member.id}
                      className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#1a3d2b]/20 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-700 text-sm font-bold shrink-0">
                        {member.name ? initials(member.name) : String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-gray-900 text-base leading-tight">{member.name}</p>
                        {member.designation && <p className="text-sm text-gray-500">{member.designation}</p>}
                        {member.department && <p className="text-sm text-gray-400">{member.department}</p>}
                        {member.role && (
                          <span className="mt-1.5 inline-block px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN (sidebar) ──────────────────────────────────── */}
          <div className="space-y-6">

            {/* Budget & Financials */}
            {(budget || project.fundingAmount || project.currency) && (
              <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <SectionTitle icon={<DollarSign className="w-5 h-5" />} title="Financials" />
                </div>
                <div className="px-6 pb-2">
                  {budget && (
                    <div className="py-4 border-b border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Budget</p>
                      <p className="text-2xl font-extrabold text-[#1a3d2b]">{budget}</p>
                    </div>
                  )}
                  <DetailRow label="Funding Amount" value={project.fundingAmount} icon={<Wallet className="w-3 h-3" />} />
                  <DetailRow label="Currency" value={project.currency} icon={<DollarSign className="w-3 h-3" />} />
                </div>
              </aside>
            )}

            {/* Project Details */}
            <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <SectionTitle icon={<ClipboardList className="w-5 h-5" />} title="Project Details" />
              </div>
              <div className="px-6 pb-2">
                <DetailRow label="Project Type" value={project.projectType} icon={<FileText className="w-3 h-3" />} />
                <DetailRow label="Category" value={project.projectCategory} icon={<ClipboardList className="w-3 h-3" />} />
                <DetailRow label="Thematic Area" value={project.thematicArea} icon={<Target className="w-3 h-3" />} />
                <DetailRow label="Scope" value={project.scope === 'INTERNATIONAL' ? 'International' : 'National'} icon={<Globe className="w-3 h-3" />} />
                <DetailRow label="Financial Year" value={project.financialYear} icon={<BarChart3 className="w-3 h-3" />} />
                <DetailRow label="File No." value={project.projectFileNo} icon={<FileText className="w-3 h-3" />} />
                <DetailRow label="Students Involved" value={project.studentCount > 0 ? String(project.studentCount) : null} icon={<Users className="w-3 h-3" />} />
              </div>
            </aside>

            {/* Timeline */}
            {(project.startDate || project.endDate || project.awardLetterDate || project.dateOfCirculation || project.submissionDeadline) && (
              <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <SectionTitle icon={<CalendarDays className="w-5 h-5" />} title="Timeline" />
                </div>
                <div className="px-6 pb-2">
                  <DetailRow label="Start Date" value={fmtDate(project.startDate)} icon={<CalendarDays className="w-3 h-3" />} />
                  <DetailRow label="End Date" value={fmtDate(project.endDate)} icon={<CalendarDays className="w-3 h-3" />} />
                  <DetailRow label="Award Letter Date" value={fmtDate(project.awardLetterDate)} icon={<Award className="w-3 h-3" />} />
                  <DetailRow label="Date of Circulation" value={fmtDate(project.dateOfCirculation)} icon={<Clock className="w-3 h-3" />} />
                  <DetailRow label="Submission Deadline" value={fmtDate(project.submissionDeadline)} icon={<Clock className="w-3 h-3" />} />
                </div>
              </aside>
            )}

            {/* Funding */}
            {(project.fundingAgency || project.funderLocation || project.funderCountry || project.fundingCallTitle) && (
              <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <SectionTitle icon={<Wallet className="w-5 h-5" />} title="Funding" />
                </div>
                <div className="px-6 pb-2">
                  <DetailRow label="Funding Agency" value={project.fundingAgency} icon={<Building2 className="w-3 h-3" />} />
                  <DetailRow label="Funder Location" value={project.funderLocation} icon={<MapPin className="w-3 h-3" />} />
                  <DetailRow label="Funder Country" value={project.funderCountry} icon={<Globe className="w-3 h-3" />} />
                  <DetailRow label="Funding Call Title" value={project.fundingCallTitle} icon={<FileText className="w-3 h-3" />} />
                </div>
              </aside>
            )}

            {/* Sponsor / Industry Partner */}
            {hasSponsor && (
              <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                  <SectionTitle icon={<Landmark className="w-5 h-5" />} title="Sponsor / Partner" />
                </div>
                <div className="px-6 pb-2">
                  <DetailRow label="Sponsoring Agency" value={project.sponsoringAgency} icon={<Building2 className="w-3 h-3" />} />
                  <DetailRow label="Sponsor Country" value={project.sponsorCountry} icon={<Globe className="w-3 h-3" />} />
                  <DetailRow label="Sponsor Address" value={project.sponsorAddress} icon={<MapPin className="w-3 h-3" />} />
                  <DetailRow label="Counterpart Name" value={project.counterpartName} icon={<Building2 className="w-3 h-3" />} />
                  <DetailRow label="Counterpart Country" value={project.counterpartCountry} icon={<Globe className="w-3 h-3" />} />
                  <DetailRow label="Counterpart Address" value={project.counterpartAddress} icon={<MapPin className="w-3 h-3" />} />
                </div>
              </aside>
            )}

          </div>{/* end right column */}
        </div>{/* end two-col grid */}

        {/* Footer */}
        <div className="flex items-center justify-between mt-10 pb-10">
          <Link
            href="/uni-dashboard/project"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <Link
            href={`/faculty/${project.staff.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#1a3d2b] bg-[#1a3d2b]/8 border border-[#1a3d2b]/20 rounded-xl hover:bg-[#1a3d2b]/14 transition-colors"
          >
            View Faculty Profile <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
