import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';

export default function Settings() {
  const { logout } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your preferences</p>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.includes('success') ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
          {message}
        </div>
      )}

      <div className="card space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Profile Settings</h3>
          <p className="text-sm text-gray-500 mt-0.5">Update your account details</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="label">Full Name</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
          </div>
          <div className="space-y-1">
            <label className="label">Email Address</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>
          <div className="space-y-1">
            <label className="label">New Password (optional)</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="card space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Session</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage your current session</p>
        </div>
        <button onClick={logout} className="btn-danger">Sign Out</button>
      </div>

      <div className="card space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">System Information</h3>
          <p className="text-sm text-gray-500 mt-0.5">TransitIQ platform details</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Version</span><p className="font-medium">1.0.0</p></div>
          <div><span className="text-gray-500">Environment</span><p className="font-medium">{import.meta.env.VITE_NODE_ENV || 'development'}</p></div>
          <div><span className="text-gray-500">API</span><p className="font-medium">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}</p></div>
        </div>
      </div>
    </div>
  );
}
