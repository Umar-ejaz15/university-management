interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected';
  label?: string;
}

/**
 * Status badge component with color coding for different states
 */
export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusConfig = {
    approved: {
      className: 'text-green-700',
      defaultLabel: 'Approved'
    },
    pending: {
      className: 'text-yellow-700',
      defaultLabel: 'Pending'
    },
    rejected: {
      className: 'text-red-700',
      defaultLabel: 'Rejected'
    }
  };

  const config = statusConfig[status];
  
  return (
    <span className={`${config.className} font-medium`}>
      {label || config.defaultLabel}
    </span>
  );
}
