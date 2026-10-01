import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../services/api/expensesApi';
import {
  ApiResponse,
  Expense,
  ExpenseQueryParams,
  ExpenseRequest,
  ExpenseSummary,
  ExpenseSummaryParams,
  PagedResponse,
} from '../types';

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

interface DeleteExpenseContext {
  previousPagedQueries: [readonly unknown[], PagedResponse<Expense> | undefined][];
  previousMyExpenses: Expense[] | undefined;
  previousSummaryQueries: [readonly unknown[], ExpenseSummary | undefined][];
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, unknown, number, DeleteExpenseContext>({
    mutationFn: async (id: number) => {
      return await expensesApi.deleteExpense(id);
    },
    onMutate: async (deletedId: number) => {
      // 1. Cancel ongoing queries so they don't overwrite optimistic cache updates
      await queryClient.cancelQueries({ queryKey: EXPENSES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: MY_EXPENSES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: EXPENSE_SUMMARY_KEY });

      // 2. Snapshot current state for rollback
      const previousPagedQueries = queryClient.getQueriesData<PagedResponse<Expense>>({
        queryKey: EXPENSES_QUERY_KEY,
      });
      const previousMyExpenses = queryClient.getQueryData<Expense[]>(MY_EXPENSES_QUERY_KEY);
      const previousSummaryQueries = queryClient.getQueriesData<ExpenseSummary>({
        queryKey: EXPENSE_SUMMARY_KEY,
      });

      // Find the expense metadata to adjust summary counters
      let targetExpense: Expense | undefined;
      if (previousMyExpenses) {
        targetExpense = previousMyExpenses.find((e) => e.id === deletedId);
      }
      if (!targetExpense && previousPagedQueries) {
        for (const [, paged] of previousPagedQueries) {
          const found = paged?.content?.find((e) => e.id === deletedId);
          if (found) {
            targetExpense = found;
            break;
          }
        }
      }

      // 3. Optimistically remove from MY_EXPENSES_QUERY_KEY
      queryClient.setQueryData<Expense[]>(MY_EXPENSES_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((e) => e.id !== deletedId);
      });

      // 4. Optimistically remove from all paginated queries
      queryClient.setQueriesData<PagedResponse<Expense>>(
        { queryKey: EXPENSES_QUERY_KEY },
        (old) => {
          if (!old || !Array.isArray(old.content)) return old;
          const hadItem = old.content.some((e) => e.id === deletedId);
          if (!hadItem) return old;

          const updatedContent = old.content.filter((e) => e.id !== deletedId);
          const updatedTotalElements = Math.max(0, (old.totalElements ?? old.content.length) - 1);
          const pageSize = old.pageSize || 10;
          const updatedTotalPages = Math.max(1, Math.ceil(updatedTotalElements / pageSize));

          return {
            ...old,
            content: updatedContent,
            totalElements: updatedTotalElements,
            totalPages: updatedTotalPages,
          };
        }
      );

      // 5. Optimistically update summary metrics
      if (targetExpense) {
        const expenseAmount = Number(targetExpense.amount) || 0;
        const expenseCategory = targetExpense.category;

        queryClient.setQueriesData<ExpenseSummary>(
          { queryKey: EXPENSE_SUMMARY_KEY },
          (old) => {
            if (!old) return old;
            const newTotalCount = Math.max(0, (old.totalCount || 0) - 1);
            const newTotalAmount = Math.max(0, (Number(old.totalAmount) || 0) - expenseAmount);

            const newCategoryBreakdown = { ...(old.categoryBreakdown || {}) };
            if (expenseCategory && newCategoryBreakdown[expenseCategory]) {
              newCategoryBreakdown[expenseCategory] = Math.max(
                0,
                Number(newCategoryBreakdown[expenseCategory]) - expenseAmount
              );
            }

            return {
              ...old,
              totalCount: newTotalCount,
              totalAmount: newTotalAmount,
              categoryBreakdown: newCategoryBreakdown,
            };
          }
        );
      }

      // Return context with rollback snapshots
      return {
        previousPagedQueries,
        previousMyExpenses,
        previousSummaryQueries,
      };
    },
    onError: (_error, _deletedId, context) => {
      // Roll back all cached queries on error
      if (context?.previousPagedQueries) {
        context.previousPagedQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousMyExpenses) {
        queryClient.setQueryData(MY_EXPENSES_QUERY_KEY, context.previousMyExpenses);
      }
      if (context?.previousSummaryQueries) {
        context.previousSummaryQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      // Refetch queries after mutation or error to sync server state
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSE_SUMMARY_KEY });
    },
  });
}

