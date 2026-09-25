import React, { useState, useMemo } from 'react';
import { ColumnDef, SortDirection, ActiveFilter } from '../../../types/common';
import { TablePagination } from './TablePagination';
import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown';
import { TableFilterBar, FilterGroupConfig } from './TableFilterBar';
import { TableBulkActions } from './TableBulkActions';
import { Skeleton } from '../../atoms/Skeleton';
import { EmptyState } from '../../molecules/EmptyState';
import { Checkbox } from '../../atoms/Checkbox';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  filterGroups?: FilterGroupConfig[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  // Selection
  enableSelection?: boolean;
  // Bulk action handlers
  onBulkDelete?: (ids: string[]) => void;
  onBulkStatusUpdate?: (ids: string[]) => void;
  onBulkExport?: (selectedItems: T[]) => void;
  onBulkReminder?: (ids: string[]) => void;
  // Expandable row rendering
  renderExpandedRow?: (item: T) => React.ReactNode;
  enableExpanding?: boolean;
  // Row click
  onRowClick?: (item: T) => void;
  // Extra action button at top right
  extraHeaderActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  filterGroups = [],
  searchPlaceholder = 'Search records...',
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load records.',
  onRetry,
  enableSelection = true,
  enableExpanding = true,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkExport,
  onBulkReminder,
  renderExpandedRow,
  onRowClick,
  extraHeaderActions,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no records available in this directory.',
  className
}: DataTableProps<T>) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');

  // Column visibility state
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    columns.filter((c) => c.defaultVisible !== false).map((c) => c.id)
  );

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Expanded rows state
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  // Handlers
  const handleSort = (columnId: string) => {
    if (sortField === columnId) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection('none');
        setSortField(null);
      }
    } else {
      setSortField(columnId);
      setSortDirection('asc');
    }
  };

  const handleAddFilter = (filter: ActiveFilter) => {
    setActiveFilters((prev) => [...prev.filter((f) => f.id !== filter.id), filter]);
    setPageIndex(0);
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== filterId));
    setPageIndex(0);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setActiveFilters([]);
    setPageIndex(0);
  };

  const handleResetColumns = () => {
    setVisibleColumnIds(columns.filter((c) => c.defaultVisible !== false).map((c) => c.id));
  };

  const toggleRowExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRowIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Search pipeline
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search matching across all object string fields
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(query);
          if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val).toLowerCase().includes(query);
          }
          return false;
        });
        if (!matchesQuery) return false;
      }

      // Filter matching
      for (const filter of activeFilters) {
        const itemVal = (item as Record<string, unknown>)[filter.field];
        if (itemVal !== undefined && itemVal !== null) {
          if (String(itemVal).toLowerCase() !== String(filter.value).toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchQuery, activeFilters]);

  // Sort pipeline
  const sortedData = useMemo(() => {
    if (!sortField || sortDirection === 'none') return filteredData;

    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => c.id === sortField);
      const key = col?.accessorKey || (sortField as keyof T);
      const aVal = (a as Record<string, unknown>)[key as string];
      const bVal = (b as Record<string, unknown>)[key as string];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection, columns]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize]);

  // Selection handlers
  const isAllPageSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.includes(item.id));
  const isSomePageSelected =
    paginatedData.some((item) => selectedIds.includes(item.id)) && !isAllPageSelected;

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageItemIds = paginatedData.map((i) => i.id);
      setSelectedIds((prev) => prev.filter((id) => !pageItemIds.includes(id)));
    } else {
      const pageItemIds = paginatedData.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageItemIds])));
    }
  };

  const handleToggleRowSelect = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Visible columns definition
  const activeColumns = useMemo(() => {
    return columns.filter((c) => visibleColumnIds.includes(c.id));
  }, [columns, visibleColumnIds]);

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedIds.includes(item.id));
  }, [data, selectedIds]);

  return (
    <div className={cn('flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden text-left', className)}>
      {/* Filter and Tool Bar */}
      <TableFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPageIndex(0);
        }}
        searchPlaceholder={searchPlaceholder}
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onClearAllFilters={handleClearAllFilters}
        isLoading={isLoading}
        extraActions={
          <div className="flex items-center gap-2">
            <ColumnVisibilityDropdown
              columns={columns}
              visibleColumnIds={visibleColumnIds}
              onChange={setVisibleColumnIds}
              onReset={handleResetColumns}
            />
            {extraHeaderActions}
          </div>
        }
      />

      {/* Bulk Actions Sticky Bar */}
      {enableSelection && (
        <TableBulkActions
          selectedCount={selectedIds.length}
          totalCount={filteredData.length}
          onClearSelection={() => setSelectedIds([])}
          onBulkStatusUpdate={onBulkStatusUpdate ? () => onBulkStatusUpdate(selectedIds) : undefined}
          onBulkExport={onBulkExport ? () => onBulkExport(selectedItems) : undefined}
          onBulkDelete={onBulkDelete ? () => onBulkDelete(selectedIds) : undefined}
          onBulkReminder={onBulkReminder ? () => onBulkReminder(selectedIds) : undefined}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="p-6 space-y-4">
          <Skeleton height={40} className="w-full" />
          <Skeleton height={40} className="w-full" />
          <Skeleton height={40} className="w-full" />
          <Skeleton height={40} className="w-full" />
          <Skeleton height={40} className="w-full" />
        </div>
      ) : isError ? (
        /* Error State */
        <EmptyState
          type="error"
          title="Error Loading Data"
          description={errorMessage}
          actionLabel="Try Again"
          onAction={onRetry}
        />
      ) : paginatedData.length === 0 ? (
        /* Empty / No Results State */
        searchQuery || activeFilters.length > 0 ? (
          <EmptyState
            type="no-results"
            title="No Matching Records"
            description="No records match your search criteria and active filters. Try resetting your search or filter values."
            actionLabel="Clear Filters"
            onAction={handleClearAllFilters}
          />
        ) : (
          <EmptyState
            type="empty"
            title={emptyTitle}
            description={emptyDescription}
          />
        )
      ) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse text-xs sm:text-sm"
            role="table"
            aria-label="Data table"
          >
            <thead className="bg-slate-50 dark:bg-slate-800/50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] select-none">
              <tr role="row">
                {/* Selection column */}
                {enableSelection && (
                  <th scope="col" className="p-3.5 w-10 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllPageSelected}
                        indeterminate={isSomePageSelected}
                        onChange={handleSelectAllPage}
                        aria-label="Select all rows on current page"
                      />
                    </div>
                  </th>
                )}

                {/* Expansion column if enabled */}
                {enableExpanding && renderExpandedRow && (
                  <th scope="col" className="p-3.5 w-8">
                    <span className="sr-only">Expand</span>
                  </th>
                )}

                {/* Data columns */}
                {activeColumns.map((col) => {
                  const isSorted = sortField === col.id;
                  const sortDir = isSorted ? sortDirection : 'none';

                  const ariaSortValue: React.AriaAttributes['aria-sort'] =
                    sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none';

                  return (
                    <th
                      key={col.id}
                      scope="col"
                      aria-sort={col.sortable ? ariaSortValue : undefined}
                      style={{ minWidth: col.minWidth, width: col.width }}
                      className={cn(
                        'p-3.5 font-bold transition-colors whitespace-nowrap',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.id)}
                          className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 -mx-1 transition-colors whitespace-nowrap"
                          aria-label={`Sort by ${col.header}, currently ${sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'unsorted'}`}
                        >
                          <span>{col.header}</span>
                          <span className="shrink-0 text-slate-400">
                            {sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                            ) : sortDir === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" aria-hidden="true" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <span className="whitespace-nowrap">{col.header}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 dark:text-slate-200">
              {paginatedData.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isExpanded = expandedRowIds.includes(item.id);

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      role="row"
                      aria-selected={isSelected}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'transition-colors duration-100',
                        onRowClick && 'cursor-pointer',
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      )}
                    >
                      {/* Selection checkbox */}
                      {enableSelection && (
                        <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleRowSelect(item.id)}
                              aria-label={`Select row ${item.id}`}
                            />
                          </div>
                        </td>
                      )}

                      {/* Expand row toggle */}
                      {enableExpanding && renderExpandedRow && (
                        <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => toggleRowExpansion(item.id, e)}
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row details`}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Cells */}
                      {activeColumns.map((col) => {
                        return (
                          <td
                            key={col.id}
                            style={{ minWidth: col.minWidth, width: col.width }}
                            className={cn(
                              'p-3.5 align-middle whitespace-nowrap',
                              col.align === 'center' && 'text-center',
                              col.align === 'right' && 'text-right'
                            )}
                          >
                            {col.cell
                              ? col.cell(item)
                              : col.accessorKey
                              ? String((item as Record<string, unknown>)[col.accessorKey as string] ?? '—')
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && enableExpanding && renderExpandedRow && (
                      <tr className="bg-slate-50 dark:bg-slate-800/50/60 dark:bg-slate-950/40 border-y border-slate-200 dark:border-slate-700/80 dark:border-slate-800">
                        <td
                          colSpan={activeColumns.length + (enableSelection ? 1 : 0) + (enableExpanding ? 1 : 0)}
                          className="p-4 sm:p-6"
                        >
                          <div className="animate-fade-in">{renderExpandedRow(item)}</div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !isError && filteredData.length > 0 && (
        <TablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={filteredData.length}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
