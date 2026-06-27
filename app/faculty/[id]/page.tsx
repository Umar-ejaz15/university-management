/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import PublicationsChart from '@/components/charts/PublicationsChart';
import { getCurrentUser } from '@/lib/session';
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

  const [staff, totalPublications, totalProjects, totalCourses, allProjectStats, allPubYears, oricData] = await Promise.all([
    prisma.staff.findUnique({
      where: { id, status: 'APPROVED' },
      include: {
        department: { include: { faculty: true } },
        publications: { where: { verificationStatus: 'VERIFIED' }, orderBy: { year: 'desc' }, take: 4 },
        projects:     { where: { verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, take: 4 },
        courses:      { where: { verificationStatus: 'VERIFIED' }, orderBy: { name: 'asc' }, take: 4 },
      },
    }),
    prisma.publication.count({ where: { staffId: id, verificationStatus: 'VERIFIED' } }),
    prisma.project.count({ where: { staffId: id, verificationStatus: 'VERIFIED' } }),
    prisma.course.count({ where: { staffId: id, verificationStatus: 'VERIFIED' } }),
    // Lightweight full project list for analytics only
    prisma.project.findMany({
      where: { staffId: id, verificationStatus: 'VERIFIED' },
      select: { status: true, title: true, studentCount: true },
    }),
    // All publication years for the trend chart
    prisma.publication.findMany({
      where: { staffId: id, verificationStatus: 'VERIFIED' },
      select: { year: true },
    }),
    // ORIC records for this faculty member
    Promise.all([
      prisma.mou.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, select: { id: true, partyName: true, linkageType: true, partyType: true, scope: true, country: true, establishmentDate: true, duration: true, status: true } }),
      prisma.consultancy.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, clientName: true, clientCountry: true, serviceType: true, contractValue: true, startDate: true, endDate: true, status: true } }),
      prisma.patent.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, leadInventor: true, ipCategory: true, patentStatus: true, filingDate: true, scope: true, applicationNumber: true } }),
      prisma.iPDisclosure.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, leadInventor: true, ipCategory: true, developmentStatus: true, scope: true } }),
      prisma.iPLicensing.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, leadInventor: true, ipCategory: true, negotiationStatus: true, licenseeName: true, scope: true } }),
      prisma.event.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { eventDate: 'desc' }, select: { id: true, title: true, category: true, eventDate: true, venue: true, scope: true, arrangedOrParticipated: true, participants: true } }),
      prisma.industrialVisit.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { visitDate: 'desc' }, select: { id: true, visitorName: true, visitorOrg: true, visitDate: true, agenda: true, departmentVisited: true, visitType: true } }),
      prisma.policyAdvocacy.findMany({ where: { staffId: id, verificationStatus: 'VERIFIED' }, orderBy: { createdAt: 'desc' }, select: { id: true, govtBody: true, areaAdvocated: true, brief: true, coalitionPartners: true, advocacyTools: true } }),
    ]).then(([mous, consultancies, patents, disclosures, licensing, events, visits, policies]) => ({
      mous, consultancies, patents, disclosures, licensing, events, visits, policies,
    })),
  ]);

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
    values: years.map((y) => allPubYears.filter((p) => p.year === y).length),
  };

  const ongoingProjects   = allProjectStats.filter((p) => p.status === 'ONGOING').length;
  const completedProjects = allProjectStats.filter((p) => p.status === 'COMPLETED').length;
  const pendingProjects   = allProjectStats.filter((p) => p.status === 'PENDING').length;

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
    const load = staff.teachingLoad;
    try {
      if (Array.isArray(load)) {
        teachingLoadItems = load.map((v) => String(v)).filter(Boolean);
      } else if (typeof load === 'string') {
        teachingLoadItems = load.split('\n').map((l: string) => l.trim()).filter(Boolean);
      } else if (typeof load === 'object') {
        teachingLoadItems = Object.entries(load).map(([k, v]) => `${k}: ${String(v)}`);
      }
    } catch {
      teachingLoadItems = [];
    }
  }

  const projectStudentData = {
    categories: allProjectStats.map((p) => p.title),
    values:     allProjectStats.map((p) => p.studentCount ?? 0),
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

  const hasCharts = totalProjects > 0 || totalPublications > 0;
  const hasTeaching = totalCourses > 0 || teachingLoadItems.length > 0;

  const totalIpRecords = oricData.patents.length + oricData.disclosures.length + oricData.licensing.length;

  // ── Nav items — only show sections that have data ──────────────────────────
  const navItems = [
    { label: 'Profile',       href: '#profile'       },
    ...(staff.bio             ? [{ label: 'About',        href: '#about'         }] : []),
    ...(totalPublications > 0 ? [{ label: 'Publications', href: '#publications' }] : []),
    ...(totalProjects > 0     ? [{ label: 'Projects',     href: '#projects'     }] : []),
    ...(hasTeaching           ? [{ label: 'Teaching',     href: '#teaching'      }] : []),
    ...(administrativeDuties.length > 0 ? [{ label: 'Admin Duties', href: '#admin-duties' }] : []),
    ...(oricData.mous.length > 0         ? [{ label: 'MoUs',          href: '#mous'          }] : []),
    ...(oricData.consultancies.length > 0 ? [{ label: 'Consultancies', href: '#consultancies' }] : []),
    ...(totalIpRecords > 0               ? [{ label: 'IP & Patents',   href: '#ip-patents'    }] : []),
    ...(oricData.events.length > 0       ? [{ label: 'Events',         href: '#events'        }] : []),
    ...(oricData.visits.length > 0       ? [{ label: 'Ind. Visits',    href: '#visits'        }] : []),
    ...(oricData.policies.length > 0     ? [{ label: 'Policy',         href: '#policy'        }] : []),
    ...(hasCharts             ? [{ label: 'Analytics',    href: '#analytics'     }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white" id="profile">
        <div className="px-6 py-10">

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
                  { label: 'Publications', value: totalPublications, icon: BookOpen,       color: 'text-blue-300' },
                  { label: 'Projects',     value: totalProjects,     icon: FlaskConical,   color: 'text-purple-300' },
                  { label: 'Courses',      value: totalCourses,      icon: GraduationCap,  color: 'text-[#c9a961]' },
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
        <div className="px-6">
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

      <main className="px-6 py-8 space-y-6">

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
            {totalPublications > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="publications">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    Publications
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-blue-50 text-blue-700">
                    {totalPublications} total
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
                        <div className="flex items-start gap-2 mb-1.5">
                          <h4 className="font-semibold text-gray-900 text-sm leading-snug">{pub.title}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${pubTypeBadge(pub.publicationType)}`}>
                            {pubTypeLabel(pub.publicationType)}
                          </span>
                          <span className="text-xs font-semibold text-gray-600">{pub.year}</span>
                          {pub.journal && (
                            <span className="text-xs text-gray-500 italic truncate max-w-50">{pub.journal}</span>
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
                {totalPublications > 4 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Showing 4 of {totalPublications}</p>
                    <Link
                      href={`/faculty/${id}/publications`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors"
                    >
                      View all {totalPublications} publications <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Projects List */}
            {totalProjects > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="projects">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                    Research Projects
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-purple-50 text-purple-700">
                    {totalProjects} total · {ongoingProjects} ongoing
                  </span>
                </div>
                <div className="space-y-4">
                  {staff.projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-5 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{project.title}</h4>
                        </div>
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
                        {project.studentCount ? (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {project.studentCount} students
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                {totalProjects > 4 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Showing 4 of {totalProjects}</p>
                    <Link
                      href={`/faculty/${id}/projects`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition-colors"
                    >
                      View all {totalProjects} projects <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
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
                    {totalCourses > 4 && (
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Showing 4 of {totalCourses} courses</p>
                        <Link
                          href={`/faculty/${id}/courses`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d6a4f]/10 text-[#2d6a4f] text-sm font-semibold hover:bg-[#2d6a4f]/20 transition-colors"
                        >
                          View all {totalCourses} courses <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
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

            {/* ── MoUs ── */}
            {oricData.mous.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="mous">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                    MoUs &amp; Linkages
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-teal-50 text-teal-700">{oricData.mous.length} total</span>
                </div>
                <div className="space-y-3">
                  {oricData.mous.map((m) => (
                    <div key={m.id} className="p-4 rounded-xl border border-gray-100 hover:border-teal-100 hover:bg-teal-50/20 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{m.partyName}</p>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {m.status && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : m.status === 'Expired' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>{m.status}</span>}
                          {m.scope && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">{m.scope}</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                        {m.linkageType && <span>{m.linkageType}</span>}
                        {m.partyType && <span>{m.partyType}</span>}
                        {m.country && <span>{m.country}</span>}
                        {m.establishmentDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(m.establishmentDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                        {m.duration && <span>Duration: {m.duration}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Consultancies ── */}
            {oricData.consultancies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="consultancies">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                    Consultancies
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-sky-50 text-sky-700">{oricData.consultancies.length} total</span>
                </div>
                <div className="space-y-3">
                  {oricData.consultancies.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-gray-100 hover:border-sky-100 hover:bg-sky-50/20 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                        {c.status && <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                        {c.clientName && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{c.clientName}{c.clientCountry ? ` · ${c.clientCountry}` : ''}</span>}
                        {c.serviceType && <span>{c.serviceType}</span>}
                        {c.contractValue && <span className="font-semibold text-gray-600">PKR {Number(c.contractValue).toLocaleString()}</span>}
                        {(c.startDate || c.endDate) && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {c.startDate && new Date(c.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                            {c.startDate && c.endDate && ' → '}
                            {c.endDate && new Date(c.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── IP & Patents ── */}
            {totalIpRecords > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="ip-patents">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    IP &amp; Patents
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-amber-50 text-amber-700">{totalIpRecords} total</span>
                </div>
                {oricData.patents.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Patents ({oricData.patents.length})</p>
                    <div className="space-y-3">
                      {oricData.patents.map((p) => (
                        <div key={p.id} className="p-4 rounded-xl border border-gray-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                            <div className="flex gap-1 shrink-0">
                              {p.patentStatus && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.patentStatus === 'Granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.patentStatus}</span>}
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">{p.scope}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                            {p.leadInventor && <span>Inventor: {p.leadInventor}</span>}
                            {p.ipCategory && <span>{p.ipCategory}</span>}
                            {p.applicationNumber && <span>App #{p.applicationNumber}</span>}
                            {p.filingDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Filed {new Date(p.filingDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {oricData.disclosures.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">IP Disclosures ({oricData.disclosures.length})</p>
                    <div className="space-y-3">
                      {oricData.disclosures.map((d) => (
                        <div key={d.id} className="p-4 rounded-xl border border-gray-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{d.title}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 shrink-0">{d.scope}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                            {d.leadInventor && <span>Inventor: {d.leadInventor}</span>}
                            {d.ipCategory && <span>{d.ipCategory}</span>}
                            {d.developmentStatus && <span>{d.developmentStatus}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {oricData.licensing.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">IP Licensing ({oricData.licensing.length})</p>
                    <div className="space-y-3">
                      {oricData.licensing.map((l) => (
                        <div key={l.id} className="p-4 rounded-xl border border-gray-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{l.title}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 shrink-0">{l.scope}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                            {l.leadInventor && <span>Inventor: {l.leadInventor}</span>}
                            {l.ipCategory && <span>{l.ipCategory}</span>}
                            {l.licenseeName && <span>Licensee: {l.licenseeName}</span>}
                            {l.negotiationStatus && <span>{l.negotiationStatus}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Events ── */}
            {oricData.events.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="events">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    Events &amp; Outreach
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-rose-50 text-rose-700">{oricData.events.length} total</span>
                </div>
                <div className="space-y-3">
                  {oricData.events.map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{ev.title}</p>
                        <div className="flex gap-1 shrink-0">
                          {ev.category && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">{ev.category}</span>}
                          {ev.arrangedOrParticipated && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{ev.arrangedOrParticipated}</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                        {ev.venue && <span>{ev.venue}</span>}
                        {ev.eventDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(ev.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                        {ev.participants && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.participants} participants</span>}
                        <span>{ev.scope}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Industrial Visits ── */}
            {oricData.visits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="visits">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    Industrial Visits
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-indigo-50 text-indigo-700">{oricData.visits.length} total</span>
                </div>
                <div className="space-y-3">
                  {oricData.visits.map((v) => (
                    <div key={v.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{v.visitorName}</p>
                        {v.visitType && <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{v.visitType}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                        {v.visitorOrg && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{v.visitorOrg}</span>}
                        {v.visitDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(v.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                        {v.departmentVisited && <span>{v.departmentVisited}</span>}
                        {v.agenda && <span className="line-clamp-1">{v.agenda}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Policy Advocacy ── */}
            {oricData.policies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" id="policy">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                    Policy Advocacy
                  </h2>
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-violet-50 text-violet-700">{oricData.policies.length} total</span>
                </div>
                <div className="space-y-3">
                  {oricData.policies.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/20 transition-all">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{p.govtBody}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                        {p.areaAdvocated && <span>{p.areaAdvocated}</span>}
                        {p.coalitionPartners && <span>Partners: {p.coalitionPartners}</span>}
                        {p.advocacyTools && <span>{p.advocacyTools}</span>}
                      </div>
                      {p.brief && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{p.brief}</p>}
                    </div>
                  ))}
                </div>
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
