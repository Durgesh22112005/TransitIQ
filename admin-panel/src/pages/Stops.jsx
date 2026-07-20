import { useEffect, useState, useCallback } from 'react';
import { stopsAPI } from '../api/stops.api';
import { routesAPI } from '../api/routes.api';
import DataTable from '../components/ui/DataTable';
import SearchBar from '../components/ui/SearchBar';
import ActionButtons from '../components/ui/ActionButtons';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormInput from '../components/ui/FormInput';
import { Plus } from 'lucide-react';

const EMPTY_FORM = { name: '', routeId: '', sequence: 1, landmark: '' };

export default function Stops() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [routes, setRoutes] = useState([]);

  const fetchStops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stopsAPI.getAll();
      setStops(data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStops(); }, [fetchStops]);

  useEffect(() => {
    if (modalOpen) {
      routesAPI.getAll({ limit: 100 }).then((d) => setRoutes(d.routes || [])).catch(() => {});
    }
  }, [modalOpen]);

  const handleEdit = (stop) => {
    setEditing(stop);
    setForm({ name: stop.name, routeId: stop.routeId, sequence: stop.sequence, landmark: stop.landmark || '' });
    setError(''); setModalOpen(true);
  };

  const handleAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.routeId || !form.sequence) { setError('Name, Route, and Sequence are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) await stopsAPI.update(editing.id, form);
      else await stopsAPI.create(form);
      setModalOpen(false); fetchStops();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await stopsAPI.delete(editing.id); setConfirmOpen(false); fetchStops(); }
    catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  };

  const filtered = stops.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.route?.routeNo?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'sequence', label: '#', render: (r) => <span className="font-bold text-primary-600">{r.sequence}</span> },
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'route', label: 'Route', render: (r) => r.route ? `${r.route.routeNo} — ${r.route.name}` : '—' },
    { key: 'landmark', label: 'Landmark', render: (r) => r.landmark || '—' },
    { key: 'actions', label: '', render: (r) => (
      <ActionButtons onEdit={() => handleEdit(r)} onDelete={() => { setEditing(r); setConfirmOpen(true); }} />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stops</h1>
          <p className="text-sm text-gray-500 mt-1">Manage route stops</p>
        </div>
        <button onClick={handleAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Stop</button>
      </div>

      {error && <div className="bg-danger-50 text-danger-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="max-w-xs"><SearchBar value={search} onChange={setSearch} placeholder="Search stops..." /></div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No stops found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Stop' : 'Add Stop'} size="lg">
        <div className="space-y-4">
          <FormInput label="Stop Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Railway Station" />
          <FormInput tag="select" label="Route" value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
            <option value="">— Select Route —</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.routeNo} — {r.name}</option>)}
          </FormInput>
          <FormInput label="Sequence" type="number" value={form.sequence} onChange={(e) => setForm({ ...form, sequence: parseInt(e.target.value) || 1 })} />
          <FormInput label="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} placeholder="e.g. Near City Hospital" />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Stop" message={`Delete stop "${editing?.name}"?`} loading={deleting} />
    </div>
  );
}
