interface DepartmentCardProps {
  name: string;
  head: string;
  description: string;
  totalStudents: number;
  totalStaff: number;
  programs: string[];
}

/**
 * Department Card Component
 * 
 * Displays a card with department information
 * Used in faculty detail pages showing departments list
 */
export default function DepartmentCard({
  name,
  head,
  description,
  totalStudents,
  totalStaff,
  programs,
}: DepartmentCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-[#e0e0e0] h-full">
      {/* Department Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
          {name}
        </h3>
        <p className="text-sm text-[#666666] mb-3">
          {description}
        </p>
      </div>

      {/* Department Head */}
      <div className="mb-4 pb-4 border-b border-[#e0e0e0]">
        <p className="text-xs text-[#888888] mb-1">Head of Department</p>
        <p className="text-sm font-medium text-[#1a1a1a]">
          {head}
        </p>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-[#888888] mb-1">Students</p>
          <p className="text-lg font-bold text-[#1a1a1a]">
            {totalStudents}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#888888] mb-1">Staff</p>
          <p className="text-lg font-bold text-[#1a1a1a]">
            {totalStaff}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#888888] mb-1">Programs</p>
          <p className="text-lg font-bold text-[#1a1a1a]">
            {programs.length}
          </p>
        </div>
      </div>

      {/* Programs List */}
      <div className="mb-4">
        <p className="text-xs text-[#888888] mb-2">Programs Offered</p>
        <div className="flex flex-wrap gap-2">
          {programs.map((program, idx) => (
            <span
              key={idx}
              className="text-xs bg-[#f0f0ed] text-[#666666] px-2 py-1 rounded"
            >
              {program}
            </span>
          ))}
        </div>
      </div>

      {/* View More */}
      <div className="pt-4 border-t border-[#e0e0e0]">
        <span className="text-sm text-[#4169E1] font-medium hover:underline">
          View Department Details →
        </span>
      </div>
    </div>
  );
}
