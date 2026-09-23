import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'success' | 'danger' | 'warning' | 'muted' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'accent',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    // Badge: pill-shaped, light navy tint bg (accent-start at 10% opacity) with accent-start text for category tags
    accent: 'bg-accent-start/10 text-accent-start border border-accent-start/20',
    success: 'bg-success/10 text-success border border-success/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    muted: 'bg-gray-100 text-muted border border-border',
    neutral: 'bg-surface text-ink border border-border',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium',
    md: 'text-xs px-3 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-pill tracking-wide transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
