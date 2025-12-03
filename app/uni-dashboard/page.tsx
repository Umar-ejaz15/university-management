import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import DataTable from '@/components/DataTable';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import Link from 'next/link';

export default function UniDashboard() {
  const facultyColumns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'projects', label: 'Projects', align: 'center' as const },
    { key: 'publications', label: 'Publications', align: 'center' as const },
    { key: 'status', label: 'Status', align: 'center' as const },
    { key: 'actions', label: 'Actions', align: 'center' as const },
  ];

  // Sample faculty data
  const facultyData = [
    {
      name: 'Dr. Aamir Hussain',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      projects: '3',
      publications: '22',
      status: <span className="text-green-700 font-medium">Approved</span>,
      actions: (
        <div className="flex gap-2">
          <Link href="/faculty/aamir-hussain" className="text-blue-600 hover:text-blue-800 text-sm">View</Link>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
        </div>
      )
    },
    {
      name: 'Dr. Sarah Ahmed',
      department: 'Mathematics',
      designation: 'Associate Professor',
      projects: '5',
      publications: '31',
      status: <span className="text-green-700 font-medium">Approved</span>,
      actions: (
        <div className="flex gap-2">
          <Link href="/faculty/sarah-ahmed" className="text-blue-600 hover:text-blue-800 text-sm">View</Link>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
        </div>
      )
    },
    {
      name: 'Dr. Muhammad Ali',
      department: 'Physics',
      designation: 'Professor',
      projects: '8',
      publications: '45',
      status: <span className="text-green-700 font-medium">Approved</span>,
      actions: (
        <div className="flex gap-2">
          <Link href="/faculty/muhammad-ali" className="text-blue-600 hover:text-blue-800 text-sm">View</Link>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
        </div>
      )
    },
    {
      name: 'Dr. Fatima Khan',
      department: 'Chemistry',
      designation: 'Assistant Professor',
      projects: '4',
      publications: '18',
      status: <span className="text-green-700 font-medium">Approved</span>,
      actions: (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
        </div>
      )
    },
    {
      name: 'Dr. Ahmed Raza',
      department: 'Computer Science',
      designation: 'Lecturer',
      projects: '2',
      publications: '12',
      status: <span className="text-green-700 font-medium">Approved</span>,
      actions: (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
        </div>
      )
    },
    {
      name: 'Dr. Zainab Malik',
      department: 'Biology',
      designation: 'Associate Professor',
      projects: '6',
      publications: '28',
      status: <span className="text-green-700 font-medium">Approved</span>,
      actions: (
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
        </div>
      )
    },
  ];

  // Publications by Department data
  const publicationsByDept = {
    categories: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering'],
    values: [56, 42, 67, 38, 51, 44]
  };

  // Research Projects Over Time data
  const researchProjectsOverTime = {
    categories: ['2020', '2021', '2022', '2023', '2024', '2025'],
    values: [12, 18, 25, 32, 38, 45]
  };

  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">University Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Faculty" value="156" />
          <StatCard title="Ongoing Research Projects" value="45" />
          <StatCard title="Publications (This Year)" value="89" />
          <StatCard title="Students Supervised" value="342" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Publications by Department">
            <BarChart data={publicationsByDept} />
          </ChartCard>
          <ChartCard title="Research Projects Over Time">
            <LineChart data={researchProjectsOverTime} />
          </ChartCard>
        </div>

        {/* Faculty Listing Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">
              Faculty Listing (Approved)
            </h2>
            <button className="bg-[#2d6a4f] hover:bg-[#25573f] text-white px-5 py-2 rounded-md text-sm font-medium transition-colors">
              Add Faculty
            </button>
          </div>
          
          <DataTable
            columns={facultyColumns}
            data={facultyData}
            emptyMessage="No faculty members to display"
          />
        </div>
      </main>
    </div>
  );
}
