const statusStyles = {
  ACTIVE: 'bg-success-50 text-success-700',
  IN_PROGRESS: 'bg-primary-50 text-primary-700',
  SCHEDULED: 'bg-warning-50 text-warning-700',
  COMPLETED: 'bg-success-50 text-success-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  INACTIVE: 'bg-gray-100 text-gray-500',
  ON_LEAVE: 'bg-warning-50 text-warning-700',
  MAINTENANCE: 'bg-danger-50 text-danger-700',
  UNDER_REVIEW: 'bg-warning-50 text-warning-700',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`badge ${style}`}>
      {status?.replace(/_/g, ' ') || 'UNKNOWN'}
    </span>
  );
}
