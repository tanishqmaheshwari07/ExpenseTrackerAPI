import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Calendar,
  KeyRound,
  AlertTriangle,
  Lock,
  Save,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Badge,
  Modal,
  Skeleton,
} from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api/authApi';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../utils/formatters';

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: storedUser, setUser, logout } = useAuthStore();
  const { showToast } = useToast();

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmEmailInput, setConfirmEmailInput] = useState('');

  // Fetch current user from GET /api/users/me
  const { data: meData, isLoading: isMeLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const currentUser = meData || storedUser;

  // React Hook Form for Profile Info
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: infoErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    },
  });

  // Synchronize form values when user data is available
  useEffect(() => {
    if (currentUser) {
      resetInfo({
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
      setUser(currentUser);
    }
  }, [currentUser, resetInfo, setUser]);

  // React Hook Form for Password Change
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update Profile Mutation (PUT /api/users/{id})
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: ProfileFormData) => {
      if (!currentUser?.id) throw new Error('User ID not found');
      const response = await authApi.updateUser(currentUser.id, {
        name: formData.name,
        email: formData.email,
      });
      return response.data;
    },
    onSuccess: (updated) => {
      if (updated) {
        setUser(updated);
      }
      showToast('success', 'Profile updated', 'Your account details have been saved.');
      setIsEditingInfo(false);
    },
    onError: () => {
      showToast('error', 'Update failed', 'Could not update your profile. Please try again.');
    },
  });

  // Update Password Mutation (PUT /api/users/{id})
  const updatePasswordMutation = useMutation({
    mutationFn: async (formData: PasswordFormData) => {
      if (!currentUser?.id) throw new Error('User ID not found');
      const response = await authApi.updateUser(currentUser.id, {
        password: formData.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      showToast('success', 'Password updated', 'Your password has been changed successfully.');
      resetPassword();
    },
    onError: () => {
      showToast('error', 'Password update failed', 'Could not update password. Please try again.');
    },
  });

  // Delete Account Mutation (DELETE /api/users/{id})
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error('User ID not found');
      await authApi.deleteUser(currentUser.id);
    },
    onSuccess: () => {
      showToast('info', 'Account deleted', 'Your account and data have been permanently removed.');
      logout();
      navigate('/');
    },
    onError: () => {
      showToast('error', 'Deletion failed', 'Could not delete account. Please try again.');
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  const handleDeleteAccountConfirm = () => {
    if (confirmEmailInput.trim() !== currentUser?.email?.trim()) return;
    deleteAccountMutation.mutate();
  };

  if (isMeLoading && !currentUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-2">
        <Skeleton className="h-44 w-full rounded-card" />
        <Skeleton className="h-64 w-full rounded-card" />
        <Skeleton className="h-44 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2">
      {/* ============================================================ */}
      {/* 1. USER INFO CARD                                            */}
      {/* ============================================================ */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Initials Circle (accent-start bg) */}
            <div className="w-20 h-20 rounded-full bg-accent-start text-white flex items-center justify-center font-extrabold text-3xl shadow-sm shrink-0 ring-4 ring-blue-50">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  {currentUser?.name || 'User Profile'}
                </h1>
                <Badge variant={currentUser?.role === 'ROLE_ADMIN' ? 'accent' : 'neutral'}>
                  {currentUser?.role === 'ROLE_ADMIN' ? 'Admin' : 'Personal Member'}
                </Badge>
              </div>

              <p className="text-sm text-muted">{currentUser?.email}</p>

              {/* Member Since Date */}
              <div className="flex items-center gap-1.5 text-xs text-faint pt-1">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                <span>
                  Member since{' '}
                  {currentUser?.createdAt
                    ? formatDate(currentUser.createdAt)
                    : 'October 2024'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Button
              variant={isEditingInfo ? 'secondary' : 'primary'}
              onClick={() => {
                if (isEditingInfo) {
                  resetInfo();
                }
                setIsEditingInfo((prev) => !prev);
              }}
              size="sm"
            >
              {isEditingInfo ? 'Cancel' : 'Edit Info'}
            </Button>
          </div>
        </div>

        {/* 2. Editable form below (name, email) with Save/Cancel */}
        {isEditingInfo && (
          <form
            onSubmit={handleSubmitInfo(onProfileSubmit)}
            className="mt-6 pt-6 border-t border-border space-y-4 animate-fadeIn"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                leftIcon={<User className="w-4 h-4" />}
                {...registerInfo('name')}
                error={infoErrors.name?.message}
                disabled={updateProfileMutation.isPending}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                {...registerInfo('email')}
                error={infoErrors.email?.message}
                disabled={updateProfileMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetInfo();
                  setIsEditingInfo(false);
                }}
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* ============================================================ */}
      {/* 3. CHANGE PASSWORD SECTION                                   */}
      {/* ============================================================ */}
      <Card className="p-6 sm:p-8">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <KeyRound className="w-5 h-5 text-accent-end" />
            Security & Password
          </CardTitle>
          <CardDescription>
            Update your authentication password to keep your account secure.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={handleSubmitPassword(onPasswordSubmit)}
          className="mt-4 space-y-4 max-w-xl"
        >
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            {...registerPassword('currentPassword')}
            error={passwordErrors.currentPassword?.message}
            disabled={updatePasswordMutation.isPending}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
              disabled={updatePasswordMutation.isPending}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              leftIcon={<Lock className="w-4 h-4" />}
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
              disabled={updatePasswordMutation.isPending}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={updatePasswordMutation.isPending}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* ============================================================ */}
      {/* 4. DANGER ZONE SECTION                                       */}
      {/* ============================================================ */}
      <Card className="p-6 sm:p-8 border-red-200 bg-red-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-danger flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-xs text-muted max-w-lg">
              Once you delete your account, there is no going back. All your logged expenses,
              financial charts, and categories will be permanently removed.
            </p>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmEmailInput('');
                setIsDeleteModalOpen(true);
              }}
              className="border-danger text-danger hover:bg-red-50 text-xs font-semibold px-4 h-10 shrink-0"
            >
              Delete account
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account Confirmation"
        description="This action cannot be undone. Please confirm your identity."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-danger font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              All your expense records and financial logs will be wiped permanently.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              To verify, type your email <strong className="text-ink font-mono">{currentUser?.email}</strong> below:
            </label>
            <Input
              placeholder={currentUser?.email || 'your-email@example.com'}
              value={confirmEmailInput}
              onChange={(e) => setConfirmEmailInput(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteAccountConfirm}
              disabled={confirmEmailInput.trim() !== currentUser?.email?.trim()}
              isLoading={deleteAccountMutation.isPending}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
