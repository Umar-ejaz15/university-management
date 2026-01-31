
import PieChart from '@/components/charts/PieChart';
import { prisma } from '@/lib/db';

export default async function Home() {
  // Fetch all faculties and their departments with staff counts
  const faculties = await prisma.faculty.findMany({
    include: {
      departments: {
        include: {
          staff: {
            where: { status: 'APPROVED' },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Flatten departments and count staff per department
  const departmentDistribution = faculties.flatMap(faculty =>
    faculty.departments.map(dept => ({
      name: `${dept.name} (${faculty.shortName})`,
      value: dept.staff.length,
    }))
  ).filter(d => d.value > 0);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] p-0 m-0">
      <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6 mt-4 text-center drop-shadow-lg">Faculty Distribution by Department</h1>
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-full h-[80vh] max-w-6xl flex items-center justify-center">
          <PieChart
            data={departmentDistribution}
            colors={[ '#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#1976d2', '#e65100', '#7b1fa2', '#f3e5f5' ]}
            donut={false}
            height={600}
            center={[ '50%', '50%' ]}
            radius={'80%'}
          />
        </div>
      </div>
      <p className="text-center text-[#666] mt-6 text-lg max-w-2xl mx-auto">This interactive chart shows the distribution of faculty members across all departments. Data is always up-to-date and includes both seeded and admin-added entries. Hover or tap on a segment for details.</p>
    </div>
  );
}
