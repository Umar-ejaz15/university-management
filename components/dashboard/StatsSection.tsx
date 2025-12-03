import StatCard from '@/components/StatCard';
import { dashboardStats } from '@/lib/dashboard-data';

/**
 * Displays the overview statistics at the top of the dashboard
 * Shows key metrics like faculty count, projects, and publications
 */
export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {dashboardStats.map((stat) => (
        <StatCard 
          key={stat.id}
          title={stat.title} 
          value={stat.value} 
        />
      ))}
    </div>
  );
}
