/**
 * @fileoverview Quantira Brand Logo Atom
 * Provides theme-aware SVG logos and transparent PNG icons.
 * Automatically adapts between Light mode (main color logo) and Dark mode (white logo).
 * @module components/atoms/Logo
 */

import React from 'react';
import { cn } from '../../utils/cn';

export interface QuantiraLogoProps {
  /**
   * Display mode:
   * - 'full': Complete logo with symbol and 'Quantira Technologies' text (SVG)
   * - 'icon': Brand symbol icon only (high-res transparent PNG / SVG)
   */
  variant?: 'full' | 'icon';
  /**
   * Optional forced theme. If omitted, automatically responds to the application's dark mode.
   */
  theme?: 'light' | 'dark' | 'auto';
  /** Optional custom CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Image height */
  height?: number | string;
  /** Image width */
  width?: number | string;
  /** Optional class name applied directly to the img elements */
  imgClassName?: string;
  /** Use PNG icon format instead of SVG when variant is 'icon' (default true for icon variant) */
  usePng?: boolean;
}

export const QuantiraLogo: React.FC<QuantiraLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  className,
  imgClassName,
  alt = 'Quantira Technologies',
  height,
  width,
  usePng = true
}) => {
  if (variant === 'icon') {
    if (theme === 'dark') {
      return (
        <img
          src={usePng ? '/logos/png/icon-white.png' : '/logos/svg/quantira-logo-white.svg'}
          alt={alt}
          style={{ height, width }}
          className={cn('object-contain select-none', imgClassName, className)}
        />
      );
    }

    if (theme === 'light') {
      return (
        <img
          src={usePng ? '/logos/png/icon-color.png' : '/logos/svg/quantira-logo-main.svg'}
          alt={alt}
          style={{ height, width }}
          className={cn('object-contain select-none', imgClassName, className)}
        />
      );
    }

    // Auto theme adaptation
    return (
      <div className={cn('relative inline-flex items-center justify-center shrink-0 select-none', className)}>
        <img
          src="/logos/png/icon-color.png"
          alt={alt}
          style={{ height, width }}
          className={cn('dark:hidden object-contain', imgClassName)}
        />
        <img
          src="/logos/png/icon-white.png"
          alt={alt}
          style={{ height, width }}
          className={cn('hidden dark:block object-contain', imgClassName)}
        />
      </div>
    );
  }

  // Full Logo (Symbol + Typography)
  if (theme === 'dark') {
    return (
      <img
        src="/logos/svg/quantira-logo-white.svg"
        alt={alt}
        style={{ height, width }}
        className={cn('object-contain select-none', imgClassName, className)}
      />
    );
  }

  if (theme === 'light') {
    return (
      <img
        src="/logos/svg/quantira-logo-main.svg"
        alt={alt}
        style={{ height, width }}
        className={cn('object-contain select-none', imgClassName, className)}
      />
    );
  }

  // Auto theme adaptation
  return (
    <div className={cn('relative inline-flex items-center shrink-0 select-none', className)}>
      <img
        src="/logos/svg/quantira-logo-main.svg"
        alt={alt}
        style={{ height, width }}
        className={cn('dark:hidden object-contain', imgClassName)}
      />
      <img
        src="/logos/svg/quantira-logo-white.svg"
        alt={alt}
        style={{ height, width }}
        className={cn('hidden dark:block object-contain', imgClassName)}
      />
    </div>
  );
};

export default QuantiraLogo;
