import Link from 'next/link';

interface ActionButtonsProps {
  viewHref?: string;
  onEdit?: () => void;
  viewLabel?: string;
  editLabel?: string;
}

/**
 * Reusable action buttons for table rows - includes View and Edit options
 */
export default function ActionButtons({ 
  viewHref, 
  onEdit,
  viewLabel = 'View',
  editLabel = 'Edit'
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {viewHref ? (
        <Link 
          href={viewHref} 
          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
        >
          {viewLabel}
        </Link>
      ) : (
        <button 
          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
        >
          {viewLabel}
        </button>
      )}
      <button 
        onClick={onEdit}
        className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
      >
        {editLabel}
      </button>
    </div>
  );
}
