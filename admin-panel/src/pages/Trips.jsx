import { useEffect, useState, useCallback } from 'react';
import { tripsAPI } from '../api/trips.api';
import { driversAPI } from '../api/drivers.api';
import { busesAPI } from '../api/buses.api';
import { routesAPI } from '../api/routes.api';
import DataTable from '../components/ui/DataTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import ActionButtons from '../components/ui/ActionButtons';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormInput from '../components/ui/FormInput';
import { Plus } from 'lucide-react';

const EMPTY_FORM = { routeId: '', driverId: '', busId: '', scheduledStart: '', status: 'SCHEDULED' };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const data = await tripsAPI.getAll(params);
      setTrips(data.trips || []);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / 10));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const loadFormData = async () => {
    const [d, b, r] = await Promise.all([
      driversAPI.getAll({ limit: 100 }).catch(() => ({ drivers: [] })),
      busesAPI.getAll({ limit: 100 }).catch(() => ({ buses: [] })),
      routesAPI.getAll({ limit: 100 }).catch(() => ({ routes: [] })),
    ]);
    setDrivers(d.drivers || []);
    setBuses(b.buses || []);
    setRoutes(r.routes || []);
  };

  useEffect(() => {
    if (modalOpen) loadFormData();
  }, [modalOpen]);

  const handleEdit = (trip) => {
    setEditing(trip);
    setForm({
      routeId: trip.routeId || '',
      driverId: trip.driverId || '',
      busId: trip.busId || '',
      scheduledStart: trip.scheduledStart ? new Date(trip.scheduledStart).toISOString().slice(0, 16) : '',
      status: trip.status || 'SCHEDULED',
    });
    setError('');
    setModalOpen(true);
  };

  const handleAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.routeId || !form.driverId || !form.busId || !form.scheduledStart) {
      setError('Route, Driver, Bus, and Schedule Date are required.'); return;
    }
    setSaving(true); setError('');
    try {
      if (editing) await tripsAPI.update(editing.id, form);
      else await tripsAPI.create(form);
      setModalOpen(false); fetchTrips();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await tripsAPI.delete(editing.id); setConfirmOpen(false); fetchTrips(); }
    catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  };

  const filtered = trips.filter((t) =>
    !search || t.route?.routeNo?.toLowerCase().includes(search.toLowerCase()) ||
    t.route?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.driver?.licenseNo?.toLowerCase().includes(search.toLowerCase()) ||
    t.bus?.regNo?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'route', label: 'Route', render: (r) => (
      <div><span className="font-medium">{r.route?.routeNo || '—'}</span><br /><span className="text-xs text-gray-500">{r.route?.name || ''}</span></div>
    )},
    { key: 'driver', label: 'Driver', render: (r) => r.driver?.licenseNo || '—' },
    { key: 'bus', label: 'Bus', render: (r) => r.bus?.regNo || '—' },
    { key: 'scheduledStart', label: 'Schedule', render: (r) => (
      <span className="text-sm">{new Date(r.scheduledStart).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
    )},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r) => (
      <ActionButtons onEdit={() => handleEdit(r)} onDelete={() => { setEditing(r); setConfirmOpen(true); }} />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage driver trips</p>
        </div>
        <button onClick={handleAdd} className="btn-primary"><Plus className="w-4 h-4" /> Create Trip</button>
      </div>

      {error && <div className="bg-danger-50 text-danger-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full max-w-xs"><SearchBar value={search} onChange={setSearch} placeholder="Search trips..." /></div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input max-w-[180px]">
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No trips found." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Trip' : 'Create Trip'} size="lg">
        <div className="space-y-4">
          <FormInput tag="select" label="Route" value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
            <option value="">— Select Route —</option>
            {routes.map((r) => <option key={r.id} value={r.id}>[{r.routeNo}] {r.name} ({r.startLocation} → {r.endLocation})</option>)}
          </FormInput>

          <FormInput tag="select" label="Driver" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
            <option value="">— Select Driver —</option>
            {drivers.filter((d) => d.status === 'ACTIVE').map((d) => (
              <option key={d.id} value={d.id}>{d.user?.name || '—'} ({d.licenseNo})</option>
            ))}
          </FormInput>

          <FormInput tag="select" label="Bus" value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })}>
            <option value="">— Select Bus —</option>
            {buses.filter((b) => b.status === 'ACTIVE').map((b) => (
              <option key={b.id} value={b.id}>{b.regNo} — {b.model} ({b.capacity} seats)</option>
            ))}
          </FormInput>

          <FormInput label="Schedule Date & Time" type="datetime-local" value={form.scheduledStart} onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })} />

          {editing && (
            <FormInput tag="select" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </FormInput>
          )}

          <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-700">
            <p className="font-semibold mb-1">Trip Creation Flow</p>
            <p>1. Select Route → 2. Select Driver → 3. Select Bus → 4. Set Date & Time</p>
            <p className="mt-1 text-xs text-primary-500">Only admins can create and assign trips. Drivers manage trip execution.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Trip'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Trip" message={`Delete this trip? This action cannot be undone.`} loading={deleting} />
    </div>
  );
}
