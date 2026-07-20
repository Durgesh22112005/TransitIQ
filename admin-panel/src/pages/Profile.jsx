import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth.api';
import { Loader } from '../components/ui/Loader';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const info = profile || user;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account information</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
            {info?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{info?.name || 'Admin'}</h2>
            <p className="text-sm text-gray-500">{info?.email || ''}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{info?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{info?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{info?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                <span className="badge bg-primary-50 text-primary-700">{info?.role || 'ADMIN'}</span>
              </p>
            </div>
          </div>

          {info?.createdAt && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Member Since</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {new Date(info.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
