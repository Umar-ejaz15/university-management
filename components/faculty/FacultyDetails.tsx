import PublicationsChart from '@/components/charts/PublicationsChart';
import DataTable from '@/components/DataTable';

interface FacultyDetailsProps {
  publicationsHistory: {
    years: string[];
    values: number[];
  };
  teachingLoad: Array<{
    course: string;
    credits: string;
    students: string;
  }>;
}

const teachingLoadColumns = [
  { key: 'course', label: 'Course' },
  { key: 'credits', label: 'Credits', align: 'center' as const },
  { key: 'students', label: 'Students', align: 'center' as const },
];

/**
 * Faculty details section showing publications and teaching information
 * Split into two side-by-side cards for better visual organization
 */
export default function FacultyDetails({ publicationsHistory, teachingLoad }: FacultyDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Publications history chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#2d6a4f] mb-4">
          Publications (Last 6 Years)
        </h3>
        <PublicationsChart data={publicationsHistory} />
      </div>

      {/* Current semester teaching load */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-[#2d6a4f] mb-4">
          Teaching Load (This Semester)
        </h3>
        <DataTable
          columns={teachingLoadColumns}
          data={teachingLoad}
          className="mt-4"
        />
      </div>
    </div>
  );
}
