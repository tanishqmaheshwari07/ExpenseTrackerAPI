// ==========================================
// Authentication & User Types
// ==========================================

export type Role = 'ROLE_USER' | 'ROLE_ADMIN'; // TODO: confirm against backend DTO

export interface User {
  // TODO: confirm against backend DTO
  id: number;
  name: string;
  email: string;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRequest {
  // TODO: confirm against backend DTO
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginRequest {
  // TODO: confirm against backend DTO
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  // TODO: confirm against backend DTO
  refreshToken: string;
}

export interface AuthResponse {
  // TODO: confirm against backend DTO
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresInMs?: number;
  user?: User;
}

// ==========================================
// Category & Expense Types
// ==========================================

export type Category =
  | 'FOOD'
  | 'TRAVEL'
  | 'SHOPPING'
  | 'EDUCATION'
  | 'ENTERTAINMENT'
  | 'HEALTH'
  | 'BILLS'
  | 'OTHER'; // TODO: confirm against backend DTO

export interface Expense {
  // TODO: confirm against backend DTO
  id: number;
  amount: number;
  description: string;
  category: Category;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseRequest {
  // TODO: confirm against backend DTO
  amount: number;
  description: string;
  category: Category;
  date: string;
}

export interface ExpenseQueryParams {
  // TODO: confirm against backend DTO
  page?: number;
  size?: number;
  category?: Category | string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface ExpenseSummaryParams {
  // TODO: confirm against backend DTO
  startDate?: string;
  endDate?: string;
}

export interface ExpenseSummary {
  // TODO: confirm against backend DTO
  totalAmount: number;
  totalCount: number;
  startDate?: string;
  endDate?: string;
  categoryBreakdown?: Record<string, number>;
  monthlyBreakdown?: Record<string, number>;
}

// ==========================================
// Generic API Response Containers
// ==========================================

export interface ApiResponse<T = unknown> {
  // TODO: confirm against backend DTO
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PagedResponse<T> {
  // TODO: confirm against backend DTO
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}
