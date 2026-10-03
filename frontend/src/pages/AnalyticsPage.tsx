import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  PieChart as PieChartIcon,
  ChevronRight,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  DatePicker,
  Skeleton,
} from '../components/ui';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency, CATEGORY_META } from '../utils/formatters';
import { useExpenseSummary, useMyExpenses } from '../hooks/useExpenses';

type DatePreset = 'this_month' | 'last_month' | 'last_3_months' | 'custom';

const formatToYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [preset, setPreset] = useState<DatePreset>('this_month');

  // Compute preset date ranges
  const dateRange = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (preset === 'this_month') {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return {
        startDate: formatToYMD(start),
        endDate: formatToYMD(end),
      };
    }
    if (preset === 'last_month') {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return {
        startDate: formatToYMD(start),
        endDate: formatToYMD(end),
      };
    }
    if (preset === 'last_3_months') {
      const start = new Date(y, m - 2, 1);
      const end = new Date(y, m + 1, 0);
      return {
        startDate: formatToYMD(start),
        endDate: formatToYMD(end),
      };
    }
    return { startDate: '', endDate: '' };
  }, [preset]);

  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const activeStartDate = preset === 'custom' ? customStart : dateRange.startDate;
  const activeEndDate = preset === 'custom' ? customEnd : dateRange.endDate;

  const summaryParams = useMemo(() => ({
    startDate: activeStartDate || undefined,
    endDate: activeEndDate || undefined,
  }), [activeStartDate, activeEndDate]);

  const { data: summary, isLoading: isSummaryLoading } = useExpenseSummary(summaryParams);
  const { data: myExpenses, isLoading: isExpensesLoading } = useMyExpenses();

  const isLoading = isSummaryLoading || isExpensesLoading;

  // Filter raw expenses by active date range and exclude soft-deleted items
  const filteredExpenses = useMemo(() => {
    if (!myExpenses || myExpenses.length === 0) return [];

    return myExpenses.filter((exp) => {
      // Exclude soft-deleted records
      if (exp.isDeleted === true || (exp as unknown as { is_deleted?: boolean }).is_deleted === true) {
        return false;
      }
      if (!exp.date) return false;
      if (activeStartDate && exp.date < activeStartDate) return false;
      if (activeEndDate && exp.date > activeEndDate) return false;
      return true;
    });
  }, [myExpenses, activeStartDate, activeEndDate]);

  // Total current period amount strictly from real API summary or filtered expenses
  const totalAmount = useMemo(() => {
    if (summary?.totalAmount !== undefined && summary?.totalAmount !== null) {
      return Number(summary.totalAmount);
    }
    return filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount ?? 0), 0);
  }, [summary, filteredExpenses]);

  // Total transaction count strictly from real API summary or filtered expenses
  const transactionCount = useMemo(() => {
    if (summary?.totalCount !== undefined && summary?.totalCount !== null) {
      return Number(summary.totalCount);
    }
    return filteredExpenses.length;
  }, [summary, filteredExpenses]);

  // Daily spend trend data generated strictly from real expense records
  const trendData = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      return [];
    }

    const dataMap: Record<string, number> = {};
    filteredExpenses.forEach((exp) => {
      if (exp.date) {
        dataMap[exp.date] = (dataMap[exp.date] ?? 0) + Number(exp.amount ?? 0);
      }
    });

    const entries = Object.entries(dataMap);
    if (entries.length === 0) {
      return [];
    }

    return entries
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => {
        const d = new Date(date + 'T00:00:00');
        return {
          label: `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
          amount,
        };
      });
  }, [filteredExpenses]);

  // Category breakdown as horizontal bar list
  const categoryBars = useMemo(() => {
    const totals: Record<string, number> = {};

    if (summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0) {
      Object.entries(summary.categoryBreakdown).forEach(([k, v]) => {
        const val = Number(v);
        if (val > 0) {
          totals[k] = val;
        }
      });
    } else if (filteredExpenses && filteredExpenses.length > 0) {
      filteredExpenses.forEach((e) => {
        const cat = e.category || 'OTHER';
        totals[cat] = (totals[cat] ?? 0) + Number(e.amount ?? 0);
      });
    }

    const totalSum = Object.values(totals).reduce((a, b) => a + b, 0);
    if (totalSum === 0 || Object.keys(totals).length === 0) {
      return [];
    }

    const sorted = Object.entries(totals)
      .map(([key, value]) => ({
        key,
        name: CATEGORY_META[key as keyof typeof CATEGORY_META]?.label || key,
        amount: value,
        percent: totalSum > 0 ? (value / totalSum) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topTints = ['#1E3A8A', '#2563EB', '#3B82F6'];
    const grayTints = ['#9CA3AF', '#D1D5DB', '#E5E7EB', '#6B7280'];

    return sorted.map((item, idx) => ({
      ...item,
      color: idx < 3 ? topTints[idx] : grayTints[(idx - 3) % grayTints.length],
      isTop3: idx < 3,
    }));
  }, [summary, filteredExpenses]);

  // Handle clicking a category bar -> navigates to /expenses?category={name}
  const handleCategoryClick = (categoryKey: string) => {
    navigate(`/expenses?category=${categoryKey}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Larger Date-Range Filter Control */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Financial Analytics</h1>
            <p className="text-sm text-muted mt-0.5">
              Deep dive into category outflow, velocity trends, and period comparisons.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'this_month', label: 'This month' },
              { key: 'last_month', label: 'Last month' },
              { key: 'last_3_months', label: 'Last 3 months' },
              { key: 'custom', label: 'Custom' },
            ].map((p) => {
              const active = preset === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key as DatePreset)}
                  className={`px-4 py-2 rounded-pill text-xs font-semibold transition-all ${
                    active
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-surface border border-border text-muted hover:text-ink hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Date Range Picker inputs when Custom preset is active */}
        {preset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md animate-fadeIn">
            <DatePicker
              label="Start Date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <DatePicker
              label="End Date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </Card>

      {/* Comparison Stat Block & Velocity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Comparison Stat Block */}
        <Card className="p-6">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-faint">
            This Period vs Last Period
          </span>
          <div className="flex items-center gap-3 mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold flex items-center gap-1.5 text-muted">
              <Activity className="w-7 h-7 shrink-0 text-faint" />
              <span>N/A</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-pill bg-surface border border-border text-muted">
              No comparison data
            </span>
          </div>
          <p className="text-xs text-muted mt-2">
            Historical period benchmarking is not available for this range.
          </p>
        </Card>

        {/* Period Total */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-faint">
              Total Period Spend
            </span>
            <div className="p-2 rounded-full bg-surface border border-border text-ink">
              <DollarSign className="w-4 h-4 text-accent-start" />
            </div>
          </div>
          <div className="text-3xl font-bold text-ink tracking-tight mt-3">
            {formatCurrency(totalAmount ?? 0)}
          </div>
          <p className="text-xs text-muted mt-2">
            Aggregated across {transactionCount ?? 0} recorded transaction(s)
          </p>
        </Card>

        {/* Categories Active */}
        <Card className="p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-faint">
              Categorical Spread
            </span>
            <div className="p-2 rounded-full bg-surface border border-border text-ink">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-ink tracking-tight mt-3">
            {categoryBars.length} {categoryBars.length === 1 ? 'Category' : 'Categories'}
          </div>
          <p className="text-xs text-muted mt-2">
            Top area:{' '}
            <span className="font-semibold text-ink">
              {categoryBars[0]?.name || 'No categories yet'}
            </span>
          </p>
        </Card>
      </div>

      {/* Large Recharts Line/Area Chart */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Spending Timeline</CardTitle>
              <CardDescription>Daily & weekly expense volume over the selected range</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-end" />
              <span className="text-xs text-muted font-medium">Outflow</span>
            </div>
          </div>
        </CardHeader>

        <div className="h-80 w-full mt-4">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : trendData.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 bg-surface/50 rounded-xl border border-dashed border-border">
              <div className="w-10 h-10 rounded-full bg-surface border border-border text-muted flex items-center justify-center mb-3">
                <Activity className="w-5 h-5 text-accent-end" />
              </div>
              <p className="text-sm font-semibold text-ink">No spending data available</p>
              <p className="text-xs text-muted mt-1">Add an expense to see your spending timeline.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Subtle area fill below it at 8% opacity */}
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                  formatter={(val: number) => [formatCurrency(val), 'Outflow']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#EEF0F3',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                  dot={{ r: 3, fill: '#3B82F6' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Category Breakdown as a Horizontal Bar List */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Click any category bar to inspect filtered transactions
              </CardDescription>
            </div>
            {categoryBars.length > 0 && (
              <span className="text-xs text-faint">Click row to filter</span>
            )}
          </div>
        </CardHeader>

        {categoryBars.length === 0 ? (
          <div className="py-12 text-center bg-surface/50 rounded-xl border border-dashed border-border">
            <p className="text-sm font-semibold text-ink">No expenses recorded for this period.</p>
            <p className="text-xs text-muted mt-1">Add an expense to see category breakdown.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryBars.map((cat, idx) => (
              <div
                key={cat.key || idx}
                onClick={() => handleCategoryClick(cat.key)}
                className="p-3 rounded-xl hover:bg-surface/80 border border-transparent hover:border-border transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink group-hover:text-accent-end transition-colors">
                      {cat.name}
                    </span>
                    {cat.isTop3 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-accent-start/10 text-accent-start">
                        Rank #{idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted font-medium">
                      {cat.percent.toFixed(1)}%
                    </span>
                    <span className="font-bold text-ink text-sm">
                      {formatCurrency(cat.amount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-faint group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Progress Horizontal Bar in Grayscale / Light Navy Tints */}
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, cat.percent)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPage;
