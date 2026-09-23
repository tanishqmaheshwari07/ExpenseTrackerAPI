import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  onAddExpense?: () => void;
  title?: string;
  subtitle?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onAddExpense,
  title = 'Dashboard',
  subtitle,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === ('ADMIN' as unknown);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-paper/85 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Page title left */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-ink leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted leading-none mt-0.5">{subtitle}</p>}
      </div>

      {/* Right controls: Add Expense & User Avatar + Dropdown */}
      <div className="flex items-center gap-3">
        {onAddExpense && (
          <Button
            onClick={onAddExpense}
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Expense
          </Button>
        )}

        {/* User avatar (initials circle, accent-start bg) + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-border focus:outline-none transition-all"
            aria-label="User menu"
          >
            <div className="w-9 h-9 rounded-full bg-accent-start text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-paper">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-card shadow-card py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-bold text-ink truncate">{user?.name || 'My Account'}</p>
                <p className="text-[11px] text-muted truncate">{user?.email || ''}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-ink hover:bg-surface flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-muted" />
                  <span>Profile Settings</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-amber-600 hover:bg-surface flex items-center gap-2.5 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-danger hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-danger" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
