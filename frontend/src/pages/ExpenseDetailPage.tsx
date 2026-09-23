import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { Card, Button, Badge, Skeleton } from '../components/ui';
import { ExpenseModal } from '../components/ExpenseModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useExpenseById, useUpdateExpense, useDeleteExpense } from '../hooks/useExpenses';
import { formatCurrency, formatDate, CATEGORY_META } from '../utils/formatters';
import { useToast } from '../components/ui/Toast';
import { ExpenseRequest } from '../types';

export const ExpenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const expenseId = Number(id);

  const { data: expense, isLoading, isError } = useExpenseById(expenseId);
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUpdate = async (formData: ExpenseRequest) => {
    if (!expense) return;
    try {
      await updateMutation.mutateAsync({ id: expense.id, data: formData });
      showToast('success', 'Expense updated', `Updated ${formData.description}`);
      setIsEditModalOpen(false);
    } catch {
      showToast('error', 'Update failed', 'Could not update expense.');
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    try {
      await deleteMutation.mutateAsync(expense.id);
      showToast('info', 'Expense deleted', 'The expense record was removed.');
      navigate('/expenses');
    } catch {
      showToast('error', 'Delete failed', 'Could not delete expense.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-4">
        <Skeleton className="h-6 w-36" />
        <Card className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-6 w-28 rounded-pill" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
          <div className="pt-4 border-t border-border flex justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-ink">Expense Not Found</h2>
        <p className="text-sm text-muted">
          The requested transaction may have been deleted or does not exist.
        </p>
        <Button variant="primary" onClick={() => navigate('/expenses')}>
          Back to Expenses
        </Button>
      </div>
    );
  }

  const categoryMeta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-2">
      {/* Back Link */}
      <div>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all expenses</span>
        </Link>
      </div>

      {/* Single Centered Card */}
      <Card className="p-6 sm:p-8 bg-paper border-border shadow-card">
        {/* Top Header: Amount as large bold headline + Category Badge beside it */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint block">
              Expense Amount
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-0.5">
              {formatCurrency(expense.amount)}
            </h1>
          </div>

          <Badge variant="accent" size="md" className="text-xs px-3 py-1.5 shadow-sm">
            {categoryMeta.label}
          </Badge>
        </div>

        {/* Date and Description Below */}
        <div className="py-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-accent-end" />
              Transaction Date
            </span>
            <p className="text-sm font-medium text-ink">
              {formatDate(expense.date)}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-accent-end" />
              Description & Notes
            </span>
            <p className="text-sm text-ink bg-surface p-4 rounded-xl border border-border leading-relaxed">
              {expense.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Edit and Delete */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-4 h-4" />}
            size="sm"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
            size="sm"
          >
            Delete
          </Button>
        </div>

        {/* Metadata Footer inside the card, small faint gray text */}
        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-faint gap-1">
          <span>Created {expense.createdAt ? formatDate(expense.createdAt) : formatDate(expense.date)}</span>
          <span>Last updated {expense.updatedAt ? formatDate(expense.updatedAt) : 'Recently'}</span>
        </div>
      </Card>

      {/* Edit Modal */}
      <ExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={expense}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        title="Delete Expense"
        description="This expense will be removed from your records."
      />
    </div>
  );
};

export default ExpenseDetailPage;
