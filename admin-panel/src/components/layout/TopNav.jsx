import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell } from 'lucide-react';

export default function TopNav({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <button onClick={onMenuToggle} className="btn-ghost btn-sm p-2 lg:hidden">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button className="btn-ghost btn-sm p-2 relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 btn-ghost btn-sm px-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-elevated border border-gray-200 py-1 z-50">
              <button onClick={() => { setOpen(false); window.location.href = '/profile'; }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Profile
              </button>
              <button onClick={() => { setOpen(false); window.location.href = '/settings'; }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button onClick={() => { setOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-danger-500 hover:bg-gray-50">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
