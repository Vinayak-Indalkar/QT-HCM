import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../atoms/Button';
import { Inbox, SearchX, AlertTriangle } from 'lucide-react';

export interface EmptyStateProps {
  type?: 'empty' | 'no-results' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  className
}) => {
  const defaultIcons = {
    empty: <Inbox className="w-10 h-10 text-slate-400 dark:text-slate-500" aria-hidden="true" />,
    'no-results': <SearchX className="w-10 h-10 text-blue-500 dark:text-blue-400" aria-hidden="true" />,
    error: <AlertTriangle className="w-10 h-10 text-rose-500 dark:text-rose-400" aria-hidden="true" />
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/30 animate-fade-in my-4',
        className
      )}
    >
      <div className="p-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs mb-3.5">
        {icon || defaultIcons[type]}
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-5 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {secondaryActionLabel && (
            <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button
              variant={type === 'error' ? 'destructive' : 'primary'}
              size="sm"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
