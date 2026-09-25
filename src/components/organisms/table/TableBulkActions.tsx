import React from 'react';
import { Button } from '../../atoms/Button';
import { X, CheckCircle2, Download, Trash2, Mail } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface TableBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onBulkStatusUpdate?: () => void;
  onBulkExport?: () => void;
  onBulkDelete?: () => void;
  onBulkReminder?: () => void;
  className?: string;
}

export const TableBulkActions: React.FC<TableBulkActionsProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkExport,
  onBulkDelete,
  onBulkReminder,
  className
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions toolbar"
      className={cn(
        'sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white shadow-lg animate-slide-in rounded-none sm:rounded-lg mb-2',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm font-bold">
          {selectedCount} of {totalCount} item(s) selected
        </span>

        <button
          type="button"
          onClick={onClearSelection}
          className="text-xs text-blue-100 hover:text-white underline p-1 rounded focus:outline-none focus:ring-1 focus:ring-white"
        >
          Deselect all
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onBulkStatusUpdate && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />}
            onClick={onBulkStatusUpdate}
            className="text-xs bg-white dark:bg-slate-900 text-blue-900 border-none hover:bg-blue-50"
          >
            Update Status
          </Button>
        )}

        {onBulkReminder && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Mail className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />}
            onClick={onBulkReminder}
            className="text-xs bg-white dark:bg-slate-900 text-blue-900 border-none hover:bg-blue-50"
          >
            Send Reminder
          </Button>
        )}

        {onBulkExport && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />}
            onClick={onBulkExport}
            className="text-xs bg-white dark:bg-slate-900 text-blue-900 border-none hover:bg-blue-50"
          >
            Export CSV
          </Button>
        )}

        {onBulkDelete && (
          <Button
            size="sm"
            variant="destructive"
            leftIcon={<Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={onBulkDelete}
            className="text-xs bg-rose-700 hover:bg-rose-800 border-none"
          >
            Delete
          </Button>
        )}

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 text-blue-200 hover:text-white rounded focus:outline-none focus:ring-1 focus:ring-white ml-1"
          aria-label="Dismiss bulk action bar"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
