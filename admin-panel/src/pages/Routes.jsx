import { useEffect, useState, useCallback } from 'react';
import { routesAPI } from '../api/routes.api';
import DataTable from '../components/ui/DataTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import ActionButtons from '../components/ui/ActionButtons';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormInput from '../components/ui/FormInput';
import { Plus, MapPin } from 'lucide-react';

const EMPTY_FORM = { name: '', routeNo: '', startLocation: '', endLocation: '', distance: '', duration: '', status: 'ACTIVE' };

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stopsModal, setStopsModal] = useState(false);
  const [stopsData, setStopsData] = useState([]);
  const [stopsRouteName, setStopsRouteName] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await routesAPI.getAll({ page, limit: 10, search });
      setRoutes(data.routes || []);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / 10));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const handleViewStops = async (route) => {
    try {
      const data = await routesAPI.getById(route.id);
      setStopsData(data.stops || []);
      setStopsRouteName(`${data.routeNo} — ${data.name}`);
      setStopsModal(true);
    } catch (err) { setError(err.message); }
  };

  const handleEdit = (route) => {
    setEditing(route);
    setForm({
      name: route.name, routeNo: route.routeNo,
      startLocation: route.startLocation, endLocation: route.endLocation,
      distance: route.distance || '', duration: route.duration || '',
      status: route.status,
    });
    setError('');
    setModalOpen(true);
  };

  const handleAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.routeNo || !form.startLocation || !form.endLocation) {
      setError('Name, Route No, Start, and End locations are required.'); return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      distance: form.distance ? parseFloat(form.distance) : null,
      duration: form.duration ? parseInt(form.duration) : null,
    };
    try {
      if (editing) await routesAPI.update(editing.id, payload);
      else await routesAPI.create(payload);
      setModalOpen(false);
      fetchRoutes();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await routesAPI.delete(editing.id);
      setConfirmOpen(false);
      fetchRoutes();
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'routeNo', label: 'Route No', render: (r) => <span className="font-medium text-primary-600">{r.routeNo}</span> },
    { key: 'name', label: 'Name' },
    { key: 'startLocation', label: 'From' },
    { key: 'endLocation', label: 'To' },
    { key: 'distance', label: 'Distance', render: (r) => r.distance ? `${r.distance} km` : '—' },
    { key: 'duration', label: 'Duration', render: (r) => r.duration ? `${r.duration} min` : '—' },
    { key: 'stops', label: 'Stops', render: (r) => (
      <button onClick={(e) => { e.stopPropagation(); handleViewStops(r); }} className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center gap-1">
        <MapPin className="w-3.5 h-3.5" /> {r._count?.stops ?? 0}
      </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage transit routes</p>
        </div>
        <button onClick={handleAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Route</button>
      </div>

      {error && <div className="bg-danger-50 text-danger-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="max-w-xs"><SearchBar value={search} onChange={setSearch} placeholder="Search routes..." /></div>

      <DataTable columns={columns} data={routes} loading={loading} emptyMessage="No routes found." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Route' : 'Add Route'} size="lg">
        <div className="space-y-4">
          <FormInput label="Route Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. City Center - Bus Terminal" />
          <FormInput label="Route Number" value={form.routeNo} onChange={(e) => setForm({ ...form, routeNo: e.target.value })} placeholder="e.g. R-101" />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Start Location" value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} placeholder="e.g. City Center" />
            <FormInput label="End Location" value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} placeholder="e.g. Bus Terminal" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Distance (km)" type="number" step="0.1" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
            <FormInput label="Duration (min)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <FormInput tag="select" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="UNDER_REVIEW">Under Review</option>
          </FormInput>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <Modal open={stopsModal} onClose={() => setStopsModal(false)} title={`Stops — ${stopsRouteName}`} size="lg">
        {stopsData.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No stops on this route.</p>
        ) : (
          <div className="space-y-2">
            {stopsData.map((stop, i) => (
              <div key={stop.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                  {stop.sequence}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{stop.name}</p>
                  {stop.landmark && <p className="text-xs text-gray-500">{stop.landmark}</p>}
                </div>
                {i < stopsData.length - 1 && (
                  <div className="w-px h-6 bg-gray-300 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Route" message={`Delete route ${editing?.routeNo}? This also removes all associated stops.`} loading={deleting} />
    </div>
  );
}
