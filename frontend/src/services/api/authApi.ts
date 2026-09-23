import apiClient from './client';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  User,
  UserRequest,
  RefreshTokenRequest,
} from '../../types';
import { useAuthStore } from '../../store/authStore';

export const authApi = {
  /**
   * Register a new user account
   * POST /api/users/register (or /api/users)
   */
  register: async (payload: UserRequest): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<User>>('/users/register', payload);
    return res.data;
  },

  /**
   * Authenticate user credentials and retrieve JWT tokens
   * POST /api/users/login
   */
  login: async (payload: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/users/login', payload);
    return res.data;
  },

  /**
   * Refresh JWT access token with stored refresh token
   * POST /api/users/refresh-token
   */
  refreshToken: async (payload?: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> => {
    const token = payload?.refreshToken || useAuthStore.getState().refreshToken || '';
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/users/refresh-token', {
      refreshToken: token,
    });
    return res.data;
  },

  /**
   * Get current authenticated user profile
   * GET /api/users/me
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data;
  },

  /**
   * Update user details (name, email, or password)
   * PUT /api/users/{id}
   */
  updateUser: async (id: number, payload: UserRequest): Promise<ApiResponse<User>> => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, payload);
    return res.data;
  },

  /**
   * Delete user account by ID
   * DELETE /api/users/{id}
   */
  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return res.data;
  },
};

export default authApi;
