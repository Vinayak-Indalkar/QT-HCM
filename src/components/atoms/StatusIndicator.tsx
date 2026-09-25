import React from 'react';
import { OnboardingStatus } from '../../types/candidate';
import { getStatusBadgeConfig } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export interface StatusIndicatorProps {
  status: OnboardingStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className
}) => {
  const config = getStatusBadgeConfig(status);

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={cn(
        'inline-flex items-center font-medium rounded-md border tracking-wide transition-colors',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1.5' : 'px-2.5 py-1 text-xs gap-2',
        className
      )}
    >
      <span
        className={cn('w-2 h-2 rounded-full shrink-0', config.dotClass)}
        aria-hidden="true"
      />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
