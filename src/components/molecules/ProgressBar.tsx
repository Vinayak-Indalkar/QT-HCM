import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  progress: number; // 0 - 100
  label?: string;
  showLabel?: boolean;
  showPercentage?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showLabel = true,
  showPercentage = true,
  size = 'md',
  color,
  className
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heightClass =
    size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  const defaultColor =
    color ||
    (normalizedProgress >= 100
      ? 'bg-emerald-500'
      : normalizedProgress >= 70
      ? 'bg-blue-600'
      : normalizedProgress >= 40
      ? 'bg-amber-500'
      : 'bg-slate-400');

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between text-xs mb-1 gap-2">
          {showLabel && (
            <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] truncate">
              {label || 'Progress'}
            </span>
          )}
          {showPercentage && (
            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] shrink-0 ml-auto">
              {normalizedProgress}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden', heightClass)}>
        <div
          role="progressbar"
          aria-valuenow={normalizedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn('rounded-full transition-all duration-300', heightClass, defaultColor)}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
