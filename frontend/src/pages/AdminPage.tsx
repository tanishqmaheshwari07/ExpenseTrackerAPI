import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Search,
  Eye,
  Edit3,
  Trash2,
  X,
  DollarSign,
  Receipt,
  TrendingUp,
  Tag,
  Check,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatCard,
  Modal,
} from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { formatDate, formatCurrency } from '../utils/formatters';
import { User, Role } from '../types';

interface AdminUserItem extends User {
  status?: string;
  totalSpend?: number;
  transactionsCount?: number;
  avgTicket?: number;
  activeCategories?: number;
}

// TODO: backend endpoint needed - Mock initial user list until GET /api/users admin listing endpoint is exposed
const MOCK_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 1,
    name: 'Admin Master',
    email: 'admin@expensetracker.com',
    role: 'ROLE_ADMIN',
    createdAt: '2024-01-10T08:00:00Z',
    status: 'Active',
    totalSpend: 4250.0,
    transactionsCount: 38,
    avgTicket: 111.84,
    activeCategories: 6,
  },
  {
    id: 2,
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-03-15T10:30:00Z',
    status: 'Active',
    totalSpend: 1840.5,
    transactionsCount: 22,
    avgTicket: 83.65,
    activeCategories: 5,
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-05-20T14:15:00Z',
    status: 'Active',
    totalSpend: 2950.0,
    transactionsCount: 31,
    avgTicket: 95.16,
    activeCategories: 7,
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.k@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-07-04T09:00:00Z',
    status: 'Active',
    totalSpend: 620.0,
    transactionsCount: 8,
    avgTicket: 77.5,
    activeCategories: 3,
  },
  {
    id: 5,
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    role: 'ROLE_USER',
    createdAt: '2024-08-18T16:45:00Z',
    status: 'Inactive',
    totalSpend: 310.0,
    transactionsCount: 4,
    avgTicket: 77.5,
    activeCategories: 2,
  },
];

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { showToast } = useToast();

  // Guard: Only render/routable if user.role === 'ADMIN' or 'ROLE_ADMIN' — redirect others to /dashboard
  const isAdmin =
    currentUser?.role === 'ROLE_ADMIN' ||
    currentUser?.role === ('ADMIN' as unknown);

  const [users, setUsers] = useState<AdminUserItem[]>(MOCK_ADMIN_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  // Edit Role Modal State
  const [editingRoleUser, setEditingRoleUser] = useState<AdminUserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('ROLE_USER');

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Filter users by name or email
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [users, searchQuery]);

  const handleOpenEditRole = (user: AdminUserItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoleUser(user);
    setSelectedRole(user.role || 'ROLE_USER');
  };

  const handleSaveRole = () => {
    if (!editingRoleUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingRoleUser.id ? { ...u, role: selectedRole } : u))
    );
    if (selectedUser && selectedUser.id === editingRoleUser.id) {
      setSelectedUser((prev) => (prev ? { ...prev, role: selectedRole } : null));
    }
    showToast('success', 'Role updated', `Updated role for ${editingRoleUser.name} to ${selectedRole}`);
    setEditingRoleUser(null);
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    if (selectedUser && selectedUser.id === deletingUser.id) {
      setSelectedUser(null);
    }
    showToast('info', 'User deleted', `Removed ${deletingUser.name} from directory.`);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-card bg-ink text-white shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-pill bg-white/10 text-white shadow-sm">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
              <Badge variant="warning">System Admin</Badge>
            </div>
            <p className="text-xs text-faint mt-0.5">
              Manage registered users, inspect account summaries, and configure roles.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-faint" />}
            />
          </div>

          <div className="text-xs text-muted">
            Showing <strong className="text-ink">{filteredUsers.length}</strong> registered user(s)
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-6 pt-5 pb-3 border-b border-border">
          <CardTitle className="text-base font-bold">User Directory</CardTitle>
          <CardDescription>
            Click any row to open the user's spending summary drawer.
          </CardDescription>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userItem) => (
                <TableRow
                  key={userItem.id}
                  onClick={() => setSelectedUser(userItem)}
                  className="cursor-pointer hover:bg-surface/80 transition-colors"
                >
                  {/* Name + Avatar */}
                  <TableCell className="font-semibold text-ink">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-accent-start text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {userItem.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{userItem.name}</span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted text-xs">{userItem.email}</TableCell>

                  {/* Role Badge */}
                  <TableCell>
                    <Badge variant={userItem.role === 'ROLE_ADMIN' ? 'accent' : 'neutral'}>
                      {userItem.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>

                  {/* Created Date */}
                  <TableCell className="text-xs text-muted">
                    {userItem.createdAt ? formatDate(userItem.createdAt) : 'N/A'}
                  </TableCell>

                  {/* Actions (view, edit role, delete) */}
                  <TableCell className="text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedUser(userItem)}
                        className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
                        title="View user details"
                        aria-label="View user details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleOpenEditRole(userItem, e)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent-end hover:bg-surface transition-colors"
                        title="Edit user role"
                        aria-label="Edit user role"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingUser(userItem);
                        }}
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                        title="Delete user"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted text-xs">
                  No users found matching "{searchQuery}".
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ============================================================ */}
      {/* SIDE DRAWER (Opens when clicking a row)                       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />

            {/* Slide-out Drawer from Right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 w-full max-w-md bg-paper border-l border-border shadow-2xl h-full flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div>
                <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-paper z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent-start text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">{selectedUser.name}</h3>
                      <p className="text-xs text-muted">{selectedUser.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Summary & Reused StatCards from Dashboard */}
                <div className="p-6 space-y-6">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-faint block mb-3">
                      User Financial Overview
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {/* StatCard: Total Spend */}
                      <StatCard
                        label="Total Spend"
                        value={formatCurrency(selectedUser.totalSpend || 1840.5)}
                        icon={<DollarSign className="w-3.5 h-3.5 text-accent-start" />}
                      />

                      {/* StatCard: Transactions */}
                      <StatCard
                        label="Transactions"
                        value={selectedUser.transactionsCount || 22}
                        icon={<Receipt className="w-3.5 h-3.5 text-accent-end" />}
                      />

                      {/* StatCard: Avg Ticket */}
                      <StatCard
                        label="Avg Ticket"
                        value={formatCurrency(selectedUser.avgTicket || 83.65)}
                        icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                      />

                      {/* StatCard: Active Categories */}
                      <StatCard
                        label="Categories"
                        value={selectedUser.activeCategories || 5}
                        icon={<Tag className="w-3.5 h-3.5 text-purple-600" />}
                      />
                    </div>
                  </div>

                  {/* Account Metadata List */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-faint block">
                      Account Details
                    </span>

                    <div className="p-3 rounded-lg bg-surface border border-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">User ID</span>
                        <span className="font-mono font-bold text-ink">#{selectedUser.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Access Role</span>
                        <Badge variant={selectedUser.role === 'ROLE_ADMIN' ? 'accent' : 'neutral'}>
                          {selectedUser.role}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Registered On</span>
                        <span className="font-medium text-ink">
                          {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-border flex items-center justify-between gap-3 bg-surface">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => handleOpenEditRole(selectedUser, e)}
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Change Role
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingUser(selectedUser)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete User
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* EDIT ROLE MODAL                                              */}
      {/* ============================================================ */}
      <Modal
        isOpen={editingRoleUser !== null}
        onClose={() => setEditingRoleUser(null)}
        title="Change User Role"
        description={`Modify system permissions for ${editingRoleUser?.name}.`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <Select
            label="System Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            options={[
              { value: 'ROLE_USER', label: 'ROLE_USER (Standard Member)' },
              { value: 'ROLE_ADMIN', label: 'ROLE_ADMIN (Full Admin Access)' },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingRoleUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveRole}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* DELETE USER CONFIRMATION MODAL                               */}
      {/* ============================================================ */}
      <Modal
        isOpen={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        title="Delete User Account"
        description={`Are you sure you want to delete ${deletingUser?.name}?`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted leading-relaxed">
            This will permanently remove the user account and purge all associated expense entries.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;
