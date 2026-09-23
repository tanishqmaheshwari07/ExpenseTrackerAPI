import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../services/api/expensesApi';
import { ExpenseQueryParams, ExpenseRequest, ExpenseSummaryParams } from '../types';

export const EXPENSES_QUERY_KEY = ['expenses'];
export const MY_EXPENSES_QUERY_KEY = ['my-expenses'];
export const EXPENSE_SUMMARY_KEY = ['expense-summary'];

export function useExpenses(params?: ExpenseQueryParams) {
  return useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, params],
    queryFn: async () => {
      const response = await expensesApi.getExpenses(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useExpenseById(id: number) {
  return useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await expensesApi.getExpenseById(id);
      return response.data;
    },
    enabled: Boolean(id && !isNaN(id)),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyExpenses() {
  return useQuery({
    queryKey: MY_EXPENSES_QUERY_KEY,
    queryFn: async () => {
      const response = await expensesApi.getMyExpenses();
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useExpenseSummary(params?: ExpenseSummaryParams) {
  return useQuery({
    queryKey: [...EXPENSE_SUMMARY_KEY, params],
    queryFn: async () => {
      const response = await expensesApi.getSummary(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExpenseRequest) => {
      const response = await expensesApi.createExpense(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ExpenseRequest }) => {
      const response = await expensesApi.updateExpense(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await expensesApi.deleteExpense(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY });
    },
  });
}
