import Header from '@/components/Header';
import StatsSection from '@/components/dashboard/StatsSection';
import ChartsSection from '@/components/dashboard/ChartsSection';
import FacultyTable from '@/components/dashboard/FacultyTable';

/**
 * University Dashboard - Main overview page
 * 
 * This is the central hub where administrators can see:
 * - Quick stats about faculty, projects, and publications
 * - Visual charts showing trends and department breakdowns
 * - A complete list of approved faculty members
 */
export default function UniDashboard() {
  return (
    <div className="min-h-screen bg-[#f0f0ed]">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">
          University Dashboard
        </h1>

        <StatsSection />
        <ChartsSection />
        <FacultyTable />
      </main>
    </div>
  );
}
