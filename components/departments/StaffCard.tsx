import { DepartmentStaff } from '@/lib/department-data';

interface StaffCardProps {
  staff: DepartmentStaff;
}

/**
 * Staff Card Component
 * 
 * Displays a staff member's information
 * Used in department pages to show faculty members
 */
export default function StaffCard({ staff }: StaffCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-[#e0e0e0] hover:shadow-md transition-shadow">
      {/* Staff Name and Designation */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">
          {staff.name}
        </h3>
        <p className="text-sm text-[#666666]">
          {staff.designation}
        </p>
      </div>

      {/* Contact */}
      <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
        <p className="text-xs text-[#888888] mb-1">Email</p>
        <a
          href={`mailto:${staff.email}`}
          className="text-sm text-[#4169E1] hover:underline break-all"
        >
          {staff.email}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#888888] mb-1">Publications</p>
          <p className="text-xl font-bold text-[#1a1a1a]">
            {staff.publications}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#888888] mb-1">Projects</p>
          <p className="text-xl font-bold text-[#1a1a1a]">
            {staff.projects}
          </p>
        </div>
      </div>
    </div>
  );
}
