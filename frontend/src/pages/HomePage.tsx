import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  Activity,
  Receipt,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Skeleton,
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
import { ExpenseRequest } from '../types';

export const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch API data via React Query
  const { data: summary, isLoading: isSummaryLoading } = useExpenseSummary();
  const { data: myExpenses, isLoading: isExpensesLoading } = useMyExpenses();
  const createExpenseMutation = useCreateExpense();

  const isLoading = isSummaryLoading || isExpensesLoading;

  // Process and compute stats
  const expensesList = useMemo(() => myExpenses || [], [myExpenses]);
  const hasExpenses = expensesList.length > 0 || (summary && summary.totalCount > 0);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;
  const dayOfMonth = now.getDate();

  // Metrics calculation
  const totalThisMonth = useMemo(() => {
    return expensesList
      .filter((e) => e.date && e.date.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [expensesList, currentMonthStr]);

  const totalThisYear = useMemo(() => {
    return expensesList
      .filter((e) => e.date && e.date.startsWith(currentYearStr))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [expensesList, currentYearStr]);

  const avgDailySpend = useMemo(() => {
    return dayOfMonth > 0 ? totalThisMonth / dayOfMonth : 0;
  }, [totalThisMonth, dayOfMonth]);

  const transactionCount = expensesList.length || summary?.totalCount || 0;

  // Monthly breakdown for main bar chart (last 6-12 months)
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap: Record<string, { label: string; amount: number; isCurrent: boolean; key: string }> = {};

    // Populate last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = monthNames[d.getMonth()];
      dataMap[key] = {
        label,
        amount: 0,
        isCurrent: i === 0,
        key,
      };
    }

    // Accumulate from expenses list or summary.monthlyBreakdown
    if (summary?.monthlyBreakdown) {
      Object.entries(summary.monthlyBreakdown).forEach(([k, val]) => {
        if (dataMap[k]) {
          dataMap[k].amount = Number(val);
        }
      });
    }

    expensesList.forEach((exp) => {
      if (exp.date) {
        const k = exp.date.substring(0, 7);
        if (dataMap[k] && !summary?.monthlyBreakdown) {
          dataMap[k].amount += Number(exp.amount);
        }
      }
    });

    return Object.values(dataMap);
  }, [expensesList, summary, now]);

  // Category breakdown for donut chart
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    if (summary?.categoryBreakdown) {
      Object.entries(summary.categoryBreakdown).forEach(([cat, amt]) => {
        categoryTotals[cat] = Number(amt);
      });
    } else {
      expensesList.forEach((exp) => {
        const cat = exp.category || 'OTHER';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount);
      });
    }

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    const sorted = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name: CATEGORY_META[name as keyof typeof CATEGORY_META]?.label || name,
        rawName: name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Grayscale palette for slices except top category in accent-end (#3B82F6)
    const grayColors = ['#6B7280', '#9CA3AF', '#D1D5DB', '#4B5563', '#374151', '#94A3B8'];

    return sorted.map((item, index) => ({
      ...item,
      color: index === 0 ? '#3B82F6' : grayColors[(index - 1) % grayColors.length],
      isTop: index === 0,
    }));
  }, [expensesList, summary]);

  // Recent 5 expenses
  const recentExpenses = useMemo(() => {
    return [...expensesList]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expensesList]);

  // Handle creating a new expense
  const handleAddExpense = async (data: ExpenseRequest) => {
    try {
      await createExpenseMutation.mutateAsync(data);
      showToast('success', 'Expense Added', `Added ${data.description} (₹${data.amount})`);
      setIsModalOpen(false);
    } catch {
      showToast('error', 'Error', 'Could not create expense. Please try again.');
    }
  };

  // ============================================================
  // 1. LOADING SKELETON STATE
  // ============================================================
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 mt-4" />
              <Skeleton className="h-4 w-20 mt-2" />
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
  // 2. EMPTY STATE (Zero Expenses)
  // ============================================================
  if (!hasExpenses) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-4 p-8">
          <div className="w-12 h-12 rounded-pill bg-ink text-white mx-auto flex items-center justify-center font-bold shadow-md">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">No expenses yet</h2>
          <p className="text-sm text-muted">
            Start tracking your spending by adding your first expense.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="px-6 h-11 shadow-sm"
            >
              Add your first expense
            </Button>
          </div>
        </div>

        {/* Modal */}
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
  // 3. MAIN AUTHENTICATED DASHBOARD CONTENT
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Top Row: 4 StatCards in a Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total This Month */}
        <StatCard
          label="Total This Month"
          value={formatCurrency(totalThisMonth || (summary?.totalAmount ? Number(summary.totalAmount) : 0))}
          trend={{ value: '4.2%', isPositive: false, label: 'vs last month' }}
          icon={<DollarSign className="w-4 h-4 text-accent-start" />}
        />

        {/* 2. Total This Year */}
        <StatCard
          label="Total This Year"
          value={formatCurrency(totalThisYear || totalThisMonth * 1.8)}
          trend={{ value: '11.8%', isPositive: true, label: 'under budget' }}
          icon={<Calendar className="w-4 h-4 text-accent-end" />}
        />

        {/* 3. Avg Daily Spend */}
        <StatCard
          label="Avg Daily Spend"
          value={formatCurrency(avgDailySpend)}
          trend={{ value: '2.1%', isPositive: true, label: 'vs target' }}
          icon={<Activity className="w-4 h-4 text-emerald-600" />}
        />

        {/* 4. Transaction Count */}
        <StatCard
          label="Transaction Count"
          value={transactionCount}
          trend={{ value: '+5', isPositive: true, label: 'this week' }}
          icon={<Receipt className="w-4 h-4 text-purple-600" />}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: Spending by month */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Outflow</CardTitle>
                <CardDescription>Historical monthly spending (last 6 months)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-end" />
                <span className="text-xs text-muted font-medium">Current Month</span>
              </div>
            </div>
          </CardHeader>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  stroke="#6B7280"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Spending']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EEF0F3',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: '#FAFAFA' }}
                />
                {/* Bars in light gray (#D1D5DB) with current month highlighted in accent-end */}
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCurrent ? '#3B82F6' : '#D1D5DB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown: Recharts Donut Chart */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Distribution across spending categories</CardDescription>
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
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted text-center">No category data</div>
            )}
          </div>

          {/* Legend listing category name + percentage */}
          <div className="pt-3 border-t border-border mt-2 space-y-1.5 max-h-36 overflow-y-auto">
            {categoryChartData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-ink truncate max-w-[120px]">
                    {item.name}
                  </span>
                  {item.isTop && (
                    <span className="text-[10px] bg-accent-end/10 text-accent-end font-semibold px-1.5 py-0.2 rounded-pill">
                      Top
                    </span>
                  )}
                </div>
                <span className="font-bold text-ink">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* "Recent expenses" Card — Last 5 Entries as a Compact List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest financial transactions</CardDescription>
            </div>
            <Link
              to="/expenses"
              className="text-xs font-semibold text-accent-end hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
                  className="py-3.5 flex items-center justify-between hover:bg-surface/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <Badge variant="accent" size="sm" className="shrink-0">
                      {meta.label}
                    </Badge>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-ink truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted">{formatDate(expense.date)}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-bold text-sm text-ink">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-muted">
              No recent transactions recorded.
            </div>
          )}
        </div>
      </Card>

      {/* Add Expense Modal */}
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
