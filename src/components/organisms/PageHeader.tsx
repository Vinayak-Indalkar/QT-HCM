import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '../molecules/Breadcrumbs';
import { cn } from '../../utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  descriptionClassName?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
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
  breadcrumbs,
  className
}) => {
  // If custom breadcrumbs are provided, use them. Otherwise, if onBack is provided, generate standard breadcrumbs.
  const effectiveBreadcrumbs: BreadcrumbItem[] | null = breadcrumbs || (onBack ? [
    {
      label: backLabel.replace(/^Back to\s+/i, '').replace(/^Back/i, 'Directory'),
      onClick: onBack
    },
    {
      label: title,
      current: true
    }
  ] : null);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 text-left',
        className
      )}
    >
      <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
        {effectiveBreadcrumbs && (
          <div className="mb-0.5">
            <Breadcrumbs items={effectiveBreadcrumbs} onHome={onBack} />
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
