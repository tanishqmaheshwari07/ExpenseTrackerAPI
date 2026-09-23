import apiClient from './client';
import {
  Expense,
  ExpenseRequest,
  ExpenseSummary,
  PagedResponse,
  Category,
  ApiResponse,
} from '../../types';

export interface ExpenseQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  category?: Category;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export const expenseService = {
  getExpenses: async (params?: ExpenseQueryParams): Promise<PagedResponse<Expense>> => {
    const res = await apiClient.get<PagedResponse<Expense>>('/expenses', { params });
    return res.data;
  },

  getExpenseById: async (id: number): Promise<Expense> => {
    const res = await apiClient.get<Expense>(`/expenses/${id}`);
    return res.data;
  },

  createExpense: async (data: ExpenseRequest): Promise<Expense> => {
    const res = await apiClient.post<Expense>('/expenses', data);
    return res.data;
  },

  updateExpense: async (id: number, data: ExpenseRequest): Promise<Expense> => {
    const res = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return res.data;
  },

  deleteExpense: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/expenses/${id}`);
    return res.data;
  },

  getSummary: async (startDate?: string, endDate?: string): Promise<ExpenseSummary> => {
    const res = await apiClient.get<ExpenseSummary>('/expenses/summary', {
      params: { startDate, endDate },
    });
    return res.data;
  },
};
