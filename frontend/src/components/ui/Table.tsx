import React from 'react';
import { cn } from '../../utils/cn';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  ...props
}) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full caption-bottom text-sm text-left', className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <thead className={cn('bg-surface border-b border-border', className)} {...props} />;

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <tbody className={cn('divide-y divide-border', className)} {...props} />;

export const TableFooter: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <tfoot
    className={cn('bg-surface font-medium border-t border-border', className)}
    {...props}
  />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => (
  <tr
    className={cn(
      'transition-colors hover:bg-surface/70 data-[state=selected]:bg-muted/10',
      className
    )}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <th
    className={cn(
      'h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted align-middle [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <td
    className={cn('p-4 align-middle text-sm text-ink [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
);

export const TableCaption: React.FC<React.HTMLAttributes<HTMLTableCaptionElement>> = ({
  className,
  ...props
}) => (
  <caption className={cn('mt-4 text-xs text-muted', className)} {...props} />
);
