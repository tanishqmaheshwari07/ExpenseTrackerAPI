import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  return (
    <Card hoverEffect className={cn('flex flex-col justify-between', className)}>
      <div className="flex items-center justify-between">
        {/* label in faint 12px uppercase-tracked */}
        <span className="text-[12px] font-semibold uppercase tracking-wider text-faint">
          {label}
        </span>
        {icon && (
          <div className="p-2 rounded-full bg-surface border border-border text-ink flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        {/* value in ink 24px bold below */}
        <div className="text-2xl font-bold text-ink tracking-tight">
          {value}
        </div>

        {(trend || subtitle) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-pill text-[11px]',
                  trend.isPositive
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 shrink-0" />
                )}
                <span>
                  {trend.isPositive ? '+' : ''}
                  {trend.value}
                </span>
              </span>
            )}
            {trend?.label && <span className="text-muted text-[11px]">{trend.label}</span>}
            {subtitle && !trend && <span className="text-muted text-[11px]">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
