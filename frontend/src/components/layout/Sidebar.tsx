import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  UserCircle,
  ShieldAlert,
  WalletCards,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === ('ADMIN' as unknown);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: ShieldAlert }] : []),
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR (Visible on 768px / md and above)            */}
      {/* ============================================================ */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-border flex-col justify-between transition-transform duration-200 ease-in-out hidden md:flex'
        )}
      >
        <div>
          {/* Black logo top-left */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
            <div className="w-9 h-9 rounded-pill bg-ink text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <WalletCards className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-ink tracking-tight">
                Expense<span className="text-accent-end">Tracker</span>
              </h1>
              <span className="text-[10px] font-semibold text-faint uppercase tracking-wider block -mt-0.5">
                Financial Suite
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
              Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-ink text-white shadow-sm'
                        : 'text-muted hover:text-ink hover:bg-surface'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between p-2 rounded-card bg-surface border border-border">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-accent-start text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-ink truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-faint truncate">{user?.email || ''}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-white transition-colors shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM TAB BAR (Visible below 768px / md)             */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-all',
                  isActive
                    ? 'text-ink bg-surface font-bold scale-105'
                    : 'text-muted hover:text-ink'
                )
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
