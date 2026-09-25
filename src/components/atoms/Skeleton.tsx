import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height
}) => {
  const variantStyles = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800 shrink-0',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
};
