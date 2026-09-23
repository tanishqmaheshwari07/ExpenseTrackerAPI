import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { authApi } from '../services/api/authApi';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import { LoginRequest, ApiResponse } from '../types';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await authApi.login(credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        login(data);
        showToast('success', 'Logged in successfully', `Welcome back${data.user?.name ? `, ${data.user.name}` : ''}!`);
        
        // Redirect to originating route or /dashboard
        const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }
    },
    onError: (error: AxiosError<ApiResponse>) => {
      if (error.response?.status === 401) {
        setErrorMessage('Invalid email or password.');
      } else {
        const backendMessage = error.response?.data?.message || 'Login failed. Please try again.';
        setErrorMessage(backendMessage);
      }
    },
  });

  const onSubmit = (formData: LoginFormData) => {
    setErrorMessage(null);
    loginMutation.mutate(formData);
  };

  const handleDemoFill = () => {
    setValue('email', 'alex.morgan@example.com');
    setValue('password', 'Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Centered white Card */}
        <Card className="bg-white border-border shadow-card p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in</h1>
            <p className="text-sm text-muted mt-1">Access your expense tracker account</p>
          </div>

          {/* Red banner on 401 / error */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-danger/20 flex items-center gap-2.5 text-danger text-sm font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                error={errors.email?.message}
                disabled={loginMutation.isPending}
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
                disabled={loginMutation.isPending}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-muted hover:text-ink focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            {/* Primary Black Pill Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-sm font-semibold"
                isLoading={loginMutation.isPending}
              >
                Sign In
              </Button>
            </div>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="mt-4 pt-4 border-t border-border text-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-muted hover:text-ink transition-colors underline"
            >
              Autofill test credentials
            </button>
          </div>

          {/* Link Below in accent-end */}
          <div className="mt-6 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-end font-semibold hover:underline">
              Register
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
