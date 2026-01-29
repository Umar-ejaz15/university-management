interface Column {
  key: string;
  label: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  data?: Record<string, React.ReactNode>[];
  emptyMessage?: string;
  className?: string;
}

/**
 * Flexible table component that works with any data structure
 * Handles empty states and alternating row colors automatically
 */
export default function DataTable({
  columns,
  data = [],
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-[#e8e8e8]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`py-3 px-6 text-[15px] font-semibold text-[#1a1a1a] ${column.className || ''}`}
                style={{ textAlign: column.align || 'left' }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f5]'}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3.5 px-6 text-[15px] text-[#3a3a3a] ${column.className || ''}`}
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
