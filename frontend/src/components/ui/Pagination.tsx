import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export interface PaginationProps {
  currentPage: number; // 0-indexed page number (0, 1, 2, ...)
  totalPages: number; // Total number of pages
  onPageChange: (page: number) => void; // Callback with 0-indexed page number
  totalElements?: number; // Total number of records (optional)
  pageSize?: number; // Records per page (optional)
  onPageSizeChange?: (pageSize: number) => void; // Callback when page size changes (optional)
  pageSizeOptions?: number[]; // Options for page size dropdown
  showingCount?: number; // Current number of records on page (optional)
  isLoading?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showingCount,
  isLoading = false,
  className,
}) => {
  if (totalPages <= 0) {
    return null;
  }

  // 1-indexed current page for calculations
  const current = currentPage + 1;

  // Generate pagination items (numbers and '...')
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (current <= 4) {
      // Near start: 1 2 3 4 5 ... totalPages
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (current >= totalPages - 3) {
      // Near end: 1 ... totalPages-4 totalPages-3 totalPages-2 totalPages-1 totalPages
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    // In middle: 1 ... current-2 current-1 current current+1 current+2 ... totalPages
    return [
      1,
      '...',
      current - 2,
      current - 1,
      current,
      current + 1,
      current + 2,
      '...',
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        'px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-paper',
        className
      )}
    >
      {/* Left Section: Record Counts & Page Size Dropdown */}
      {(totalElements !== undefined || onPageSizeChange) && (
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 text-xs text-muted">
          {totalElements !== undefined && (
            <span>
              Showing {showingCount !== undefined ? showingCount : Math.min(pageSize || 10, totalElements)} of{' '}
              <strong className="font-semibold text-ink">{totalElements}</strong>
            </span>
          )}

          {pageSize !== undefined && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={isLoading}
                aria-label="Rows per page"
                className="h-8 px-2 bg-paper border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent-end disabled:opacity-50"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Right Section: Pagination Nav (Previous, Pages, Next) */}
      <div className="flex items-center justify-between sm:justify-center gap-2 w-full sm:w-auto">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 0 || isLoading}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          className="h-9 sm:h-8 px-3 sm:px-2.5 text-xs font-semibold"
          aria-label="Previous Page"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Mobile-only page indicator (< 640px) */}
        <div className="sm:hidden text-xs font-semibold text-ink px-2 select-none">
          Page {current} of {totalPages}
        </div>

        {/* Desktop/Tablet Page Buttons & Ellipses (>= 640px) */}
        <div className="hidden sm:flex items-center gap-1 px-1">
          {pages.map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-8 flex items-center justify-center text-xs text-muted select-none"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const pageIndex = item - 1; // Convert 1-indexed to 0-indexed
            const isCurrent = currentPage === pageIndex;

            return (
              <button
                key={`page-${item}`}
                type="button"
                onClick={() => onPageChange(pageIndex)}
                disabled={isLoading}
                aria-label={`Page ${item}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all',
                  isCurrent
                    ? 'bg-ink text-white shadow-sm'
                    : 'text-muted hover:text-ink hover:bg-surface'
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages - 1 || isLoading}
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          className="h-9 sm:h-8 px-3 sm:px-2.5 text-xs font-semibold"
          aria-label="Next Page"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">Next</span>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
