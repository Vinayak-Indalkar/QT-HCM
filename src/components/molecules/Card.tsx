import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-2xs',
    outlined: 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 dark:border-slate-800',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-md'
  };

  return (
    <div
      className={cn(
        'rounded-xl text-left overflow-hidden transition-all',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn('p-5 flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn('p-4 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between', className)}
    {...props}
  >
    {children}
  </div>
);
