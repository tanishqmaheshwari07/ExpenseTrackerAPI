import apiClient from './client';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  User,
  AdminUser,
  UserRequest,
  Role,
} from '../../types';

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
   * POST /api/users/login (sets HttpOnly refresh cookie)
   */
  login: async (payload: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/users/login', payload);
    return res.data;
  },

  /**
   * Refresh JWT access token with HttpOnly refresh cookie
   * POST /api/users/refresh-token
   */
  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/users/refresh-token', {});
    return res.data;
  },

  /**
   * Logout current user and clear HttpOnly refresh cookie on server
   * POST /api/users/logout
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const res = await apiClient.post<ApiResponse<void>>('/users/logout', {});
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
   * Get all registered users with summary statistics (Admin only)
   * GET /api/users
   */
  getUsers: async (): Promise<ApiResponse<AdminUser[]>> => {
    const res = await apiClient.get<ApiResponse<AdminUser[]>>('/users');
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
   * Update user role (Admin only)
   * PATCH /api/users/{id}/role
   */
  updateUserRole: async (id: number, role: Role): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
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
