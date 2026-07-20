import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bus, Route, MapPin, CalendarCheck,
  User, Settings, LogOut, ChevronLeft, ChevronRight, BusFront,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/buses', icon: Bus, label: 'Buses' },
  { to: '/routes', icon: Route, label: 'Routes' },
  { to: '/stops', icon: MapPin, label: 'Stops' },
  { to: '/trips', icon: CalendarCheck, label: 'Trips' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col ${
      collapsed ? 'w-16' : 'w-60'
    }`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <BusFront className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-gray-900">TransitIQ</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-2 space-y-1">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
