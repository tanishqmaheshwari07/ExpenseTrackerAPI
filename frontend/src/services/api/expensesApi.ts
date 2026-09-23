import apiClient from './client';
import {
  ApiResponse,
  Expense,
  ExpenseQueryParams,
  ExpenseRequest,
  ExpenseSummary,
  ExpenseSummaryParams,
  PagedResponse,
} from '../../types';

export const expensesApi = {
  /**
   * Get paginated expenses with optional category & date-range filters
   * GET /api/expenses
   */
  getExpenses: async (
    params?: ExpenseQueryParams
  ): Promise<ApiResponse<PagedResponse<Expense>>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Expense>>>('/expenses', {
      params,
    });
    return res.data;
  },

  /**
   * Get specific expense record by ID
   * GET /api/expenses/{id}
   */
  getExpenseById: async (id: number): Promise<ApiResponse<Expense>> => {
    const res = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return res.data;
  },

  /**
   * Create a new expense record
   * POST /api/expenses
   */
  createExpense: async (payload: ExpenseRequest): Promise<ApiResponse<Expense>> => {
    const res = await apiClient.post<ApiResponse<Expense>>('/expenses', payload);
    return res.data;
  },

  /**
   * Update an existing expense record
   * PUT /api/expenses/{id}
   */
  updateExpense: async (
    id: number,
    payload: ExpenseRequest
  ): Promise<ApiResponse<Expense>> => {
    const res = await apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, payload);
    return res.data;
  },

  /**
   * Delete an expense record
   * DELETE /api/expenses/{id}
   */
  deleteExpense: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/expenses/${id}`);
    return res.data;
  },

  /**
   * Get all expenses for current user without pagination
   * GET /api/expenses/my-expenses
   */
  getMyExpenses: async (): Promise<ApiResponse<Expense[]>> => {
    const res = await apiClient.get<ApiResponse<Expense[]>>('/expenses/my-expenses');
    return res.data;
  },

  /**
   * Get financial analytics summary (total expenditure, category & monthly breakdown)
   * GET /api/expenses/summary
   */
  getSummary: async (
    params?: ExpenseSummaryParams
  ): Promise<ApiResponse<ExpenseSummary>> => {
    const res = await apiClient.get<ApiResponse<ExpenseSummary>>('/expenses/summary', {
      params,
    });
    return res.data;
  },
};

export default expensesApi;
