/* eslint-disable @next/next/no-img-element */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import PublicationsChart from '@/components/charts/PublicationsChart';
import AreaChart from '@/components/charts/AreaChart';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { User, BookOpen, Briefcase, GraduationCap, Mail, Award, Edit } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Enhanced Faculty Profile Page
 * Shows comprehensive information with charts and visualizations
 */
export default async function FacultyPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  // Fetch staff member from database
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      department: {
        include: {
          faculty: true,
        },
      },
      publications: {
        orderBy: { year: 'desc' },
      },
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      courses: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!staff) {
    notFound();
  }

  // Check if the current user is viewing their own profile
  let isOwnProfile = false;
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { staffId: true },
    });
    isOwnProfile = dbUser?.staffId === id;
  }

  // Only show approved staff to others (but allow viewing own profile even if pending)
  // Profiles are visible to everyone; edit controls limited to owners (isOwnProfile)

  // Prepare data for visualizations
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  // Publications timeline
  const publicationsHistory = {
    years: years.map(String),
    values: years.map(
      (year) => staff.publications.filter((pub: typeof staff.publications[number]) => pub.year === year).length
    ),
  };

  // Projects by status
  const ongoingProjects = staff.projects.filter((p: typeof staff.projects[number]) => p.status === 'ONGOING').length;
  const completedProjects = staff.projects.filter((p: typeof staff.projects[number]) => p.status === 'COMPLETED').length;
  const pendingProjects = staff.projects.filter((p: typeof staff.projects[number]) => p.status === 'PENDING').length;

  const projectsStatusData = [
    { name: 'Ongoing', value: ongoingProjects },
    { name: 'Completed', value: completedProjects },
    { name: 'Pending', value: pendingProjects }
  ];

  // Course statistics
  const courseData = {
    categories: staff.courses.map((c: typeof staff.courses[number]) => c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name),
    values: staff.courses.map((c: typeof staff.courses[number]) => c.students)
  };

  // Parse administrative duties (convert bullet list to array)
  const administrativeDuties = staff.administrativeDuties
    ? staff.administrativeDuties
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => line.replace(/^[-*•]\s*/, '')) // Remove bullet characters
    : [];

  // Prepare project-student data if available
  type ProjectWithStudentCount = { title: string; studentCount?: number | null };

  const projectStudentData = {
    categories: staff.projects.map((p: typeof staff.projects[number]) => p.title),
    values: staff.projects.map((p: typeof staff.projects[number]) => (p as ProjectWithStudentCount).studentCount ?? 0),
  };
  const showProjectStudentsChart = projectStudentData.values.some((v: number) => v > 0);

  const dutiesCount = administrativeDuties.length;
  const studentsSupervised = staff.studentsSupervised ?? 0;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-[#e5e5e5] p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative">
                {staff.profileImage ? (
                  <img
                    src={staff.profileImage}
                    alt={staff.name}
                    className="w-36 h-36 rounded-2xl object-cover border-2 border-[#2d6a4f]"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-2xl bg-[#e8f5e9] flex items-center justify-center border-2 border-[#2d6a4f]">
                    <User className="w-16 h-16 text-[#2d6a4f]" />
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">{staff.name}</h1>
                  <p className="text-sm text-[#2d6a4f] font-semibold mb-1">{staff.designation}</p>
                  <p className="text-sm text-[#666666]">{staff.department.name} • {staff.department.faculty.name}</p>
                </div>
                {isOwnProfile && (
                  <Link
                    href="/faculty/edit"
                    className="flex items-center gap-2 bg-[#2d6a4f] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#1e4d39] transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Link>
                )}
              </div>

              {/* Contact and small info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-3 bg-[#f8f9fa] p-3 rounded-lg">
                  <Mail className="w-4 h-4 text-[#2d6a4f]" />
                  <div>
                    <p className="text-xs text-[#888888]">Email</p>
                    <a href={`mailto:${staff.email}`} className="text-sm font-medium text-[#2d6a4f] hover:underline">
                      {staff.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#f8f9fa] p-3 rounded-lg">
                  <Award className="w-4 h-4 text-[#2d6a4f]" />
                  <div>
                    <p className="text-xs text-[#888888]">Qualifications</p>
                    <p className="text-sm font-medium text-[#1a1a1a]">{staff.qualifications || '—'}</p>
                  </div>
                </div>
              </div>

              {staff.bio && (
                <div className="mt-4 p-3 bg-[#f8f9fa] rounded-lg">
                  <p className="text-sm text-[#666666] leading-relaxed">{staff.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* (Hero stats cards removed per request) */}
        </div>

        {/* At-a-glance strip */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-[#e5e5e5] p-4 mb-6 overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 min-w-max">
            {[
              { label: 'Publications', value: staff.publications.length, icon: <BookOpen className="w-4 h-4" />, href: '#publications' },
              { label: 'Projects', value: staff.projects.length, icon: <Briefcase className="w-4 h-4" />, href: '#projects' },
              { label: 'Courses', value: staff.courses.length, icon: <GraduationCap className="w-4 h-4" />, href: '#teaching' },
              { label: 'Admin Duties', value: dutiesCount, icon: <Award className="w-4 h-4" />, href: '#admin-duties' },
              { label: 'Students', value: studentsSupervised, icon: <User className="w-4 h-4" />, href: '#students' },
              { label: 'Ongoing Projects', value: ongoingProjects, icon: <Briefcase className="w-4 h-4" />, href: '#projects' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#e5e5e5] hover:border-[#2d6a4f] hover:bg-[#f4fbf7] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-[#666666]">{item.label}</p>
                  <p className="text-lg font-semibold text-[#1a1a1a]">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Administrative Duties */}
        {administrativeDuties.length > 0 && (
            <div id="admin-duties" className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-4 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
              Administrative Duties
            </h2>
            <div className="p-2">
              <ul className="list-disc pl-6 space-y-2">
                {administrativeDuties.map((duty: string, index: number) => (
                  <li key={index} className="text-base text-[#1a1a1a] leading-relaxed">
                    {duty}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Compact Research Trends (small) */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6" id="publications">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">Research Trends</h3>
            <AreaChart data={{ categories: publicationsHistory.years, values: publicationsHistory.values }} color="#2d6a4f" gradient={true} height={140} />
          </div>
        </div>

        {/* Research & Academic Visualizations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
            Research & Academic Output
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Publications Timeline */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-8" id="publications-list">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Publications (Last 6 Years)</h3>
              <PublicationsChart data={publicationsHistory} />
            </div>

            {/* Project Status Distribution */}
            {staff.projects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-8">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Project Status</h3>
                <PieChart
                  data={projectsStatusData}
                  colors={['#1976d2', '#2d6a4f', '#e65100']}
                  donut={true}
                />
              </div>
            )}
          </div>
        </div>
        {/* Students per Project Chart */}
        {showProjectStudentsChart && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-8 mb-8">
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Students per Project</h3>
            <BarChart data={projectStudentData} color="#1976d2" showValues={true} />
          </div>
        )}

        {/* Teaching Load */}
        {staff.courses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-8 mb-8" id="teaching">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
              Teaching Load (Current Semester)
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Students per Course Chart */}
              <div>
                <h3 className="text-lg font-semibold text-[#666666] mb-4">Students Enrolled by Course</h3>
                <BarChart data={courseData} color="#e65100" showValues={true} />
              </div>

              {/* Course Table */}
              <div>
                <h3 className="text-lg font-semibold text-[#666666] mb-4">Course Details</h3>
                <div className="space-y-3">
                  {staff.courses.map((course: typeof staff.courses[number]) => (
                    <div key={course.id} className="bg-[#f8f9fa] p-4 rounded-xl">
                      <h4 className="font-bold text-[#1a1a1a] mb-2">{course.name}</h4>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-[#888888]">Credits:</span>
                          <span className="ml-2 font-semibold text-[#2d6a4f]">{course.credits}</span>
                        </div>
                        <div>
                          <span className="text-[#888888]">Students:</span>
                          <span className="ml-2 font-semibold text-[#e65100]">{course.students}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Publications List */}
        {staff.publications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-8 mb-8" id="publications-list-items">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
              Recent Publications
            </h2>
            <div className="space-y-4">
              {staff.publications.slice(0, 10).map((pub: typeof staff.publications[number], index: number) => (
                <div key={pub.id} className="flex items-start gap-4 p-4 bg-[#f8f9fa] rounded-xl hover:bg-[#e8f5e9] transition-colors">
                  <div className="bg-[#2d6a4f] text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1a1a1a] text-base mb-1">{pub.title}</h4>
                    <p className="text-sm text-[#666666]">
                      {pub.year} {pub.journal && `• ${pub.journal}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects List */}
        {staff.projects.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-8" id="projects">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full"></div>
              Research Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staff.projects.map((project: typeof staff.projects[number]) => (
                <div key={project.id} className="p-6 bg-[#f8f9fa] rounded-xl border-2 border-[#e5e5e5] hover:border-[#2d6a4f] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-[#1a1a1a] text-lg">{project.title}</h4>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'COMPLETED'
                        ? 'bg-[#e8f5e9] text-[#2d6a4f]'
                        : project.status === 'ONGOING'
                        ? 'bg-[#e3f2fd] text-[#1976d2]'
                        : 'bg-[#fff3e0] text-[#e65100]'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-[#666666] mb-3 leading-relaxed">{project.description}</p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-sm text-[#888888]">
                      {project.startDate && new Date(project.startDate).toLocaleDateString()}
                      {project.startDate && project.endDate && ' → '}
                      {project.endDate && new Date(project.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
