import { useEffect, useState, useCallback } from 'react';
import { busesAPI } from '../api/buses.api';
import DataTable from '../components/ui/DataTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import ActionButtons from '../components/ui/ActionButtons';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormInput from '../components/ui/FormInput';
import { Plus } from 'lucide-react';

const EMPTY_FORM = { regNo: '', model: '', capacity: 50, status: 'ACTIVE' };

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await busesAPI.getAll({ page, limit: 10 });
      setBuses(data.buses || []);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / 10));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchBuses(); }, [fetchBuses]);

  const handleEdit = (bus) => {
    setEditing(bus);
    setForm({ regNo: bus.regNo, model: bus.model, capacity: bus.capacity, status: bus.status });
    setError('');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.regNo || !form.model || !form.capacity) { setError('Reg No, Model, and Capacity are required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await busesAPI.update(editing.id, form);
      } else {
        await busesAPI.create(form);
      }
      setModalOpen(false);
      fetchBuses();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await busesAPI.delete(editing.id);
      setConfirmOpen(false);
      fetchBuses();
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  };

  const filtered = buses.filter((b) =>
    !search || b.regNo?.toLowerCase().includes(search.toLowerCase()) ||
    b.model?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'regNo', label: 'Reg. No', render: (r) => <span className="font-medium">{r.regNo}</span> },
    { key: 'model', label: 'Model' },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.capacity} seats` },
    { key: 'drivers', label: 'Drivers', render: (r) => r._count?.drivers ?? 0 },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r) => (
      <ActionButtons onEdit={() => handleEdit(r)} onDelete={() => { setEditing(r); setConfirmOpen(true); }} />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your bus fleet</p>
        </div>
        <button onClick={handleAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Bus</button>
      </div>

      {error && <div className="bg-danger-50 text-danger-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="max-w-xs"><SearchBar value={search} onChange={setSearch} placeholder="Search buses..." /></div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No buses found." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Bus' : 'Add Bus'} size="lg">
        <div className="space-y-4">
          <FormInput label="Registration Number" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} placeholder="e.g. KA-01-AB-1234" />
          <FormInput label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Tata Starbus" />
          <FormInput label="Capacity (seats)" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 50 })} />
          <FormInput tag="select" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </FormInput>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="Delete Bus" message={`Delete bus ${editing?.regNo}? This action cannot be undone.`} loading={deleting} />
    </div>
  );
}
