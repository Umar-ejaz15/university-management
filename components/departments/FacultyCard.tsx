interface FacultyCardProps {
  name: string;
  shortName: string;
  dean: string;
  establishedYear: number;
  totalDepartments: number;
  totalStudents: number;
  totalStaff: number;
  description: string;
}

/**
 * Faculty Card Component
 * 
 * Displays a card with faculty information
 * Used in faculty listing pages
 */
export default function FacultyCard({
  name,
  shortName,
  dean,
  establishedYear,
  totalDepartments,
  totalStudents,
  totalStaff,
  description,
}: FacultyCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-[#e0e0e0] h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            {shortName}
          </h2>
          <span className="text-xs bg-[#f0f0ed] text-[#666666] px-3 py-1 rounded-full">
            Est. {establishedYear}
          </span>
        </div>
        <h3 className="text-sm font-medium text-[#666666]">
          {name}
        </h3>
      </div>

      {/* Dean Info */}
      <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
        <p className="text-xs text-[#888888] mb-1">Dean</p>
        <p className="text-sm font-medium text-[#1a1a1a]">
          {dean}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-[#888888] mb-1">Departments</p>
          <p className="text-lg font-bold text-[#1a1a1a]">
            {totalDepartments}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#888888] mb-1">Students</p>
          <p className="text-lg font-bold text-[#1a1a1a]">
            {totalStudents.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#888888] mb-1">Staff</p>
          <p className="text-lg font-bold text-[#1a1a1a]">
            {totalStaff}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#666666] line-clamp-3">
        {description}
      </p>

      {/* View More Link */}
      <div className="mt-4 pt-4 border-t border-[#e0e0e0]">
        <span className="text-sm text-[#4169E1] font-medium hover:underline">
          View Departments →
        </span>
      </div>
    </div>
  );
}
