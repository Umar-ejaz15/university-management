/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import { statusLabel, statusBadge } from '@/lib/projectStatus';
import {
  ArrowLeft,
  FlaskConical,
  CalendarDays,
  Users,
  Briefcase,
  Globe,
  Landmark,
  TrendingUp,
  BookOpen,
  Building2,
  Mail,
  Phone,
  UserCircle,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}


function fmtDate(d: Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function InfoBlock({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}

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
    ? `${project.currency ?? 'PKR'} ${parseFloat(project.budgetAmount).toLocaleString()}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div className="relative bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white overflow-hidden">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
        )}
        <div className="relative px-6 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-6">
            <Link href="/uni-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/uni-dashboard/project" className="hover:text-white transition-colors">Projects</Link>
            <span>/</span>
            <span className="text-white/80 line-clamp-1">{project.title}</span>
          </nav>

          <Link
            href="/uni-dashboard/project"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>

          {/* Title + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-white/90 ${statusBadge(project.status)}`}>
              {statusLabel(project.status)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white/90 ${
              project.projectKind === 'INDUSTRY'
                ? 'bg-[#c9a961]/15 text-[#8a6b2e] border-[#c9a961]/30'
                : 'text-teal-700 border-teal-200'
            }`}>
              {project.projectKind === 'INDUSTRY'
                ? <><Landmark className="w-3 h-3" /> Industry</>
                : <><TrendingUp className="w-3 h-3" /> Research</>}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white/90 ${
              project.scope === 'INTERNATIONAL'
                ? 'text-purple-700 border-purple-200'
                : 'text-sky-700 border-sky-200'
            }`}>
              {project.scope === 'INTERNATIONAL' && <Globe className="w-3 h-3" />}
              {project.scope === 'NATIONAL' ? 'National' : 'International'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold leading-snug max-w-3xl mb-4">
            {project.title}
          </h1>

          {/* Quick meta row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {(project.startDate || project.endDate) && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {fmtDate(project.startDate)}
                {project.startDate && project.endDate && ' → '}
                {fmtDate(project.endDate)}
              </span>
            )}
            {project.studentCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {project.studentCount} students involved
              </span>
            )}
            {budget && (
              <span className="flex items-center gap-1.5 font-semibold text-[#c9a961]">
                <Briefcase className="w-4 h-4" /> {budget}
              </span>
            )}
            {project.fundingAgency && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {project.fundingAgency}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">

        {/* Principal Investigator */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Principal Investigator</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
              {project.staff.profileImage ? (
                <img src={project.staff.profileImage} alt={project.staff.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-[#2d6a4f]/40" />
                </div>
              )}
            </div>
            <div>
              <Link
                href={`/faculty/${project.staff.id}`}
                className="font-bold text-gray-900 hover:text-[#2d6a4f] transition-colors text-base"
              >
                {project.staff.name}
              </Link>
              {project.staff.designation && (
                <p className="text-sm text-gray-500 mt-0.5">{project.staff.designation}</p>
              )}
              {project.staff.department && (
                <p className="text-xs text-gray-400 mt-0.5">{project.staff.department.name}</p>
              )}
              {project.staff.email && (
                <a href={`mailto:${project.staff.email}`} className="text-xs text-[#2d6a4f] flex items-center gap-1 mt-1 hover:underline">
                  <Mail className="w-3 h-3" /> {project.staff.email}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Description + Key Details */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Project Overview</h2>

          {project.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-[#2d6a4f]" />
                <h3 className="text-sm font-semibold text-gray-800">Description</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoBlock label="Objectives" value={project.objectives} />
            <InfoBlock label="Methodology" value={project.methodology} />
            <InfoBlock label="Expected Outcomes" value={project.outcomes} />
            {project.collaborators && <InfoBlock label="Collaborators" value={project.collaborators} />}
            {project.deliverables && <InfoBlock label="Deliverables" value={project.deliverables} />}
            {project.targetBeneficiaries && <InfoBlock label="Target Beneficiaries" value={project.targetBeneficiaries} />}
          </div>
        </section>

        {/* Classification */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Classification</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.thematicArea && <InfoBlock label="Thematic Area" value={project.thematicArea} />}
            {project.projectCategory && <InfoBlock label="Category" value={project.projectCategory} />}
            {project.projectType && <InfoBlock label="Project Type" value={project.projectType} />}
            {project.funderType && <InfoBlock label="Funder Type" value={project.funderType} />}
            {project.funderLocation && <InfoBlock label="Funder Location" value={project.funderLocation} />}
            {project.financialYear && <InfoBlock label="Financial Year" value={project.financialYear} />}
          </div>
        </section>

        {/* Sponsoring / Industry Info */}
        {(project.sponsoringAgency || project.sponsorCountry || project.counterpartName) && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Sponsor / Industry Partner</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBlock label="Sponsoring Agency" value={project.sponsoringAgency} />
              <InfoBlock label="Sponsor Country" value={project.sponsorCountry} />
              <InfoBlock label="Counterpart Name" value={project.counterpartName} />
            </div>
          </section>
        )}

        {/* Co-PIs */}
        {project.coPIs.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Co-Principal Investigators ({project.coPIs.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.coPIs.map((copi) => (
                <div key={copi.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{copi.name}</p>
                  {copi.designation && <p className="text-xs text-gray-500 mt-0.5">{copi.designation}</p>}
                  {copi.organization && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {copi.organization}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-3 mt-2">
                    {copi.email && (
                      <a href={`mailto:${copi.email}`} className="text-xs text-[#2d6a4f] flex items-center gap-1 hover:underline">
                        <Mail className="w-3 h-3" /> {copi.email}
                      </a>
                    )}
                    {copi.contact && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {copi.contact}
                      </span>
                    )}
                  </div>
                  {copi.type && (
                    <span className="mt-2 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f]">
                      {copi.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Team Members */}
        {project.teamMembers.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Team Members ({project.teamMembers.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.teamMembers.map((member) => (
                <div key={member.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2d6a4f]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-[#2d6a4f]/50" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{member.name}</p>
                    {member.designation && <p className="text-xs text-gray-500">{member.designation}</p>}
                    {member.department && <p className="text-xs text-gray-400">{member.department}</p>}
                    {member.role && (
                      <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
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
    </div>
  );
}
