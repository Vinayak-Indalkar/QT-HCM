import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../atoms/Button';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  descriptionClassName?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  descriptionClassName,
  badge,
  actions,
  onBack,
  backLabel = 'Back',
  className
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 text-left',
        className
      )}
    >
      <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
        {onBack && (
          <div>
            <Button
              variant="tertiary"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={onBack}
              className="-ml-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {backLabel}
            </Button>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
      </div>

      {actions && (
        <div className="flex items-center flex-wrap gap-2.5 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};
