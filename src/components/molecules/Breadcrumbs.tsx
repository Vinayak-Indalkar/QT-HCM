import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  onHome?: () => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  onHome,
  className
}) => {
  const handleHomeClick = onHome || (items.length > 1 && items[0]?.onClick ? items[0].onClick : undefined);

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-slate-500 dark:text-slate-400 py-1 select-none', className)}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        {showHome && (
          <li className="flex items-center">
            {handleHomeClick ? (
              <button
                type="button"
                onClick={handleHomeClick}
                className="p-1 hover:text-blue-600 dark:hover:text-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors cursor-pointer"
                aria-label="Home"
                title="Return to parent directory"
              >
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <span className="p-1 text-slate-400 dark:text-slate-500" aria-label="Home">
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            )}
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {(showHome || index > 0) && (
                <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true" />
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md flex items-center gap-1.5"
                  title={item.label}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-600 rounded px-1 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 font-medium px-1 flex items-center gap-1.5">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
