import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  /**
   * Top offset for modal positioning. Defaults to 400px as per requirements.
   */
  topOffset?: string | number;
  /**
   * Fixed height for modal. Defaults to 600px as per requirements.
   */
  height?: string | number;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  topOffset = '80px',
  height
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus trap and restore - only runs when modal open state changes
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const focusableSelectors =
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

      const focusFirstElement = () => {
        if (!modalRef.current) return;
        // Prioritize the first editable input/select/textarea
        const inputs = modalRef.current.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
        );
        if (inputs.length > 0) {
          inputs[0].focus();
          return;
        }
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      };

      // Slight timeout to ensure modal DOM is mounted
      const timer = setTimeout(focusFirstElement, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCloseRef.current();
          return;
        }

        if (e.key === 'Tab') {
          if (!modalRef.current) return;
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] sm:max-w-5xl'
  };

  const titleId = 'modal-title';
  const descId = 'modal-desc';

  // Format styles for top offset and fixed height
  const topStyle = typeof topOffset === 'number' ? `${topOffset}px` : topOffset;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      style={{ paddingTop: topStyle }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        style={{
          height: size === 'sm' || !height || height === 'auto' ? 'auto' : heightStyle,
          maxHeight: height && height !== 'auto' ? heightStyle : 'calc(100vh - 100px)'
        }}
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-fade-in',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 text-left bg-white dark:bg-slate-900">
          <div>
            <h2 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body with Inline Scroller */}
        <div className="flex-1 p-5 overflow-y-auto text-left min-h-0 overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

