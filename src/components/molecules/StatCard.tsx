import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive,
  icon,
  iconBg = 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  description,
  onClick,
  className
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition-all duration-150 h-full w-full flex flex-col justify-between select-none',
        onClick && 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between flex-1 gap-3">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
            {label}
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate">
            {value}
          </span>
        </div>

        {icon && (
          <div className={cn('p-2.5 rounded-xl shrink-0', iconBg)}>
            {icon}
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          {change && (
            <span
              className={cn(
                'font-bold',
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {change}
            </span>
          )}
          {description && (
            <span className="text-slate-400 dark:text-slate-500 truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
