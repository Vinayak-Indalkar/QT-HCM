import React from 'react';
import { ONBOARDING_STEPS, OnboardingStepId } from '../../types/onboarding';
import { Check, ChevronRight, User, ShieldCheck, Briefcase, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface OnboardingStepperProps {
  currentStepIndex: number;
  completedSteps: OnboardingStepId[];
  onSelectStep: (index: number) => void;
  className?: string;
}

const STEP_ICONS = [User, ShieldCheck, Briefcase, CheckCircle2];

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStepIndex,
  completedSteps,
  onSelectStep,
  className
}) => {
  const progressPercent = Math.round(((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100);

  return (
    <nav
      aria-label="Onboarding Progress Stepper"
      className={cn(
        'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3',
        className
      )}
    >
      {/* Mobile view: Compact current step indicator */}
      <div className="flex md:hidden items-center justify-between gap-3 text-left">
        <div className="flex flex-col min-w-0">
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {ONBOARDING_STEPS[currentStepIndex].shortTitle}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {ONBOARDING_STEPS[currentStepIndex].includes}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {progressPercent}%
          </span>
          <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Desktop / Tablet view: 4 distinct groups */}
      <div className="hidden md:grid md:grid-cols-4 gap-2.5 items-center">
        {ONBOARDING_STEPS.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isCompleted = completedSteps.includes(step.id);
          const isPast = idx < currentStepIndex;
          const Icon = STEP_ICONS[idx] || User;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(idx)}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 select-none border',
                isCurrent
                  ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 shadow-2xs'
                  : isCompleted || isPast
                  ? 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-800'
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-70'
              )}
            >
              {/* Step Circle with Icon / Checkmark */}
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all font-bold text-xs',
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCompleted || isPast
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}
                aria-hidden="true"
              >
                {isCompleted || isPast ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Title & Descriptors */}
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  'text-sm font-bold truncate leading-snug',
                  isCurrent
                    ? 'text-blue-900 dark:text-blue-200 font-extrabold'
                    : 'text-slate-800 dark:text-slate-200'
                )}>
                  {step.shortTitle}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                  {step.includes}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual progress bar across all 4 steps */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-linear-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </nav>
  );
};
