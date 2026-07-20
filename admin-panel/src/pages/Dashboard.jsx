import { useEffect, useState } from 'react';
import DashboardCard from '../components/ui/DashboardCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Loader } from '../components/ui/Loader';
import { dashboardAPI } from '../api/dashboard.api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardAPI.getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading dashboard..." />;
  if (error) return <div className="card text-danger-500">{error}</div>;
  if (!stats) return null;

  const tripColumns = [
    { key: 'route', label: 'Route', render: (r) => r.route?.routeNo || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'driver', label: 'Driver', render: (r) => r.driver?.licenseNo || '—' },
    { key: 'scheduledStart', label: 'Scheduled', render: (r) => new Date(r.scheduledStart).toLocaleDateString() },
  ];

  const driverColumns = [
    { key: 'name', label: 'Name', render: (r) => r.user?.name || '—' },
    { key: 'email', label: 'Email', render: (r) => r.user?.email || '—' },
    { key: 'licenseNo', label: 'License' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your fleet operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <DashboardCard icon="🚌" label="Total Drivers" value={stats.totalDrivers} color="primary" />
        <DashboardCard icon="🚍" label="Total Buses" value={stats.totalBuses} color="success" />
        <DashboardCard icon="🛣️" label="Total Routes" value={stats.totalRoutes} color="warning" />
        <DashboardCard icon="📍" label="Total Stops" value={stats.totalStops} color="danger" />
        <DashboardCard icon="📅" label="Scheduled Trips" value={stats.scheduledTrips} color="warning" />
        <DashboardCard icon="▶️" label="Active Trips" value={stats.activeTrips} color="success" />
        <DashboardCard icon="✅" label="Completed Trips" value={stats.completedTrips} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-4">Recent Trips</h3>
          <DataTable
            columns={tripColumns}
            data={stats.recentTrips}
            emptyMessage="No trips yet."
          />
        </div>
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-4">Recent Drivers</h3>
          <DataTable
            columns={driverColumns}
            data={stats.recentDrivers}
            emptyMessage="No drivers yet."
          />
        </div>
      </div>
    </div>
  );
}
