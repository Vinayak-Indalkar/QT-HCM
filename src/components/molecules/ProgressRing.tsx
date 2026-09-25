import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressRingProps {
  progress: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  showText = true,
  className,
  children
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const getColor = () => {
    if (normalizedProgress >= 100) return 'text-emerald-500';
    if (normalizedProgress >= 70) return 'text-blue-500';
    if (normalizedProgress >= 40) return 'text-amber-500';
    return 'text-slate-400';
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Onboarding progress: ${normalizedProgress}%`}
      className={cn('relative inline-flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700 fill-none"
        />
        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('fill-none transition-all duration-500 ease-out', getColor())}
        />
      </svg>

      {children ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {children}
        </div>
      ) : (
        showText && (
          <span className="absolute text-xs font-extrabold text-slate-800 dark:text-slate-100">
            {normalizedProgress}%
          </span>
        )
      )}
    </div>
  );
};
