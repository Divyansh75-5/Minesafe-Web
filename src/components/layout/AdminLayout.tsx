import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/workers', label: 'Workers', icon: '👷' },
  { to: '/admin/modules', label: 'Modules', icon: '📚' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/certificates', label: 'Certificates', icon: '🏅' },
];

export default function AdminLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 bg-primary-900 text-white fixed inset-y-0 left-0 transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">
            🦺
          </div>
          <div>
            <div className="font-bold text-sm">MineSafe 26041</div>
            <div className="text-xs text-primary-300">Admin Dashboard</div>
          </div>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-primary-100 hover:bg-white/10'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              {profile?.displayName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <div className="text-sm font-medium">{profile?.displayName ?? 'Admin'}</div>
              <div className="text-xs text-primary-300">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <span className="font-medium">MineSafe Admin</span>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}