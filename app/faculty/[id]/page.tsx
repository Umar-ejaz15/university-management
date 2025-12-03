import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import ChartCard from '@/components/ChartCard';
import DataTable from '@/components/DataTable';
import PublicationsChart from '@/components/charts/PublicationsChart';
import { getFacultyById } from '@/lib/faculty-data';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FacultyPage({ params }: PageProps) {
  const { id } = await params;
  const faculty = getFacultyById(id);

  if (!faculty) {
    notFound();
  }

  const teachingLoadColumns = [
    { key: 'course', label: 'Course' },
    { key: 'credits', label: 'Credits', align: 'center' as const },
    { key: 'students', label: 'Students', align: 'center' as const },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Faculty Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Image Placeholder */}
              <div className="w-[130px] h-[130px] rounded-full bg-[#d4e5dd] flex-shrink-0 border-[3px] border-[#2d6a4f]" />
              
              <div>
                <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-1 leading-tight">
                  {faculty.name}
                </h1>
                <p className="text-[#666666] text-[16px] mb-4 font-normal">
                  {faculty.designation} • Department of {faculty.department}
                </p>
                
                <div className="flex gap-3 text-[15px]">
                  <div className="bg-[#f1f1f1] px-4 py-1.5 rounded-3xl">
                    <span className="font-normal text-[#2d6a4f]">Publications: </span>
                    <span className="font-bold text-[#195339]">{faculty.publications}</span>
                  </div>
                  <div className="bg-[#f1f1f1] px-4 py-1.5 rounded-3xl">
                    <span className="font-normal text-[#2d6a4f]">Projects: </span>
                    <span className="font-bold text-[#195339]">{faculty.projects}</span>
                  </div>
                  <div className="bg-[#f1f1f1] px-4 py-1.5 rounded-3xl">
                    <span className="font-normal text-[#2d6a4f]">Students: </span>
                    <span className="font-bold text-[#195339]">{faculty.students}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="bg-[#c9a961] hover:bg-[#b89850] text-white px-6 py-2.5 rounded-md text-[14px] font-medium transition-colors shadow-sm">
              Edit / Add Data
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Publications Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#2d6a4f] mb-4">
              Publications (Last 6 Years)
            </h3>
            <PublicationsChart data={faculty.publicationsHistory} />
          </div>

          {/* Teaching Load Table */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#2d6a4f] mb-4">
              Teaching Load (This Semester)
            </h3>
            <DataTable
              columns={teachingLoadColumns}
              data={faculty.teachingLoad}
              className="mt-4"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex items-center justify-between text-sm text-[#5a5a5a]">
            <p>© 2025 MNSUAM — Faculty Dashboard (Mock)</p>
            <div className="flex items-center gap-4">
              <span>Theme:</span>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="w-4 h-4 rounded-full bg-[#2d6a4f] border-2 border-[#1a1a1a]"></span>
                <span>Green</span>
              </button>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="w-4 h-4 rounded-full bg-[#c9a961] border-2 border-[#1a1a1a]"></span>
                <span>Gold</span>
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
