/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import PublicationsChart from '@/components/charts/PublicationsChart';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  BookOpen,
  FlaskConical,
  GraduationCap,
  Mail,
  Award,
  Edit,
  Clock,
  Users,
  Briefcase,
  CheckCircle,
  Circle,
  ExternalLink,
  CalendarDays,
  Hash,
  BarChart3,
  ClipboardList,
  UserCircle,
  BookMarked,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FacultyPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      department: { include: { faculty: true } },
      publications: { orderBy: { year: 'desc' } },
      projects:     { orderBy: { createdAt: 'desc' } },
      courses:      { orderBy: { name: 'asc' } },
    },
  });

  if (!staff) notFound();

  let isOwnProfile = false;
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });
    isOwnProfile = dbUser?.staffId === id;
  }

  // ── Derived calculations ────────────────────────────────────────────────────
  const currentYear    = new Date().getFullYear();
  const years          = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);
  const pubHistory     = {
    years:  years.map(String),
    values: years.map((y) => staff.publications.filter((p) => p.year === y).length),
  };

  const ongoingProjects   = staff.projects.filter((p) => p.status === 'ONGOING').length;
  const completedProjects = staff.projects.filter((p) => p.status === 'COMPLETED').length;
  const pendingProjects   = staff.projects.filter((p) => p.status === 'PENDING').length;

  const projectsStatusData = [
    { name: 'Ongoing',   value: ongoingProjects   },
    { name: 'Completed', value: completedProjects },
    { name: 'Pending',   value: pendingProjects   },
  ];

  const courseData = {
    categories: staff.courses.map((c) =>
      c.name.length > 15 ? c.name.substring(0, 12) + '…' : c.name
    ),
    values: staff.courses.map((c) => c.students),
  };

  const totalCredits   = staff.courses.reduce((s, c) => s + c.credits, 0);
  const totalStudents  = staff.courses.reduce((s, c) => s + c.students, 0);

  const administrativeDuties = staff.administrativeDuties
    ? staff.administrativeDuties
        .split('\n')
        .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean)
    : [];

  // teachingLoad can be JSON array of strings, or a plain string
  let teachingLoadItems: string[] = [];
  if (staff.teachingLoad) {
    try {
      const parsed = JSON.parse(JSON.stringify(staff.teachingLoad));
      if (Array.isArray(parsed)) {
        teachingLoadItems = parsed.map(String).filter(Boolean);
      } else if (typeof parsed === 'string') {
        teachingLoadItems = parsed.split('\n').map((l: string) => l.trim()).filter(Boolean);
      } else if (typeof parsed === 'object') {
        teachingLoadItems = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`);
      }
    } catch {
      teachingLoadItems = [];
    }
  }

  const projectStudentData = {
    categories: staff.projects.map((p) => p.title),
    values:     staff.projects.map((p) => (p as { studentCount?: number | null }).studentCount ?? 0),
  };
  const showProjectStudentsChart = projectStudentData.values.some((v) => v > 0);

  const studentsSupervised = staff.studentsSupervised ?? 0;

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const pubTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      JOURNAL_ARTICLE:  'bg-blue-50 text-blue-700 border-blue-200',
      CONFERENCE_PAPER: 'bg-purple-50 text-purple-700 border-purple-200',
      BOOK:             'bg-emerald-50 text-emerald-700 border-emerald-200',
      BOOK_CHAPTER:     'bg-teal-50 text-teal-700 border-teal-200',
      THESIS:           'bg-orange-50 text-orange-700 border-orange-200',
      PATENT:           'bg-red-50 text-red-700 border-red-200',
      TECHNICAL_REPORT: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return map[type] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const pubTypeLabel = (type: string) =>
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const projectStatusBadge = (status: string) => {
    if (status === 'ONGOING')   return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const hasCharts = staff.projects.length > 0 || staff.publications.length > 0;
  const hasTeaching = staff.courses.length > 0 || teachingLoadItems.length > 0;

  // ── Nav items — only show sections that have data ──────────────────────────
  const navItems = [
    { label: 'Profile',       href: '#profile'       },
    ...(staff.bio             ? [{ label: 'About',        href: '#about'         }] : []),
    ...(staff.publications.length > 0 ? [{ label: 'Publications', href: '#publications' }] : []),
    ...(staff.projects.length > 0     ? [{ label: 'Projects',     href: '#projects'     }] : []),
    ...(hasTeaching           ? [{ label: 'Teaching',     href: '#teaching'      }] : []),
    ...(administrativeDuties.length > 0 ? [{ label: 'Admin Duties', href: '#admin-duties' }] : []),
    ...(hasCharts             ? [{ label: 'Analytics',    href: '#analytics'     }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white" id="profile">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-6">
            <Link href="/uni-dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/staff" className="hover:text-white transition-colors">Faculty Members</Link>
            <span>/</span>
            <span className="text-white/80">{staff.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Identity */}
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                {staff.profileImage ? (
                  <img
                    src={staff.profileImage}
                    alt={staff.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-white/15 border-2 border-white/20 flex items-center justify-center shadow-xl">
                    <span className="text-white font-bold text-3xl">{getInitials(staff.name)}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">{staff.name}</h1>
                <p className="text-[#c9a961] font-semibold text-lg mb-3">{staff.designation}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-white/15 border border-white/20">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {staff.department.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[#c9a961]/20 text-[#c9a961] border border-[#c9a961]/30">
                    {staff.department.faculty.shortName ?? staff.department.faculty.name}
                  </span>
                  {staff.experienceYears && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-white/10 border border-white/15">
                      <Clock className="w-3.5 h-3.5" />
                      {staff.experienceYears} yrs exp.
                    </span>
                  )}
                </div>
                {/* Email in hero */}
                <a
                  href={`mailto:${staff.email}`}
                  className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {staff.email}
                </a>
              </div>
            </div>

            {/* Stats + Edit */}
            <div className="flex flex-col items-start lg:items-end gap-4">
              {isOwnProfile && (
                <Link
                  href="/faculty/edit"
                  className="flex items-center gap-2 bg-[#c9a961] text-[#1a3d2b] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#b8963a] transition-colors shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Publications', value: staff.publications.length, icon: BookOpen,       color: 'text-blue-300' },
                  { label: 'Projects',     value: staff.projects.length,     icon: FlaskConical,   color: 'text-purple-300' },
                  { label: 'Courses',      value: staff.courses.length,      icon: GraduationCap,  color: 'text-[#c9a961]' },
                  { label: 'Students Supervised', value: studentsSupervised,  icon: Users,          color: 'text-emerald-300' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/15 min-w-22.5"
                  >
                    <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60 mt-0.5 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY NAV ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-1 scrollbar-hide">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="shrink-0 px-4 py-3 text-sm font-medium text-gray-600 hover:text-[#2d6a4f] hover:bg-[#2d6a4f]/5 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── SIDEBAR + MAIN GRID ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SIDEBAR */}
          <aside className="space-y-5">

            {/* Academic Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider">
                <div className="w-1 h-4 bg-[#c9a961] rounded-full" />
                Academic Profile
              </h2>

              {staff.qualifications && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Qualifications
                  </p>
                  <div className="space-y-1">
                    {staff.qualifications.split(/[,;](?=\s*[A-Z(])/).map((q, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-snug">{q.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {staff.specialization && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5" /> Specialization
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {staff.specialization.split(/[,;]/).map((s, i) => (
                      <span key={i} className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2d6a4f]/10 text-[#2d6a4f] border border-[#2d6a4f]/20">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {staff.experienceYears && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Experience
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {staff.experienceYears} years in academia
                  </p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5" id="contact">
              <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                <div className="w-1 h-4 bg-[#2d6a4f] rounded-full" />
                Contact
              </h2>
              <a
                href={`mailto:${staff.email}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#2d6a4f]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#2d6a4f]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">University Email</p>
                  <p className="text-sm font-medium text-[#2d6a4f] group-hover:underline truncate">{staff.email}</p>
                </div>
              </a>
              <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                <div className="flex items-center gap-3 px-1">
                  <UserCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="text-xs font-medium text-gray-700">{staff.department.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-1">
                  <BookMarked className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Faculty</p>
                    <p className="text-xs font-medium text-gray-700">{staff.department.faculty.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teaching Load Summary (sidebar) */}
            {hasTeaching && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  <div className="w-1 h-4 bg-[#c9a961] rounded-full" />
                  Teaching Summary
                </h2>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Courses',        value: staff.courses.length },
                    { label: 'Total Credits',  value: totalCredits },
                    { label: 'Students',       value: totalStudents },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-2">
                      <p className="text-lg font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* About / Bio */}
            {staff.bio && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="about">
                <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-4">
                  <div className="w-1.5 h-6 bg-[#2d6a4f] rounded-full" />
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed">{staff.bio}</p>
              </div>
            )}

            {/* Publications List */}
            {staff.publications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="publications">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    Publications
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-blue-50 text-blue-700">
                    {staff.publications.length} total
                  </span>
                </div>
                <div className="space-y-3">
                  {staff.publications.map((pub, index) => (
                    <div
                      key={pub.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5">{pub.title}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${pubTypeBadge(pub.publicationType)}`}>
                            {pubTypeLabel(pub.publicationType)}
                          </span>
                          <span className="text-xs font-semibold text-gray-600">{pub.year}</span>
                          {pub.journal && (
                            <span className="text-xs text-gray-500 italic truncate max-w-50">{pub.journal}</span>
                          )}
                          {pub.citationCount > 0 && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Hash className="w-3 h-3" />{pub.citationCount} citations
                            </span>
                          )}
                          {pub.doi && (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#2d6a4f] hover:underline flex items-center gap-0.5"
                            >
                              DOI <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {pub.authors && (
                          <p className="text-xs text-gray-400 mt-1">{pub.authors}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects List */}
            {staff.projects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="projects">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    Research Projects
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-purple-50 text-purple-700">
                    {staff.projects.length} total · {ongoingProjects} ongoing
                  </span>
                </div>
                <div className="space-y-4">
                  {staff.projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-5 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-sm leading-snug">{project.title}</h4>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${projectStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        {project.fundingAgency && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {project.fundingAgency}
                            {project.fundingAmount && ` · ${project.fundingAmount}`}
                          </span>
                        )}
                        {(project.startDate || project.endDate) && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {project.startDate && new Date(project.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                            {project.startDate && project.endDate && ' → '}
                            {project.endDate && new Date(project.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {(project as { studentCount?: number | null }).studentCount ? (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {(project as { studentCount?: number | null }).studentCount} students
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teaching Load */}
            {hasTeaching && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="teaching">
                <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
                  <div className="w-1.5 h-6 bg-[#c9a961] rounded-full" />
                  Teaching Load
                </h2>

                {/* Course table */}
                {staff.courses.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Current Semester Courses</p>
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Name</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Credits</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Students</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {staff.courses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900">{course.name}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#2d6a4f]/10 text-[#2d6a4f]">
                                  {course.credits} cr.
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-50 text-orange-700">
                                  {course.students}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-100">
                          <tr>
                            <td className="px-4 py-2 text-xs font-semibold text-gray-500">Total</td>
                            <td className="px-4 py-2 text-center text-xs font-bold text-[#2d6a4f]">{totalCredits} cr.</td>
                            <td className="px-4 py-2 text-center text-xs font-bold text-orange-600">{totalStudents}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Teaching Load JSON items */}
                {teachingLoadItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Additional Teaching Responsibilities</p>
                    <ul className="space-y-2">
                      {teachingLoadItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Circle className="w-1.5 h-1.5 mt-1.5 text-[#c9a961] shrink-0 fill-[#c9a961]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Chart */}
                {staff.courses.length > 1 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Students Enrolled by Course</p>
                    <BarChart data={courseData} color="#c9a961" showValues={true} />
                  </div>
                )}
              </div>
            )}

            {/* Administrative Duties */}
            {administrativeDuties.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="admin-duties">
                <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                  Administrative Duties
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {administrativeDuties.map((duty, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/60">
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed">{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── ANALYTICS (full width) ────────────────────────────────────────── */}
        {hasCharts && (
          <div id="analytics">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1.5 h-6 bg-[#2d6a4f] rounded-full" />
              <h2 className="text-lg font-bold text-gray-900">Research Analytics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Publication trend */}
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Publications — Last 6 Years</p>
                    <p className="text-xs text-gray-400">Annual output trend</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <PublicationsChart data={pubHistory} />
              </div>

              {/* Project status */}
              {staff.projects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-800">Project Status</p>
                    <p className="text-xs text-gray-400">Distribution by status</p>
                  </div>
                  <PieChart
                    data={projectsStatusData}
                    colors={['#2d6a4f', '#1976d2', '#e65100']}
                    donut={true}
                  />
                </div>
              )}
            </div>

            {/* Students per project */}
            {showProjectStudentsChart && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Students per Project</p>
                    <p className="text-xs text-gray-400">Active student involvement</p>
                  </div>
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                </div>
                <BarChart data={projectStudentData} color="#1976d2" showValues={true} />
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
