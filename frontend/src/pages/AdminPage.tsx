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
  Loader2,
  AlertCircle,
  RefreshCw,
  UserX,
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
import { Role, AdminUser } from '../types';
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from '../hooks/useAdmin';
import { getErrorMessage } from '../utils/errorHandling';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { showToast } = useToast();

  // Guard: Only render/routable if user.role === 'ADMIN' or 'ROLE_ADMIN' — redirect others to /dashboard
  const isAdmin =
    currentUser?.role === 'ROLE_ADMIN' ||
    currentUser?.role === ('ADMIN' as unknown);

  // Server state with React Query
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminUsers();

  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Edit Role Modal State
  const [editingRoleUser, setEditingRoleUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('ROLE_USER');

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Keep selectedUser in drawer in sync with updated query data
  const currentSelectedUser = useMemo(() => {
    if (!selectedUser) return null;
    return users.find((u) => u.id === selectedUser.id) || null;
  }, [selectedUser, users]);

  // Filter users by name or email
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [users, searchQuery]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenEditRole = (user: AdminUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRoleUser(user);
    setSelectedRole(user.role || 'ROLE_USER');
  };

  const handleSaveRole = async () => {
    if (!editingRoleUser) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: editingRoleUser.id,
        role: selectedRole,
      });
      showToast(
        'success',
        'Role updated',
        `Updated role for ${editingRoleUser.name} to ${selectedRole}`
      );
      setEditingRoleUser(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to update role. Please try again.');
      showToast('error', 'Update failed', msg);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUserMutation.mutateAsync(deletingUser.id);
      if (selectedUser && selectedUser.id === deletingUser.id) {
        setSelectedUser(null);
      }
      showToast('info', 'User deleted', `Removed ${deletingUser.name} from directory.`);
      setDeletingUser(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to delete user. Please try again.');
      showToast('error', 'Delete failed', msg);
    }
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

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
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
            Showing <strong className="text-ink">{filteredUsers.length}</strong> of{' '}
            <strong className="text-ink">{users.length}</strong> registered user(s)
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent-start animate-spin" />
          <p className="text-sm font-medium text-ink">Loading user directory...</p>
          <p className="text-xs text-muted">Fetching registered accounts and financial analytics from backend.</p>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Card className="p-8 border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-danger shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-danger">Failed to load user directory</h4>
              <p className="text-xs text-muted mt-0.5">
                {getErrorMessage(error, 'An error occurred while fetching user data. Ensure you are authorized as ADMIN.')}
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Try Again
          </Button>
        </Card>
      )}

      {/* Users Table */}
      {!isLoading && !isError && (
        <Card className="p-0 overflow-hidden">
          <CardHeader className="px-6 pt-5 pb-3 border-b border-border">
            <CardTitle className="text-base font-bold">User Directory</CardTitle>
            <CardDescription>
              Click any row or card to open the user's spending summary drawer.
            </CardDescription>
          </CardHeader>

          {/* Desktop / Tablet Table View (>= 640px) */}
          <div className="hidden sm:block">
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
                            {userItem.name ? userItem.name.charAt(0).toUpperCase() : 'U'}
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
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <UserX className="w-8 h-8 text-faint" />
                        <p className="font-medium text-ink">No users found</p>
                        <p className="text-muted">
                          {searchQuery
                            ? `No user records matched "${searchQuery}".`
                            : 'There are currently no registered users in the database.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Stacked Card List (< 640px) */}
          <div className="block sm:hidden divide-y divide-border">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  onClick={() => setSelectedUser(userItem)}
                  className="p-4 hover:bg-surface transition-colors active:bg-surface cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-accent-start text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {userItem.name ? userItem.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-ink truncate">{userItem.name}</h4>
                        <p className="text-xs text-muted truncate">{userItem.email}</p>
                      </div>
                    </div>
                    <Badge variant={userItem.role === 'ROLE_ADMIN' ? 'accent' : 'neutral'} size="sm">
                      {userItem.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-muted">
                    <span>Joined {userItem.createdAt ? formatDate(userItem.createdAt) : 'N/A'}</span>
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedUser(userItem)}
                        className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface"
                        title="View user details"
                        aria-label="View user details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleOpenEditRole(userItem, e)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent-end hover:bg-surface"
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
                        className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50"
                        title="Delete user"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 px-4 text-center text-muted text-xs space-y-2">
                <UserX className="w-8 h-8 text-faint mx-auto" />
                <p className="font-medium text-ink">No users found</p>
                <p className="text-muted">
                  {searchQuery
                    ? `No user records matched "${searchQuery}".`
                    : 'There are currently no registered users in the database.'}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* SIDE DRAWER (Opens when clicking a row)                       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {currentSelectedUser && (
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
                      {currentSelectedUser.name ? currentSelectedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">{currentSelectedUser.name}</h3>
                      <p className="text-xs text-muted">{currentSelectedUser.email}</p>
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
                        value={formatCurrency(currentSelectedUser.totalSpend ?? 0)}
                        icon={<DollarSign className="w-3.5 h-3.5 text-accent-start" />}
                      />

                      {/* StatCard: Transactions */}
                      <StatCard
                        label="Transactions"
                        value={currentSelectedUser.transactionsCount ?? 0}
                        icon={<Receipt className="w-3.5 h-3.5 text-accent-end" />}
                      />

                      {/* StatCard: Avg Ticket */}
                      <StatCard
                        label="Avg Ticket"
                        value={formatCurrency(currentSelectedUser.avgTicket ?? 0)}
                        icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                      />

                      {/* StatCard: Active Categories */}
                      <StatCard
                        label="Categories"
                        value={currentSelectedUser.activeCategories ?? 0}
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
                        <span className="font-mono font-bold text-ink">#{currentSelectedUser.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Access Role</span>
                        <Badge variant={currentSelectedUser.role === 'ROLE_ADMIN' ? 'accent' : 'neutral'}>
                          {currentSelectedUser.role || 'ROLE_USER'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Account Status</span>
                        <Badge variant={currentSelectedUser.isActive !== false ? 'success' : 'neutral'}>
                          {currentSelectedUser.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Registered On</span>
                        <span className="font-medium text-ink">
                          {currentSelectedUser.createdAt ? formatDate(currentSelectedUser.createdAt) : 'N/A'}
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
                  onClick={(e) => handleOpenEditRole(currentSelectedUser, e)}
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Change Role
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingUser(currentSelectedUser)}
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
        onClose={() => {
          if (!updateRoleMutation.isPending) {
            setEditingRoleUser(null);
          }
        }}
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
              disabled={updateRoleMutation.isPending}
              onClick={() => setEditingRoleUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={updateRoleMutation.isPending}
              onClick={handleSaveRole}
              leftIcon={
                updateRoleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )
              }
            >
              {updateRoleMutation.isPending ? 'Saving...' : 'Save Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* DELETE USER CONFIRMATION MODAL                               */}
      {/* ============================================================ */}
      <Modal
        isOpen={deletingUser !== null}
        onClose={() => {
          if (!deleteUserMutation.isPending) {
            setDeletingUser(null);
          }
        }}
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
              disabled={deleteUserMutation.isPending}
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteUserMutation.isPending}
              onClick={handleDeleteUser}
              leftIcon={
                deleteUserMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;
