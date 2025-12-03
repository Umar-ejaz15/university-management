import DataTable from '@/components/DataTable';
import { facultyTableColumns } from '@/lib/dashboard-data';
import { facultyTableData } from '@/lib/faculty-table-data';

/**
 * Main faculty listing table on the dashboard
 * Shows all approved faculty members with their key information
 */
export default function FacultyTable() {
  return (
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
        columns={facultyTableColumns}
        data={facultyTableData}
        emptyMessage="No faculty members to display"
      />
    </div>
  );
}
