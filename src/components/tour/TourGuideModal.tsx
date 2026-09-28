import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTour } from '../../context/TourContext';
import { useRole } from '../../context/RoleContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { Button } from '../atoms/Button';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Compass,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';
import confetti from 'canvas-confetti';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const TourGuideModal: React.FC = () => {
  const {
    isTourOpen,
    currentStepIndex,
    currentSteps,
    closeTour,
    nextStep,
    prevStep,
    goToStep,
    autoShowOnLogin,
    setAutoShowOnLogin
  } = useTour();

  const { currentRole } = useRole();
  const { activePage, navigateTo } = useOnboarding();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    placement: 'right' | 'left' | 'top' | 'bottom' | 'center';
    arrowOffset?: { top?: number; left?: number };
  }>({
    top: 0,
    left: 0,
    placement: 'center'
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  const step = currentSteps[currentStepIndex] || currentSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === currentSteps.length - 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / currentSteps.length) * 100);

  // Trigger celebration confetti on finishing tour
  const handleFinishTour = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    closeTour();
  };

  // Keyboard navigation (Escape to close, Left/Right arrow keys)
  useEffect(() => {
    if (!isTourOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTour();
      if (e.key === 'ArrowRight' && !isLastStep) nextStep();
      if (e.key === 'ArrowLeft' && !isFirstStep) prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, isLastStep, isFirstStep, nextStep, prevStep, closeTour]);

  // Navigate to target page if step requires it and user is elsewhere
  useEffect(() => {
    if (isTourOpen && step?.targetPage && activePage !== step.targetPage) {
      navigateTo(step.targetPage);
    }
  }, [isTourOpen, currentStepIndex, step?.targetPage, activePage, navigateTo]);

  // Measure and update target element rect & popover placement
  const updatePosition = useCallback(() => {
    if (!isTourOpen || !step) {
      setTargetRect(null);
      return;
    }

    const selector = step.targetSelector;
    let targetEl: HTMLElement | null = null;
    if (selector) {
      targetEl = document.querySelector(selector) as HTMLElement;
    }

    if (!targetEl) {
      // Centered fallback when element is not found
      setTargetRect(null);
      setPopoverPos({
        top: Math.max(20, (window.innerHeight - 520) / 2),
        left: Math.max(16, (window.innerWidth - 480) / 2),
        placement: 'center'
      });
      return;
    }

    // Scroll element into view smoothly if not visible
    const elRect = targetEl.getBoundingClientRect();
    const isInViewport =
      elRect.top >= 0 &&
      elRect.left >= 0 &&
      elRect.bottom <= window.innerHeight &&
      elRect.right <= window.innerWidth;

    if (!isInViewport) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    const rect: TargetRect = {
      top: elRect.top,
      left: elRect.left,
      width: elRect.width,
      height: elRect.height,
      bottom: elRect.bottom,
      right: elRect.right
    };

    setTargetRect(rect);

    // Calculate popover position
    const cardWidth = Math.min(480, window.innerWidth - 32);
    const cardHeight = 460; // approximate height for positioning calculation
    const margin = 18;
    const preferredPlacement = step.placement || 'right';

    let top = 0;
    let left = 0;
    let actualPlacement: 'right' | 'left' | 'top' | 'bottom' | 'center' = preferredPlacement;

    // Check right side
    if (preferredPlacement === 'right') {
      if (rect.right + margin + cardWidth <= window.innerWidth) {
        actualPlacement = 'right';
        left = rect.right + margin;
        top = Math.max(16, Math.min(rect.top + rect.height / 2 - 140, window.innerHeight - cardHeight - 16));
      } else if (rect.left - margin - cardWidth >= 16) {
        actualPlacement = 'left';
        left = rect.left - margin - cardWidth;
        top = Math.max(16, Math.min(rect.top + rect.height / 2 - 140, window.innerHeight - cardHeight - 16));
      } else {
        actualPlacement = 'bottom';
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        top = Math.min(rect.bottom + margin, window.innerHeight - cardHeight - 16);
      }
    } else if (preferredPlacement === 'bottom') {
      if (rect.bottom + margin + cardHeight <= window.innerHeight) {
        actualPlacement = 'bottom';
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        top = rect.bottom + margin;
      } else if (rect.top - margin - cardHeight >= 16) {
        actualPlacement = 'top';
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        top = rect.top - margin - cardHeight;
      } else {
        actualPlacement = 'center';
        left = Math.max(16, (window.innerWidth - cardWidth) / 2);
        top = Math.max(16, (window.innerHeight - cardHeight) / 2);
      }
    } else if (preferredPlacement === 'top') {
      if (rect.top - margin - cardHeight >= 16) {
        actualPlacement = 'top';
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        top = rect.top - margin - cardHeight;
      } else {
        actualPlacement = 'bottom';
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
        top = Math.min(rect.bottom + margin, window.innerHeight - cardHeight - 16);
      }
    } else if (preferredPlacement === 'left') {
      if (rect.left - margin - cardWidth >= 16) {
        actualPlacement = 'left';
        left = rect.left - margin - cardWidth;
        top = Math.max(16, Math.min(rect.top + rect.height / 2 - 140, window.innerHeight - cardHeight - 16));
      } else {
        actualPlacement = 'bottom';
        left = Math.max(16, (window.innerWidth - cardWidth) / 2);
        top = Math.min(rect.bottom + margin, window.innerHeight - cardHeight - 16);
      }
    }

    setPopoverPos({
      top,
      left,
      placement: actualPlacement
    });
  }, [isTourOpen, step]);

  // Recalculate position on step change, resize, and scroll
  useEffect(() => {
    if (!isTourOpen) return;

    // Small delay to let page transition / DOM render
    const timer = setTimeout(() => {
      updatePosition();
    }, 120);

    const handleScrollOrResize = () => {
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isTourOpen, currentStepIndex, updatePosition]);

  if (!isTourOpen || !step) return null;

  const handleActionClick = () => {
    if (step.targetPage) {
      navigateTo(step.targetPage);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Application Tour Guide"
      className="fixed inset-0 z-50 pointer-events-none select-none"
    >
      {/* 1. Backdrop Overlay Scrim with cutout spotlight or full dim */}
      {targetRect ? (
        <>
          {/* Spotlight Highlight Box around the target element with glowing ring */}
          <div
            className="fixed pointer-events-none transition-all duration-300 ease-out rounded-2xl"
            style={{
              top: Math.max(0, targetRect.top - 6),
              left: Math.max(0, targetRect.left - 6),
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65), 0 0 0 3px #3b82f6, 0 0 24px rgba(59, 130, 246, 0.55)',
              zIndex: 51
            }}
          >
            {/* Animated Pulse Beacon Dot */}
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-xs" />
            </span>
          </div>

          {/* Transparent click blocker over the rest of the screen to prevent accidental clicks */}
          <div
            className="fixed inset-0 pointer-events-auto"
            style={{ zIndex: 50 }}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      ) : (
        /* Full Backdrop Modal fallback if target is not mounted */
        <div
          className="fixed inset-0 bg-slate-900/65 dark:bg-slate-950/80 backdrop-blur-xs pointer-events-auto transition-opacity duration-300"
          style={{ zIndex: 50 }}
          onClick={closeTour}
        />
      )}

      {/* 2. Floating Anchored Popover Tooltip Card */}
      <div
        ref={popoverRef}
        className={cn(
          'fixed pointer-events-auto transition-all duration-300 ease-out z-[52] w-[calc(100vw-32px)] max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col',
          popoverPos.placement === 'center' && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
        )}
        style={
          popoverPos.placement === 'center'
            ? undefined
            : {
                top: `${popoverPos.top}px`,
                left: `${popoverPos.left}px`
              }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Directional Pointer Arrow */}
        {targetRect && popoverPos.placement === 'right' && (
          <div
            className="absolute -left-2.5 w-5 h-5 bg-white dark:bg-slate-900 border-l border-t border-slate-200 dark:border-slate-800 transform -rotate-45 shadow-sm pointer-events-none"
            style={{
              top: Math.max(
                20,
                Math.min(
                  targetRect.top + targetRect.height / 2 - popoverPos.top - 10,
                  popoverRef.current?.clientHeight ? popoverRef.current.clientHeight - 30 : 120
                )
              )
            }}
          />
        )}
        {targetRect && popoverPos.placement === 'left' && (
          <div
            className="absolute -right-2.5 w-5 h-5 bg-white dark:bg-slate-900 border-r border-t border-slate-200 dark:border-slate-800 transform rotate-45 shadow-sm pointer-events-none"
            style={{
              top: Math.max(
                20,
                Math.min(
                  targetRect.top + targetRect.height / 2 - popoverPos.top - 10,
                  popoverRef.current?.clientHeight ? popoverRef.current.clientHeight - 30 : 120
                )
              )
            }}
          />
        )}
        {targetRect && popoverPos.placement === 'bottom' && (
          <div
            className="absolute -top-2.5 w-5 h-5 bg-white dark:bg-slate-900 border-l border-t border-slate-200 dark:border-slate-800 transform rotate-45 shadow-sm pointer-events-none"
            style={{
              left: Math.max(
                24,
                Math.min(
                  targetRect.left + targetRect.width / 2 - popoverPos.left - 10,
                  popoverRef.current?.clientWidth ? popoverRef.current.clientWidth - 30 : 200
                )
              )
            }}
          />
        )}

        {/* Top Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Card Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Interactive Tour
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {currentRole.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Step {currentStepIndex + 1} of {currentSteps.length} &bull; {step.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeTour}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close Tour Guide"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4 max-h-[58vh] overflow-y-auto text-left">
          {/* Main Visual Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/80 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {step.icon}
            </div>

            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {step.badge}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {step.title}
              </h2>
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            {step.description}
          </p>

          {/* Key Feature Highlights */}
          {step.features && step.features.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                What you can do here:
              </h3>
              <div className="space-y-1.5">
                {step.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Navigation Action (if available) */}
          {step.targetPage && step.actionLabel && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleActionClick}
                className="w-full py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {step.actionLabel}
                </span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-3.5 sm:px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-2">
          {/* Step Dots & Auto-show Checkbox */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {currentSteps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToStep(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                    idx === currentStepIndex
                      ? 'w-5 bg-blue-600 dark:bg-blue-500'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  )}
                  title={`Step ${idx + 1}`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <label className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoShowOnLogin}
                onChange={(e) => setAutoShowOnLogin(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-3 w-3 cursor-pointer"
              />
              <span>Auto-show</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={closeTour}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1 transition-colors cursor-pointer"
            >
              Skip
            </button>

            {!isFirstStep && (
              <Button
                variant="secondary"
                size="sm"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="w-3 h-3" />}
                className="text-xs font-semibold px-2.5 py-1.5 cursor-pointer"
              >
                Back
              </Button>
            )}

            {isLastStep ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinishTour}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs px-3 py-1.5 cursor-pointer"
              >
                Done
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={nextStep}
                rightIcon={<ArrowRight className="w-3 h-3" />}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs px-3 py-1.5 cursor-pointer"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
