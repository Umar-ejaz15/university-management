export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import AreaChart from '@/components/charts/AreaChart';
import PieChart from '@/components/charts/PieChart';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Briefcase,
  GraduationCap,
  PieChart as PieChartIcon,
  Building2,
  FlaskConical,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

export default async function UniDashboard() {
  // Fetch aggregated data
  const [
    totalFaculty,
    totalProjects,
    totalPublications,
    totalStudentsSupervised,
    departments,
    publicationsByYear,
    projectsByStatus,
  ] = await Promise.all([
    prisma.staff.count({ where: { status: 'APPROVED' } }),
    prisma.project.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.publication.count(),
    prisma.staff.aggregate({ where: { status: 'APPROVED' }, _sum: { studentsSupervised: true } }),
    prisma.department.findMany({
      include: {
        staff: {
          where: { status: 'APPROVED' },
          include: {
            publications: true,
            projects: { where: { verificationStatus: 'VERIFIED' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.publication.groupBy({ by: ['year'], _count: { id: true }, orderBy: { year: 'asc' } }),
    prisma.project.groupBy({ by: ['status'], where: { verificationStatus: 'VERIFIED' }, _count: { id: true } }),
  ]);

  const currentYear = new Date().getFullYear();
  const publicationsThisYear = await prisma.publication.count({ where: { year: currentYear } });
  const ongoingProjects = await prisma.project.count({ where: { status: 'ONGOING', verificationStatus: 'VERIFIED' } });

  // Defensive helpers for department names
  type DepartmentWithStaff = {
    name: string;
    staff: Array<{
      publications?: Array<unknown>;
      projects?: Array<unknown>;
      studentsSupervised?: number | null;
    }>;
  };

  const safeDeptName = (d: DepartmentWithStaff) => ((d?.name ?? '') as string).replace('Department of ', '') || 'Unknown';

  const staffByDept = {
    categories: departments.map(safeDeptName),
    values: departments.map((d: DepartmentWithStaff) => d.staff.length),
  };

  const projectsByDept = {
    categories: departments.map(safeDeptName),
    values: departments.map((d: DepartmentWithStaff) => d.staff.reduce((sum: number, s) => sum + (s.projects?.length || 0), 0)),
  };

  const studentsByDept = {
    categories: departments.map(safeDeptName),
    values: departments.map((d: DepartmentWithStaff) => d.staff.reduce((sum: number, s) => sum + (s.studentsSupervised ?? 0), 0)),
  };

  type PublicationByYear = { year: number; _count: { id: number } };
  type ProjectByStatus = { status: string; _count: { id: number } };

  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);
  const publicationsTimeline = {
    categories: years.map(String),
    values: years.map((year) => {
      const found = publicationsByYear.find((p: PublicationByYear) => p.year === year);
      return found ? found._count.id : 0;
    }),
  };

  const ongoingCount = projectsByStatus.find((p: ProjectByStatus) => p.status === 'ONGOING')?._count.id || 0;
  const completedCount = projectsByStatus.find((p: ProjectByStatus) => p.status === 'COMPLETED')?._count.id || 0;
  const pendingCount = projectsByStatus.find((p: ProjectByStatus) => p.status === 'PENDING')?._count.id || 0;

  const projectsStatusPieData = [
    { name: 'Ongoing', value: ongoingCount },
    { name: 'Completed', value: completedCount },
    { name: 'Pending', value: pendingCount },
  ];

  type DeptDistribution = { name: string; value: number };

  const departmentDistribution = departments
    .map((d: DepartmentWithStaff) => ({ name: safeDeptName(d), value: d.staff.length }))
    .sort((a: DeptDistribution, b: DeptDistribution) => b.value - a.value);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#1a3d2b] via-[#2d6a4f] to-[#1e4d38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-6">
            {/* University Branding */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-8 bg-[#c9a961] rounded-full" />
                <span className="text-[#c9a961] text-sm font-semibold tracking-widest uppercase">
                  University Portal
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">
                Muhammad Nawaz Sharif<br />
                <span className="text-[#c9a961]">University of Agriculture</span>, Multan
              </h1>
              <p className="text-green-200 text-base mt-1 mb-6">
                Excellence in Agriculture &amp; Sciences — Advancing Knowledge, Transforming Lives
              </p>
              <div className="max-w-md">
                <SearchBar placeholder="Search faculties, departments, or people..." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Key Metrics Strip */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#2d6a4f] rounded-full block" />
            <h2 className="text-xl font-bold text-gray-900">Key Metrics</h2>
            <span className="text-sm text-gray-400 ml-auto">
              Snapshot as of {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Faculty Members */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-[#2d6a4f]">
              <div className="flex items-center gap-4">
                <div className="bg-[#e8f5e9] p-3 rounded-xl flex-shrink-0">
                  <Users className="w-6 h-6 text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalFaculty}</p>
                  <p className="text-sm text-gray-500 mt-1">Faculty Members</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full">Active</span>
              </div>
            </div>

            {/* Research Projects */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalProjects}</p>
                  <p className="text-sm text-gray-500 mt-1">Research Projects</p>
                  <p className="text-xs text-blue-500 mt-0.5">Ongoing: {ongoingProjects}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Total</span>
              </div>
            </div>

            {/* Publications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-xl flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">{totalPublications}</p>
                  <p className="text-sm text-gray-500 mt-1">Publications</p>
                  <p className="text-xs text-purple-500 mt-0.5">This year: {publicationsThisYear}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">All Time</span>
              </div>
            </div>

            {/* Students Supervised */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-xl flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 leading-none">
                    {totalStudentsSupervised._sum?.studentsSupervised || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Students Supervised</p>
                  <p className="text-xs text-amber-500 mt-0.5">Across approved faculty</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Total</span>
              </div>
            </div>
          </div>
        </section>

        {/* Research Analytics */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#2d6a4f] rounded-full block" />
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Research Analytics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Research Projects by Department</h3>
              <p className="text-sm text-gray-400 mb-4">Distribution of active research projects across departments</p>
              <div style={{ height: 320 }}>
                <LineChart data={projectsByDept} color="#2d6a4f" showArea={true} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Research Trends (Last 6 Years)</h3>
              <p className="text-sm text-gray-400 mb-4">Annual publication output over the past six years</p>
              <div style={{ height: 320 }}>
                <AreaChart data={publicationsTimeline} color="#2d6a4f" gradient={true} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <div className="flex items-center gap-3 mb-1">
                <PieChartIcon className="w-5 h-5 text-[#2d6a4f]" />
                <h3 className="text-base font-bold text-gray-900">Project Status Overview</h3>
                <Link
                  href="/uni-dashboard/project"
                  className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View All
                </Link>
              </div>
              <p className="text-sm text-gray-400 mb-4">Ongoing, completed, and pending project breakdown</p>
              <div className="flex items-center justify-center min-h-[280px]">
                <PieChart data={projectsStatusPieData} colors={['#2d6a4f', '#1976d2', '#e65100']} donut={true} height={300} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <div className="flex items-center gap-3 mb-1">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">Publications by Department</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Total publications attributed per department</p>
              <div className="flex items-center justify-center min-h-[280px]">
                <BarChart data={{
                  categories: departments.map(safeDeptName),
                  values: departments.map((d: any) => d.staff.reduce((sum: number, s: any) => sum + (s.publications?.length || 0), 0)),
                }} color="#7b1fa2" showValues={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Faculty Analytics */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#2d6a4f] rounded-full block" />
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Faculty Analytics</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Faculty Members by Department</h3>
              <p className="text-sm text-gray-400 mb-4">Approved staff headcount per academic department</p>
              <div style={{ height: 320 }}>
                <BarChart data={staffByDept} color="#1976d2" showValues={true} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Students Supervised by Department</h3>
              <p className="text-sm text-gray-400 mb-4">Total students supervised by faculty per department</p>
              <div style={{ height: 320 }}>
                <BarChart data={studentsByDept} color="#e65100" showValues={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Faculty Distribution */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#2d6a4f] rounded-full block" />
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Faculty Distribution</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-extrabold text-gray-900">Staff Distribution by Department</h3>
              <p className="text-gray-400 mt-1">Visual breakdown of faculty headcount across all departments</p>
            </div>
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12" style={{ minHeight: 500 }}>
              <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 600, height: 600, maxWidth: '90vw' }}>
                <PieChart
                  data={departmentDistribution}
                  colors={['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc']}
                  donut={false}
                  showLegend={false}
                  height={560}
                  center={['50%', '50%']}
                  radius={'80%'}
                />
              </div>
              <div className="flex flex-col items-start justify-center flex-1 max-w-xs w-full">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Departments</h4>
                <ul className="space-y-3 w-full">
                  {departmentDistribution.map((dept, idx) => (
                    <li key={dept.name} className="flex items-center gap-3 text-sm">
                      <span
                        className="inline-block w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'][idx % 6] }}
                      />
                      <span className="truncate text-gray-700" title={dept.name}>{dept.name}</span>
                      <span className="ml-auto font-bold text-gray-500">{dept.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-[#2d6a4f] rounded-full block" />
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-[#2d6a4f] pl-3">Quick Links</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/faculties" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col gap-3">
                <div className="w-11 h-11 bg-[#e8f5e9] rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-[#2d6a4f] transition-colors">Academic Faculties</p>
                  <p className="text-sm text-gray-400 mt-0.5">Browse all faculties &amp; departments</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#2d6a4f] transition-colors mt-auto" />
              </div>
            </Link>

            <Link href="/uni-dashboard/project" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col gap-3">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Research Projects</p>
                  <p className="text-sm text-gray-400 mt-0.5">Explore ongoing &amp; completed work</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors mt-auto" />
              </div>
            </Link>

            <Link href="/faculties" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col gap-3">
                <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Publications</p>
                  <p className="text-sm text-gray-400 mt-0.5">Journal articles, conferences &amp; more</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors mt-auto" />
              </div>
            </Link>

            <Link href="/staff" className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col gap-3">
                <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Faculty Directory</p>
                  <p className="text-sm text-gray-400 mt-0.5">Staff profiles &amp; academic records</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 transition-colors mt-auto" />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
