import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { DatePicker } from './ui/DatePicker';
import { Button } from './ui/Button';
import { Category, Expense, ExpenseRequest } from '../types';

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than ₹0.00'),
  category: z.enum(
    [
      'FOOD',
      'TRAVEL',
      'SHOPPING',
      'EDUCATION',
      'ENTERTAINMENT',
      'HEALTH',
      'BILLS',
      'OTHER',
    ],
    { required_error: 'Please select a category' }
  ),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(255, 'Description is too long').optional().or(z.literal('')),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseRequest) => Promise<void> | void;
  initialData?: Expense | null;
  isLoading?: boolean;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'FOOD', label: 'Food & Dining' },
  { value: 'TRAVEL', label: 'Travel & Transport' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'HEALTH', label: 'Health & Wellness' },
  { value: 'BILLS', label: 'Bills & Utilities' },
  { value: 'OTHER', label: 'Other' },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '' as unknown as number,
      category: 'FOOD',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        amount: initialData.amount,
        category: initialData.category,
        date: initialData.date || new Date().toISOString().split('T')[0],
        description: initialData.description || '',
      });
    } else {
      reset({
        amount: '' as unknown as number,
        category: 'FOOD',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit({
      amount: Number(data.amount),
      category: data.category,
      date: data.date,
      description: data.description || 'Expense',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Expense' : 'Add Expense'}
      description={
        isEditing
          ? 'Update the details for this transaction.'
          : 'Track a new expense by filling in the details below.'
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
        {/* Amount with ₹ Prefix Icon */}
        <Input
          label="Amount (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          leftIcon={<span className="text-ink font-bold text-sm">₹</span>}
          {...register('amount')}
          error={errors.amount?.message}
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Select */}
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            {...register('category')}
            error={errors.category?.message}
          />

          {/* Date Picker */}
          <DatePicker
            label="Date"
            {...register('date')}
            error={errors.date?.message}
          />
        </div>

        {/* Description Textarea */}
        <div className="w-full">
          <label
            htmlFor="expense-description"
            className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5"
          >
            Description (Optional)
          </label>
          <textarea
            id="expense-description"
            rows={3}
            placeholder="Add note or merchant name (e.g. Starbucks, Uber flight)"
            className="w-full px-3.5 py-2.5 bg-paper text-sm text-ink border border-border rounded-lg placeholder:text-faint transition-all duration-150 focus:outline-none focus:border-accent-end focus:ring-2 focus:ring-accent-end/20 resize-none"
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="mt-1 text-xs text-danger font-medium">{errors.description.message}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
