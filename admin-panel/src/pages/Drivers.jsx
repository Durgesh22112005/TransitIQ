import { useEffect, useState, useCallback } from 'react';
import { driversAPI } from '../api/drivers.api';
import { authAPI } from '../api/auth.api';
import { usersAPI } from '../api/users.api';
import { busesAPI } from '../api/buses.api';
import DataTable from '../components/ui/DataTable';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import ActionButtons from '../components/ui/ActionButtons';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FormInput from '../components/ui/FormInput';
import { Plus, UserPlus, Link } from 'lucide-react';

const EMPTY_FORM = {
  userId: '', name: '', email: '', phone: '', password: '',
  licenseNo: '', experience: 0, status: 'ACTIVE', assignedBusId: '',
};

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
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
  const [buses, setBuses] = useState([]);
  const [driverUsers, setDriverUsers] = useState([]);
  const [linkMode, setLinkMode] = useState('create');

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await driversAPI.getAll({ page, limit: 10 });
      setDrivers(data.drivers || []);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / 10));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  useEffect(() => {
    if (modalOpen && !editing) {
      Promise.all([
        busesAPI.getAll({ limit: 100 }),
        usersAPI.getAll({ role: 'DRIVER' }),
      ]).then(([b, u]) => {
        setBuses(b.buses || []);
        setDriverUsers(u || []);
      }).catch(() => {});
    }
  }, [modalOpen, editing]);

  const handleEdit = (driver) => {
    setEditing(driver);
    setForm({
      userId: driver.user?.id || '',
      name: driver.user?.name || '', email: driver.user?.email || '',
      phone: driver.user?.phone || '', password: '',
      licenseNo: driver.licenseNo || '',
      experience: driver.experience || 0,
      status: driver.status || 'ACTIVE',
      assignedBusId: driver.assignedBusId || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setLinkMode('create');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.licenseNo) { setError('License number is required.'); return; }

    if (!editing && linkMode === 'create') {
      if (!form.name || !form.email || !form.password) {
        setError('Name, Email, and Password are required to create a new user.'); return;
      }
    }
    if (!editing && linkMode === 'link' && !form.userId) {
      setError('Please select a user to link.'); return;
    }

    setSaving(true);
    setError('');
    try {
      let userId = form.userId;

      if (!editing && linkMode === 'create') {
        const regResult = await authAPI.register({
          name: form.name, email: form.email,
          password: form.password, phone: form.phone || undefined,
          role: 'DRIVER',
        });
        userId = regResult.user.id;
      }

      const payload = {
        userId,
        licenseNo: form.licenseNo,
        experience: parseInt(form.experience) || 0,
        status: form.status,
        assignedBusId: form.assignedBusId || null,
      };

      if (editing) {
        await driversAPI.update(editing.id, payload);
      } else {
        await driversAPI.create(payload);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await driversAPI.delete(editing.id);
      setConfirmOpen(false);
      fetchDrivers();
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  };

  const existingDriverUserIds = new Set(drivers.map((d) => d.user?.id));
  const availableUsers = driverUsers.filter((u) => !existingDriverUserIds.has(u.id));

  const filtered = drivers.filter((d) =>
    !search || d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNo?.toLowerCase().includes(search.toLowerCase()) ||
    d.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Name', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
          {r.user?.name?.[0]?.toUpperCase() || 'D'}
        </div>
        <span className="font-medium">{r.user?.name || '—'}</span>
      </div>
    )},
    { key: 'email', label: 'Email', render: (r) => <span className="text-gray-500">{r.user?.email || '—'}</span> },
    { key: 'phone', label: 'Phone', render: (r) => r.user?.phone || '—' },
    { key: 'licenseNo', label: 'License' },
    { key: 'bus', label: 'Bus', render: (r) => r.assignedBus?.regNo || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r) => (
      <ActionButtons onEdit={() => handleEdit(r)} onDelete={() => { setEditing(r); setConfirmOpen(true); }} />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your driver fleet</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      {error && <div className="bg-danger-50 text-danger-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="flex items-center gap-4">
        <div className="w-full max-w-xs">
          <SearchBar value={search} onChange={setSearch} placeholder="Search drivers..." />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No drivers found." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'} size="lg">
        <div className="space-y-4">

          {!editing && (
            <>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setLinkMode('create')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    linkMode === 'create' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <UserPlus className="w-4 h-4" /> Create New User
                </button>
                <button
                  onClick={() => setLinkMode('link')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    linkMode === 'link' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Link className="w-4 h-4" /> Link Existing User
                </button>
              </div>

              {linkMode === 'create' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Driver name" />
                    <FormInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="driver@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                    <FormInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 chars, 1 uppercase, 1 number" />
                  </div>
                </>
              ) : (
                <FormInput tag="select" label="Select Driver User" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                  <option value="">— Select a driver user —</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                  {availableUsers.length === 0 && <option disabled>No available driver users</option>}
                </FormInput>
              )}
            </>
          )}

          {editing && (
            <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-700">
              Editing driver: <strong>{editing.user?.name}</strong> ({editing.licenseNo})
            </div>
          )}

          <FormInput label="License Number" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="e.g. DL-2024-12345" />
          <FormInput label="Experience (years)" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} />
          <FormInput tag="select" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </FormInput>
          <FormInput tag="select" label="Assigned Bus" value={form.assignedBusId} onChange={(e) => setForm({ ...form, assignedBusId: e.target.value })}>
            <option value="">— No Bus —</option>
            {buses.map((b) => <option key={b.id} value={b.id}>{b.regNo} — {b.model}</option>)}
          </FormInput>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Driver"
        message={`Are you sure you want to delete driver ${editing?.user?.name || editing?.licenseNo}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
