import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
} from '../components/ui';
import { Category, Expense, ExpenseRequest } from '../types';
import { formatCurrency, formatDate, CATEGORY_META } from '../utils/formatters';
import { ExpenseModal } from '../components/ExpenseModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useToast } from '../components/ui/Toast';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '../hooks/useExpenses';

export const ExpensesPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Pagination & Sorting States
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  // React Query Hooks
  const queryParams = useMemo(() => ({
    page: currentPage,
    size: pageSize,
    category: selectedCategory !== 'ALL' ? (selectedCategory as Category) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy: sortField,
    sortDirection: sortDirection,
  }), [currentPage, pageSize, selectedCategory, startDate, endDate, sortField, sortDirection]);

  const { data: pagedData, isLoading } = useExpenses(queryParams);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  // Filter client-side search query on description if provided
  const expenses = useMemo(() => {
    const rawList = pagedData?.content || [];
    if (!searchQuery.trim()) return rawList;
    return rawList.filter((exp) =>
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [pagedData, searchQuery]);

  const totalPages = pagedData?.totalPages || 1;
  const totalElements = pagedData?.totalElements || expenses.length;

  const hasActiveFilters =
    selectedCategory !== 'ALL' || startDate !== '' || endDate !== '' || searchQuery !== '';

  const handleClearFilters = () => {
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCurrentPage(0);
    setSearchParams({});
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
  };

  // Create / Edit Action
  const handleSaveExpense = async (formData: ExpenseRequest) => {
    try {
      if (editingExpense) {
        await updateMutation.mutateAsync({ id: editingExpense.id, data: formData });
        showToast('success', 'Expense updated', `Updated ${formData.description}`);
      } else {
        await createMutation.mutateAsync(formData);
        showToast('success', 'Expense created', `Added ${formData.description} (₹${formData.amount})`);
      }
      setIsModalOpen(false);
      setEditingExpense(null);
    } catch {
      showToast('error', 'Action failed', 'Unable to save expense. Please try again.');
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingExpenseId) return;
    try {
      await deleteMutation.mutateAsync(deletingExpenseId);
      showToast('info', 'Expense deleted', 'The expense record was removed.');
      setDeletingExpenseId(null);
    } catch {
      showToast('error', 'Delete failed', 'Could not delete the expense record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and "Add Expense" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Expenses Ledger</h1>
          <p className="text-sm text-muted mt-0.5">
            Manage, filter, and track all your logged expenditure records.
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="px-5 shadow-sm w-full sm:w-auto"
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filter Bar: Horizontal Card Strip above Table */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* 1. Category Select */}
          <div>
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(0);
              }}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'FOOD', label: 'Food & Dining' },
                { value: 'TRAVEL', label: 'Travel & Transport' },
                { value: 'SHOPPING', label: 'Shopping' },
                { value: 'EDUCATION', label: 'Education' },
                { value: 'ENTERTAINMENT', label: 'Entertainment' },
                { value: 'HEALTH', label: 'Health & Wellness' },
                { value: 'BILLS', label: 'Bills & Utilities' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </div>

          {/* 2. Start Date */}
          <div>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>

          {/* 3. End Date */}
          <div>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>

          {/* 4. Search Input */}
          <div>
            <Input
              label="Search Description"
              placeholder="e.g. Grocery, Flight"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-faint" />}
            />
          </div>

          {/* 5. Clear Filters Ghost Button */}
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="w-full text-xs font-semibold h-10"
            >
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Expenses Container */}
      <Card className="p-0 overflow-hidden">
        {/* ============================================================ */}
        {/* DESKTOP/TABLET TABLE VIEW (Visible on sm / 640px and above)  */}
        {/* ============================================================ */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Sortable Date Column */}
                <TableHead
                  onClick={() => toggleSort('date')}
                  className="cursor-pointer select-none hover:text-ink transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    {sortField === 'date' ? (
                      sortDirection === 'ASC' ? (
                        <ChevronUp className="w-3.5 h-3.5 text-accent-end" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-accent-end" />
                      )
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-faint opacity-40" />
                    )}
                  </div>
                </TableHead>

                {/* Category Column */}
                <TableHead>Category</TableHead>

                {/* Description Column */}
                <TableHead>Description</TableHead>

                {/* Sortable Amount Column */}
                <TableHead
                  onClick={() => toggleSort('amount')}
                  className="text-right cursor-pointer select-none hover:text-ink transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    {sortField === 'amount' ? (
                      sortDirection === 'ASC' ? (
                        <ChevronUp className="w-3.5 h-3.5 text-accent-end" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-accent-end" />
                      )
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-faint opacity-40" />
                    )}
                  </div>
                </TableHead>

                {/* Actions Column */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading State: Skeleton rows */}
              {isLoading ? (
                [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded-pill" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-6 w-14 ml-auto rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : expenses.length > 0 ? (
                /* Populated Data Rows */
                expenses.map((expense) => {
                  const meta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;
                  return (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-surface transition-colors"
                    >
                      {/* Date */}
                      <TableCell className="text-xs text-muted font-medium whitespace-nowrap">
                        {formatDate(expense.date)}
                      </TableCell>

                      {/* Category as Badge */}
                      <TableCell>
                        <Badge variant="accent" size="sm">
                          {meta.label}
                        </Badge>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="font-semibold text-ink">
                        <Link
                          to={`/expenses/${expense.id}`}
                          className="hover:text-accent-end hover:underline transition-colors"
                        >
                          {expense.description}
                        </Link>
                      </TableCell>

                      {/* Amount (Right-aligned, Bold) */}
                      <TableCell className="text-right font-bold text-ink whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </TableCell>

                      {/* Actions: Edit Pencil & Delete Trash */}
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingExpense(expense);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
                            title="Edit Expense"
                            aria-label="Edit Expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingExpenseId(expense.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                            title="Delete Expense"
                            aria-label="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                /* Empty State: Post-filter or zero entries */
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-muted">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-ink">
                        No expenses match your filters
                      </h4>
                      <p className="text-xs text-muted">
                        Try adjusting your date range, search query, or category selection.
                      </p>
                      {hasActiveFilters && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-xs font-semibold text-accent-end hover:underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ============================================================ */}
        {/* MOBILE STACKED CARDS VIEW (Visible below 640px / sm)         */}
        {/* ============================================================ */}
        <div className="block sm:hidden divide-y divide-border">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-pill" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-40" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))
          ) : expenses.length > 0 ? (
            expenses.map((expense) => {
              const meta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;
              return (
                <div key={expense.id} className="p-4 space-y-3 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">
                      {meta.label}
                    </Badge>
                    <span className="text-base font-extrabold text-ink">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>

                  <Link
                    to={`/expenses/${expense.id}`}
                    className="block font-semibold text-sm text-ink hover:text-accent-end transition-colors"
                  >
                    {expense.description}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted">
                    <span>{formatDate(expense.date)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-muted hover:text-ink"
                        aria-label="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingExpenseId(expense.id)}
                        className="p-1 rounded text-muted hover:text-danger"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mx-auto text-muted">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-ink">No expenses match your filters</h4>
              <p className="text-xs text-muted">
                Try adjusting your date range, search query, or category selection.
              </p>
              {hasActiveFilters && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-accent-end hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls at Bottom */}
        <div className="px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-paper">
          {/* Left: Total Records Info & Rows per page */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 text-xs text-muted">
            <span>
              Showing {expenses.length} of {totalElements}
            </span>

            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="h-8 px-2 bg-paper border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent-end"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 0 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="h-8 px-2.5"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 px-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageIndex = i;
                const isCurrent = currentPage === pageIndex;
                return (
                  <button
                    key={pageIndex}
                    onClick={() => setCurrentPage(pageIndex)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-ink text-white shadow-sm'
                        : 'text-muted hover:text-ink hover:bg-surface'
                    }`}
                  >
                    {pageIndex + 1}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-xs text-muted px-1">...</span>}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages - 1 || isLoading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-2.5"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingExpenseId !== null}
        onClose={() => setDeletingExpenseId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        title="Delete Expense"
        description="This expense will be removed from your records."
      />
    </div>
  );
};

export default ExpensesPage;
