import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  onAddExpense?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ onAddExpense }) => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path.startsWith('/expenses/')) {
      return { title: 'Expense Detail', subtitle: 'View and manage single transaction' };
    }
    switch (path) {
      case '/dashboard':
      case '/':
        return { title: 'Dashboard', subtitle: 'Real-time overview of your finances' };
      case '/expenses':
        return { title: 'Expenses', subtitle: 'View, filter, and manage your records' };
      case '/analytics':
        return { title: 'Analytics', subtitle: 'Category breakdown and spending trends' };
      case '/profile':
        return { title: 'Profile & Settings', subtitle: 'Manage your user account & security' };
      case '/admin':
        return { title: 'Admin Console', subtitle: 'System-wide metrics and user directories' };
      default:
        return { title: 'Expense Tracker', subtitle: undefined };
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-paper flex text-ink">
      {/* Sidebar: Desktop 768px+, Bottom Tab bar < 768px */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-20 md:pb-0 bg-paper">
        <TopBar
          title={title}
          subtitle={subtitle}
          onAddExpense={onAddExpense}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto bg-paper">
          {/* Framer Motion page-transition fades between routes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
