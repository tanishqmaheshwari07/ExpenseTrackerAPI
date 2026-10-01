import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  Activity,
  Receipt,
  Plus,
  ArrowRight,
  TrendingUp,
  Tag,
  RefreshCw,
  AlertCircle,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Skeleton,
  Input,
} from '../components/ui';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { formatCurrency, formatDate, CATEGORY_META } from '../utils/formatters';
import { useExpenseSummary, useMyExpenses, useCreateExpense } from '../hooks/useExpenses';
import { ExpenseModal } from '../components/ExpenseModal';
import { useToast } from '../components/ui/Toast';
import { ExpenseRequest, ExpenseSummaryParams } from '../types';

type DatePreset = 'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'LAST_3_MONTHS' | 'THIS_YEAR' | 'CUSTOM';

const formatToYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Date Filter State
  const [datePreset, setDatePreset] = useState<DatePreset>('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate effective start and end dates based on preset
  const dateRange = useMemo<{ startDate?: string; endDate?: string }>(() => {
    const today = new Date();
    const todayStr = formatToYMD(today);

    switch (datePreset) {
      case 'THIS_MONTH': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: formatToYMD(startOfMonth),
          endDate: todayStr,
        };
      }
      case 'LAST_30_DAYS': {
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          startDate: formatToYMD(thirtyDaysAgo),
          endDate: todayStr,
        };
      }
      case 'LAST_3_MONTHS': {
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        return {
          startDate: formatToYMD(threeMonthsAgo),
          endDate: todayStr,
        };
      }
      case 'THIS_YEAR': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return {
          startDate: formatToYMD(startOfYear),
          endDate: todayStr,
        };
      }
      case 'CUSTOM': {
        return {
          startDate: customStartDate || undefined,
          endDate: customEndDate || undefined,
        };
      }
      case 'ALL':
      default:
        return { startDate: undefined, endDate: undefined };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // React Query params
  const summaryParams = useMemo<ExpenseSummaryParams | undefined>(() => {
    if (dateRange.startDate || dateRange.endDate) {
      return {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
    }
    return undefined;
  }, [dateRange]);

  // Fetch API data via React Query hooks
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useExpenseSummary(summaryParams);

  const {
    data: allExpenses = [],
    isLoading: isExpensesLoading,
    isError: isExpensesError,
    error: expensesError,
    refetch: refetchExpenses,
    isFetching: isExpensesFetching,
  } = useMyExpenses();

  const createExpenseMutation = useCreateExpense();

  const isLoading = isSummaryLoading || isExpensesLoading;
  const isFetching = isSummaryFetching || isExpensesFetching;
  const isError = isSummaryError || isExpensesError;

  // Filter individual expenses matching active date range for secondary metrics
  const filteredExpenses = useMemo(() => {
    if (!allExpenses || allExpenses.length === 0) return [];
    if (!dateRange.startDate && !dateRange.endDate) return allExpenses;

    return allExpenses.filter((exp) => {
      if (!exp.date) return false;
      if (dateRange.startDate && exp.date < dateRange.startDate) return false;
      if (dateRange.endDate && exp.date > dateRange.endDate) return false;
      return true;
    });
  }, [allExpenses, dateRange]);

  const hasAnyExpensesOverall = allExpenses.length > 0;
  const hasExpensesInFilter = filteredExpenses.length > 0 || (summary && summary.totalCount > 0);

  // ============================================================
  // 1. COMPUTED FINANCIAL METRICS
  // ============================================================

  // Metric 1: Total Expenses
  const totalExpenses = useMemo(() => {
    if (summary?.totalAmount !== undefined && summary?.totalAmount !== null) {
      return Number(summary.totalAmount);
    }
    return filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [summary, filteredExpenses]);

  // Metric 2: Number of Transactions
  const transactionCount = useMemo(() => {
    if (summary?.totalCount !== undefined && summary?.totalCount !== null) {
      return summary.totalCount;
    }
    return filteredExpenses.length;
  }, [summary, filteredExpenses]);

  // Metric 3: Average Expense
  const averageExpense = useMemo(() => {
    return transactionCount > 0 ? totalExpenses / transactionCount : 0;
  }, [totalExpenses, transactionCount]);

  // Metric 4: Highest Expense
  const highestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    return filteredExpenses.reduce((max, curr) =>
      Number(curr.amount) > Number(max.amount) ? curr : max,
      filteredExpenses[0]
    );
  }, [filteredExpenses]);

  // Metric 5: Top Spending Category
  const topCategory = useMemo(() => {
    if (summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0) {
      const sorted = Object.entries(summary.categoryBreakdown)
        .map(([cat, amt]) => ({ category: cat, amount: Number(amt) }))
        .sort((a, b) => b.amount - a.amount);

      if (sorted.length > 0 && sorted[0].amount > 0) {
        const top = sorted[0];
        const pct = totalExpenses > 0 ? Math.round((top.amount / totalExpenses) * 100) : 0;
        return {
          category: top.category,
          amount: top.amount,
          percentage: pct,
          label: CATEGORY_META[top.category as keyof typeof CATEGORY_META]?.label || top.category,
        };
      }
    }

    // Fallback if summary breakdown not present
    const catMap: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const cat = e.category || 'OTHER';
      catMap[cat] = (catMap[cat] || 0) + Number(e.amount);
    });
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    if (entries.length > 0 && entries[0][1] > 0) {
      const [cat, amt] = entries[0];
      const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
      return {
        category: cat,
        amount: amt,
        percentage: pct,
        label: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label || cat,
      };
    }

    return null;
  }, [summary, filteredExpenses, totalExpenses]);

  // ============================================================
  // 2. CHART DATA PREPARATION
  // ============================================================

  // Metric 6: Monthly Spending Chart Data
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const dataMap: Record<string, { label: string; amount: number; isCurrent: boolean; count: number }> = {};

    // Generate last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      dataMap[key] = {
        label,
        amount: 0,
        isCurrent: i === 0,
        count: 0,
      };
    }

    // Accumulate from backend summary monthly breakdown
    if (summary?.monthlyBreakdown) {
      Object.entries(summary.monthlyBreakdown).forEach(([k, val]) => {
        if (dataMap[k]) {
          dataMap[k].amount = Number(val);
        } else {
          const parts = k.split('-');
          if (parts.length === 2) {
            const mIdx = parseInt(parts[1], 10) - 1;
            dataMap[k] = {
              label: `${monthNames[mIdx] || parts[1]} ${parts[0].slice(-2)}`,
              amount: Number(val),
              isCurrent: false,
              count: 0,
            };
          }
        }
      });
    }

    // Accumulate from expenses list
    allExpenses.forEach((exp) => {
      if (exp.date) {
        const k = exp.date.substring(0, 7);
        if (dataMap[k]) {
          dataMap[k].count += 1;
          if (!summary?.monthlyBreakdown) {
            dataMap[k].amount += Number(exp.amount);
          }
        }
      }
    });

    const values = Object.values(dataMap);
    const maxAmount = Math.max(...values.map((v) => v.amount), 1);

    return values.map((item) => ({
      ...item,
      isPeak: item.amount === maxAmount && item.amount > 0,
    }));
  }, [allExpenses, summary]);

  // Metric 7: Category Distribution Chart Data
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    if (summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0) {
      Object.entries(summary.categoryBreakdown).forEach(([cat, amt]) => {
        categoryTotals[cat] = Number(amt);
      });
    } else {
      filteredExpenses.forEach((exp) => {
        const cat = exp.category || 'OTHER';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount);
      });
    }

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const items = Object.entries(categoryTotals)
      .map(([catKey, value]) => {
        const meta = CATEGORY_META[catKey as keyof typeof CATEGORY_META] || CATEGORY_META.OTHER;
        return {
          key: catKey,
          name: meta.label,
          value,
          color: meta.color,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return items;
  }, [filteredExpenses, summary]);

  // Metric 8: Recent Expenses (top 5 sorted by date descending)
  const recentExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredExpenses]);

  // Handle refresh
  const handleRefresh = () => {
    refetchSummary();
    refetchExpenses();
  };

  // Handle add expense
  const handleAddExpense = async (data: ExpenseRequest) => {
    try {
      await createExpenseMutation.mutateAsync(data);
      showToast('success', 'Expense Added', `Added ${data.description} (${formatCurrency(data.amount)})`);
      setIsModalOpen(false);
    } catch {
      showToast('error', 'Error', 'Could not create expense. Please try again.');
    }
  };

  // ============================================================
  // 10. LOADING SKELETON STATE
  // ============================================================
  if (isLoading && !hasAnyExpensesOverall) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Date filter bar skeleton */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-lg" />
            ))}
          </div>
        </Card>

        {/* Stat cards skeleton (5 metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
              <Skeleton className="h-7 w-32 mt-4" />
              <Skeleton className="h-3 w-20 mt-2" />
            </Card>
          ))}
        </div>

        {/* Charts row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-60 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-48 mb-6" />
            <Skeleton className="h-64 w-full rounded-full" />
          </Card>
        </div>

        {/* Recent expenses table skeleton */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-20 rounded-pill" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ============================================================
  // 12. API ERROR STATE
  // ============================================================
  if (isError && !hasAnyExpensesOverall) {
    return (
      <div className="space-y-6">
        <Card className="p-8 border border-red-200 bg-red-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-danger shrink-0" />
            <div>
              <h3 className="text-base font-bold text-danger">Failed to load analytics dashboard</h3>
              <p className="text-xs text-muted mt-1">
                {(summaryError as Error)?.message ||
                  (expensesError as Error)?.message ||
                  'Could not connect to the backend server. Please verify your connection and try again.'}
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // ============================================================
  // 11. EMPTY STATE (No expenses in account at all)
  // ============================================================
  if (!hasAnyExpensesOverall && !isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 p-8">
          <div className="w-14 h-14 rounded-full bg-accent-start/10 text-accent-start mx-auto flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">Welcome to Expense Tracker</h2>
          <p className="text-sm text-muted leading-relaxed">
            Your financial analytics dashboard will automatically generate trends, category distributions, and insights once you log your first expense.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="px-6 h-11 shadow-sm"
            >
              Add Your First Expense
            </Button>
          </div>
        </div>

        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddExpense}
          isLoading={createExpenseMutation.isPending}
        />
      </div>
    );
  }

  // ============================================================
  // MAIN DASHBOARD VIEW
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Financial Analytics</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Real-time breakdown of spending trends, outflow categories, and transaction summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Expense
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 9. DATE-RANGE FILTER TOOLBAR                                  */}
      {/* ============================================================ */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
              <Filter className="w-3.5 h-3.5 text-accent-start" />
              <span>Time Period:</span>
            </div>

            {/* Presets Button Group */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
                  { id: 'LAST_3_MONTHS', label: 'Last 3 Months' },
                  { id: 'THIS_YEAR', label: 'This Year' },
                  { id: 'ALL', label: 'All Time' },
                  { id: 'CUSTOM', label: 'Custom' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setDatePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    datePreset === preset.id
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-surface text-muted hover:text-ink hover:bg-border/60'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {datePreset === 'CUSTOM' && (
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-48">
                <Input
                  type="date"
                  label="Start Date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Input
                  type="date"
                  label="End Date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              {(customStartDate || customEndDate) && (
                <div className="sm:self-end sm:mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ============================================================ */}
      {/* 1-5. FINANCIAL STAT CARDS (5 METRICS)                         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Metric 1: Total Expenses */}
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle={
            datePreset === 'THIS_MONTH'
              ? 'Current month total'
              : datePreset === 'ALL'
              ? 'Lifetime outflow'
              : 'Selected period'
          }
          icon={<DollarSign className="w-4 h-4 text-accent-start" />}
        />

        {/* Metric 2: Number of Transactions */}
        <StatCard
          label="Transactions"
          value={transactionCount}
          subtitle={`${transactionCount === 1 ? '1 entry' : `${transactionCount} entries`} recorded`}
          icon={<Receipt className="w-4 h-4 text-purple-600" />}
        />

        {/* Metric 3: Average Expense */}
        <StatCard
          label="Average Expense"
          value={formatCurrency(averageExpense)}
          subtitle="Mean cost / transaction"
          icon={<Activity className="w-4 h-4 text-emerald-600" />}
        />

        {/* Metric 4: Highest Expense */}
        <StatCard
          label="Highest Expense"
          value={highestExpense ? formatCurrency(highestExpense.amount) : '₹0.00'}
          subtitle={highestExpense?.description ? highestExpense.description : 'No records'}
          icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
        />

        {/* Metric 5: Top Spending Category */}
        <StatCard
          label="Top Category"
          value={topCategory ? topCategory.label : 'None'}
          subtitle={
            topCategory
              ? `${formatCurrency(topCategory.amount)} (${topCategory.percentage}%)`
              : 'No category data'
          }
          icon={<Tag className="w-4 h-4 text-accent-end" />}
        />
      </div>

      {/* Filter-specific Empty State Warning */}
      {!hasExpensesInFilter && (
        <Card className="p-8 text-center space-y-3 bg-surface/50 border-dashed">
          <div className="w-10 h-10 rounded-full bg-border text-muted mx-auto flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-ink">No expenses in selected period</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            No financial records were found for the chosen date filters. Try changing your date range or add a new transaction.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDatePreset('ALL')}>
              Show All Time
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Expense
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* 6 & 7. CHARTS ROW                                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric 6: Monthly Spending Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent-start" />
                  <CardTitle>Monthly Outflow Trends</CardTitle>
                </div>
                <CardDescription>Expenditure distribution across recent months</CardDescription>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-start" />
                  <span className="text-muted font-medium">Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-end" />
                  <span className="text-muted font-medium">Peak / Current</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="h-64 sm:h-72 mt-4 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  stroke="#6B7280"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Total Outflow']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EEF0F3',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: '#F3F4F6', opacity: 0.6 }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={entry.isCurrent || entry.isPeak ? '#3B82F6' : '#94A3B8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metric 7: Category Distribution Chart */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              <CardTitle>Category Distribution</CardTitle>
            </div>
            <CardDescription>Breakdown by spending category</CardDescription>
          </CardHeader>

          <div className="h-52 flex items-center justify-center my-auto">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Total']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      borderColor: '#EEF0F3',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted text-center py-8">No category data in period</div>
            )}
          </div>

          {/* Category breakdown list */}
          <div className="pt-3 border-t border-border mt-2 space-y-1.5 max-h-40 overflow-y-auto">
            {categoryChartData.length > 0 ? (
              categoryChartData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-ink truncate max-w-[130px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-medium">
                    <span className="text-muted">{formatCurrency(item.value)}</span>
                    <span className="font-bold text-ink w-8 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-muted py-2">No categories recorded</div>
            )}
          </div>
        </Card>
      </div>

      {/* ============================================================ */}
      {/* 8. RECENT EXPENSES                                            */}
      {/* ============================================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Latest transaction records in your account</CardDescription>
            </div>
            <Link
              to="/expenses"
              className="text-xs font-semibold text-accent-end hover:underline flex items-center gap-1 group"
            >
              <span>View all transactions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </CardHeader>

        <div className="divide-y divide-border mt-2">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => {
              const meta = CATEGORY_META[expense.category] || CATEGORY_META.OTHER;
              return (
                <div
                  key={expense.id}
                  className="py-3.5 flex items-center justify-between hover:bg-surface/60 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <span
                      className="px-2.5 py-1 rounded-pill text-xs font-semibold shrink-0"
                      style={{
                        backgroundColor: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-ink truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted">{formatDate(expense.date)}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-bold text-sm text-ink ml-3">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-muted">
              No recent transactions recorded in this time period.
            </div>
          )}
        </div>
      </Card>

      {/* Global Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
        isLoading={createExpenseMutation.isPending}
      />
    </div>
  );
};

export default HomePage;
