import React, { useState } from 'react';
import { SearchInput } from '../../molecules/SearchInput';
import { Button } from '../../atoms/Button';
import { ActiveFilter, FilterOption } from '../../../types/common';
import { Filter, X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface FilterGroupConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface TableFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  filterGroups?: FilterGroupConfig[];
  activeFilters: ActiveFilter[];
  onAddFilter: (filter: ActiveFilter) => void;
  onRemoveFilter: (filterId: string) => void;
  onClearAllFilters: () => void;
  isLoading?: boolean;
  extraActions?: React.ReactNode;
  className?: string;
}

export const TableFilterBar: React.FC<TableFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterGroups = [],
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  isLoading = false,
  extraActions,
  className
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSelectChange = (group: FilterGroupConfig, val: string) => {
    if (!val) {
      onRemoveFilter(group.id);
      return;
    }

    const opt = group.options.find((o) => o.value === val);
    const filter: ActiveFilter = {
      id: group.id,
      field: group.id,
      label: group.label,
      value: val,
      displayValue: opt?.label || val
    };
    onAddFilter(filter);
  };

  const totalFilterCount = activeFilters.length + (searchQuery.trim() ? 1 : 0);

  return (
    <div className={cn('flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800', className)}>
      {/* Top row: Search input + quick filter selects + extra actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            isLoading={isLoading}
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {filterGroups.map((group) => {
            const active = activeFilters.find((f) => f.id === group.id);

            return (
              <div key={group.id} className="relative">
                <label htmlFor={`filter-${group.id}`} className="sr-only">
                  Filter by {group.label}
                </label>
                <select
                  id={`filter-${group.id}`}
                  value={active ? (active.value as string) : ''}
                  onChange={(e) => handleSelectChange(group, e.target.value)}
                  className={cn(
                    'text-xs rounded-md border py-2 pl-2.5 pr-8 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer',
                    active
                      ? 'border-blue-500 bg-blue-50/40 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 font-semibold'
                      : 'border-slate-300 dark:border-slate-700'
                  )}
                >
                  <option value="">{group.label}: All</option>
                  {group.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={() => setShowAdvanced((prev) => !prev)}
            aria-expanded={showAdvanced}
            className="text-xs"
          >
            Filters {totalFilterCount > 0 && `(${totalFilterCount})`}
          </Button>

          {extraActions}
        </div>
      </div>

      {/* Filter Chips row (Active Filters) */}
      {activeFilters.length > 0 && (
        <div
          role="region"
          aria-label="Active filters"
          className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-left"
        >
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" aria-hidden="true" /> Active Filters:
          </span>

          {activeFilters.map((filter) => (
            <span
              key={filter.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-medium text-xs"
            >
              <span>
                <strong>{filter.label}:</strong> {filter.displayValue}
              </span>
              <button
                type="button"
                onClick={() => onRemoveFilter(filter.id)}
                className="p-0.5 rounded-full hover:bg-blue-200/60 dark:hover:bg-blue-900/60 focus:outline-none focus:ring-1 focus:ring-blue-600"
                aria-label={`Remove filter for ${filter.label}`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 ml-2 py-0.5 px-1 rounded focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <Trash2 className="w-3 h-3" aria-hidden="true" />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
