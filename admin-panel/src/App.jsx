import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Buses from './pages/Buses';
import RoutesPage from './pages/Routes';
import Stops from './pages/Stops';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { Loader } from './components/ui/Loader';

function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`hidden lg:block ${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 shrink-0`}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader message="Loading..." />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="buses" element={<Buses />} />
                <Route path="routes" element={<RoutesPage />} />
                <Route path="stops" element={<Stops />} />
                <Route path="trips" element={<Trips />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
