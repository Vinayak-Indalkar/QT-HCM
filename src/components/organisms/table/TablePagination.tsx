import React from 'react';
import { cn } from '../../../utils/cn';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { IconButton } from '../../atoms/IconButton';

export interface TablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  pageIndex,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < totalPages - 1;

  return (
    <nav
      aria-label="Table pagination"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 dark:text-slate-400',
        className
      )}
    >
      {/* Records info */}
      <div className="flex items-center gap-4">
        <span>
          Showing{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">
            {startItem}-{endItem}
          </strong>{' '}
          of{' '}
          <strong className="text-slate-900 dark:text-white font-semibold">
            {totalItems}
          </strong>{' '}
          records
        </span>

        {/* Page size picker */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="rows-per-page" className="sr-only">
            Rows per page
          </label>
          <span className="hidden md:inline">Rows per page:</span>
          <select
            id="rows-per-page"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(0);
            }}
            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer text-xs"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={<ChevronsLeft className="w-4 h-4" aria-hidden="true" />}
          aria-label="Go to first page"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(0)}
        />
        <IconButton
          icon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
          aria-label="Go to previous page"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(pageIndex - 1)}
        />

        <span className="px-3 py-1 font-medium text-slate-900 dark:text-slate-100">
          Page {pageIndex + 1} of {totalPages}
        </span>

        <IconButton
          icon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
          aria-label="Go to next page"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(pageIndex + 1)}
        />
        <IconButton
          icon={<ChevronsRight className="w-4 h-4" aria-hidden="true" />}
          aria-label="Go to last page"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(totalPages - 1)}
        />
      </div>
    </nav>
  );
};
