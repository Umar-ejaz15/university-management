import Header from '@/components/Header';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import AreaChart from '@/components/charts/AreaChart';
import PieChart from '@/components/charts/PieChart';
import { prisma } from '@/lib/db';
import { Users, BookOpen, Briefcase, GraduationCap, PieChart as PieChartIcon } from 'lucide-react';

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
    prisma.project.count(),
    prisma.publication.count(),
    prisma.staff.aggregate({ where: { status: 'APPROVED' }, _sum: { studentsSupervised: true } }),
    prisma.department.findMany({
      include: {
        staff: {
          where: { status: 'APPROVED' },
          include: { publications: true, projects: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.publication.groupBy({ by: ['year'], _count: { id: true }, orderBy: { year: 'asc' } }),
    prisma.project.groupBy({ by: ['status'], _count: { id: true } }),
  ]);

  const currentYear = new Date().getFullYear();
  const publicationsThisYear = await prisma.publication.count({ where: { year: currentYear } });
  const ongoingProjects = await prisma.project.count({ where: { status: 'ONGOING' } });

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
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 tracking-tight">University Dashboard</h1>
          <p className="text-sm text-[#666666]">Real-time overview of academic activities</p>
        </div>

        {/* Key Metrics */}
        <section className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Key Metrics</h2>
            </div>
            <div className="text-sm text-[#666666]">
              Snapshot as of {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e8f5e9] p-3 rounded-xl">
                  <Users className="w-8 h-8 text-[#2d6a4f]" />
                </div>
                <span className="text-xs font-semibold text-[#2d6a4f] bg-[#e8f5e9] px-3 py-1 rounded-full">Active</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalFaculty}</p>
              <p className="text-sm text-[#666666]">Faculty Members</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#e3f2fd] p-3 rounded-xl">
                  <Briefcase className="w-8 h-8 text-[#1976d2]" />
                </div>
                <span className="text-xs font-semibold text-[#1976d2] bg-[#e3f2fd] px-3 py-1 rounded-full">Total</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalProjects}</p>
              <p className="text-sm text-[#666666]">Projects (all statuses)</p>
              <p className="text-xs text-[#1976d2] mt-1">Ongoing: {ongoingProjects}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#f3e5f5] p-3 rounded-xl">
                  <BookOpen className="w-8 h-8 text-[#7b1fa2]" />
                </div>
                <span className="text-xs font-semibold text-[#7b1fa2] bg-[#f3e5f5] px-3 py-1 rounded-full">All time</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalPublications}</p>
              <p className="text-sm text-[#666666]">Publications</p>
              <p className="text-xs text-[#7b1fa2] mt-1">This year: {publicationsThisYear}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-5">
                <div className="bg-[#fff3e0] p-3 rounded-xl">
                  <GraduationCap className="w-8 h-8 text-[#e65100]" />
                </div>
                <span className="text-xs font-semibold text-[#e65100] bg-[#fff3e0] px-3 py-1 rounded-full">Total</span>
              </div>
              <p className="text-4xl font-bold text-[#1a1a1a] leading-none mb-2">{totalStudentsSupervised._sum?.studentsSupervised || 0}</p>
              <p className="text-sm text-[#666666]">Students Supervised</p>
              <p className="text-xs text-[#e65100] mt-1">Across approved faculty</p>
            </div>
          </div>
        </section>

        {/* Department & Research Analytics (2x2 grid) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#2d6a4f] rounded-full" />
            Department & Research Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Research Projects by Department</h3>
              <div style={{ height: 320 }}>
                <LineChart data={projectsByDept} color="#2d6a4f" showArea={true} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Faculty Members by Department</h3>
              <div style={{ height: 320 }}>
                <BarChart data={staffByDept} color="#1976d2" showValues={true} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Students Supervised</h3>
              <div style={{ height: 320 }}>
                <BarChart data={studentsByDept} color="#e65100" showValues={false} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Research Trends (last 6 years)</h3>
              <div style={{ height: 320 }}>
                <AreaChart data={publicationsTimeline} color="#2d6a4f" gradient={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Project Status & Faculty Distribution */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon className="w-6 h-6 text-[#2d6a4f]" />
              <h3 className="text-xl font-bold text-[#1a1a1a]">Project Status</h3>
            </div>
            <PieChart data={projectsStatusPieData} colors={[ '#1976d2', '#2d6a4f', '#e65100' ]} donut={true} />
          </div>

          <div className="bg-white rounded-2xl shadow-md border-2 border-[#e5e5e5] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-[#1a1a1a]">Faculty Distribution</h3>
              <span className="text-sm text-[#666666]">By department size</span>
            </div>
            <PieChart
              data={departmentDistribution}
              colors={[ '#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc' ]}
              donut={false}
              height={420}
              center={[ '50%', '50%' ]}
              radius={'65%'}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
