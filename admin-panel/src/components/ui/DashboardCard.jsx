export default function DashboardCard({ icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-500',
    warning: 'bg-warning-50 text-warning-500',
    danger: 'bg-danger-50 text-danger-500',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorMap[color] || colorMap.primary}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}
