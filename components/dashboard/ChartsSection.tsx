import ChartCard from '@/components/ChartCard';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import { publicationsByDepartment, researchProjectsTimeline } from '@/lib/dashboard-data';

/**
 * Charts section showing visual analytics
 * Includes publications by department and research trends over time
 */
export default function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <ChartCard title="Publications by Department">
        <BarChart data={publicationsByDepartment} color="#2d6a4f" />
      </ChartCard>

      <ChartCard title="Research Projects Over Time">
        <LineChart data={researchProjectsTimeline} color="#2d6a4f" />
      </ChartCard>
    </div>
  );
}
