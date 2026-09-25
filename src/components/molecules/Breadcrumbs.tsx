import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-slate-500 dark:text-slate-400 py-1.5', className)}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        <li className="flex items-center">
          <button
            type="button"
            onClick={items[0]?.onClick}
            className="p-1 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            aria-label="Home"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;

          return (
            <li key={item.label} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true" />

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-900 dark:text-white dark:text-slate-100 truncate max-w-xs"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-600 rounded px-1 transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
