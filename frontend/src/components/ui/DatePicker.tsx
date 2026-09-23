import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Calendar } from 'lucide-react';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            type="date"
            ref={ref}
            className={cn(
              'w-full h-10 px-3.5 pl-10 bg-paper text-sm text-ink border border-border rounded-lg transition-all duration-150',
              'focus:outline-none focus:border-accent-end focus:ring-2 focus:ring-accent-end/20',
              'disabled:bg-surface disabled:text-muted disabled:cursor-not-allowed',
              error && 'border-danger focus:border-danger focus:ring-danger/20',
              className
            )}
            {...props}
          />
          <div className="absolute left-3.5 flex items-center pointer-events-none text-muted">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="mt-1 text-xs text-danger font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
