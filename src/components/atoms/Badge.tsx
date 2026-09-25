import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  sentiment?: 'neutral' | 'info' | 'success' | 'warning' | 'negative';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  sentiment = 'neutral',
  size = 'md',
  dot = false,
  ...props
}) => {
  const sentimentStyles = {
    neutral: 'bg-slate-100 text-slate-700 dark:text-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    negative: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
  };

  const dotColors = {
    neutral: 'bg-slate-400 dark:bg-slate-500',
    info: 'bg-blue-500 dark:bg-blue-400',
    success: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    negative: 'bg-rose-500 dark:bg-rose-400'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-2xs font-sans tracking-wide',
        sizeStyles[size],
        sentimentStyles[sentiment],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[sentiment])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
