import React, { useState, useRef, useEffect } from 'react';
import { Columns3, Check, RotateCcw } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { ColumnDef } from '../../../types/common';
import { cn } from '../../../utils/cn';

export interface ColumnVisibilityDropdownProps<T> {
  columns: ColumnDef<T>[];
  visibleColumnIds: string[];
  onChange: (visibleIds: string[]) => void;
  onReset: () => void;
  className?: string;
}

export function ColumnVisibilityDropdown<T>({
  columns,
  visibleColumnIds,
  onChange,
  onReset,
  className
}: ColumnVisibilityDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (colId: string) => {
    if (visibleColumnIds.includes(colId)) {
      // Must leave at least one column visible
      if (visibleColumnIds.length > 1) {
        onChange(visibleColumnIds.filter((id) => id !== colId));
      }
    } else {
      onChange([...visibleColumnIds, colId]);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<Columns3 className="w-4 h-4" aria-hidden="true" />}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Customize table columns"
      >
        Columns ({visibleColumnIds.length}/{columns.length})
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Toggle visible columns"
          className="absolute right-0 z-40 mt-1.5 w-56 rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 animate-fade-in text-xs"
        >
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 dark:border-slate-800 px-1 font-semibold text-slate-900 dark:text-white dark:text-slate-100">
            <span>Show / Hide Columns</span>
            <button
              type="button"
              onClick={onReset}
              className="text-[11px] font-normal text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto py-1">
            {columns.map((col) => {
              const isVisible = visibleColumnIds.includes(col.id);
              const isLocked = col.hideable === false;

              return (
                <label
                  key={col.id}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 rounded cursor-pointer select-none transition-colors',
                    isLocked
                      ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/40'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      disabled={isLocked}
                      onChange={() => !isLocked && toggleColumn(col.id)}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200 dark:text-slate-300">
                      {col.header}
                    </span>
                  </div>

                  {isLocked ? (
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Locked
                    </span>
                  ) : isVisible ? (
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
