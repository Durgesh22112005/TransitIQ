import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BusFront, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <BusFront className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TransitIQ</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500">Sign in to manage your fleet</p>
          </div>

          {error && (
            <div className="bg-danger-50 text-danger-700 text-sm rounded-xl px-4 py-3 border border-danger-500/20">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@transitiq.com"
              className="input"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-gray-400 pt-2">
            TransitIQ v1.0.0 &mdash; Admin Panel
          </p>
        </form>
      </div>
    </div>
  );
}
