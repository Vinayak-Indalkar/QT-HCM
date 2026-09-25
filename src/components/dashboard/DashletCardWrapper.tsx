import React from 'react';
import { UserRole } from '../../types/auth';
import { moveDashletForPersona, removeDashletFromPersona } from '../../services/dashboardCustomizationService';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DashletCardWrapperProps {
  id: string;
  title?: string;
  role: UserRole;
  index: number;
  total: number;
  isCustomizing: boolean;
  onLayoutUpdated?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const DashletCardWrapper: React.FC<DashletCardWrapperProps> = ({
  id,
  title,
  role,
  index,
  total,
  isCustomizing,
  onLayoutUpdated,
  children,
  className
}) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom') => {
    moveDashletForPersona(role, id, direction);
    onLayoutUpdated?.();
  };

  const handleRemove = () => {
    removeDashletFromPersona(role, id);
    onLayoutUpdated?.();
  };

  if (!isCustomizing) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        'relative group rounded-2xl transition-all duration-200 border-2 border-dashed border-blue-400/80 dark:border-blue-500/80 bg-blue-50/20 dark:bg-blue-950/20 p-2 sm:p-2.5 shadow-sm hover:shadow-md hover:border-blue-500',
        className
      )}
    >
      {/* Customizer Directional Bar on each Dashlet */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 py-1.5 mb-2 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-blue-200 dark:border-blue-900/70 shadow-xs backdrop-blur-xs text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-blue-500 shrink-0 cursor-grab" />
          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] shrink-0">
            #{index + 1}
          </span>
          {title && (
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px] max-w-[130px] sm:max-w-[200px]">
              {title}
            </span>
          )}
        </div>

        {/* 4-Way Directional Move & Position Controls */}
        <div className="flex items-center gap-1 shrink-0 flex-wrap">
          {/* Top (To Very Top) */}
          <button
            type="button"
            disabled={isFirst}
            onClick={() => handleMove('top')}
            className={cn(
              'p-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer',
              isFirst
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900'
            )}
            title="Move to Very Top"
          >
            <ChevronsUp className="w-3 h-3" />
            <span className="hidden md:inline">Top</span>
          </button>

          {/* Move Up */}
          <button
            type="button"
            disabled={isFirst}
            onClick={() => handleMove('up')}
            className={cn(
              'p-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer',
              isFirst
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900'
            )}
            title="Move Up"
          >
            <ArrowUp className="w-3 h-3" />
            <span className="hidden sm:inline">Up</span>
          </button>

          {/* Move Left */}
          <button
            type="button"
            disabled={isFirst}
            onClick={() => handleMove('left')}
            className={cn(
              'p-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer',
              isFirst
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900'
            )}
            title="Move Left"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Left</span>
          </button>

          {/* Move Right */}
          <button
            type="button"
            disabled={isLast}
            onClick={() => handleMove('right')}
            className={cn(
              'p-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer',
              isLast
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900'
            )}
            title="Move Right"
          >
            <span className="hidden sm:inline">Right</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={isLast}
            onClick={() => handleMove('down')}
            className={cn(
              'p-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer',
              isLast
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900'
            )}
            title="Move Down"
          >
            <span className="hidden sm:inline">Down</span>
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Bottom (To Very Bottom) */}
          <button
            type="button"
            disabled={isLast}
            onClick={() => handleMove('bottom')}
            className={cn(
              'p-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 transition-all cursor-pointer',
              isLast
                ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900'
            )}
            title="Move to Very Bottom"
          >
            <ChevronsDown className="w-3 h-3" />
            <span className="hidden md:inline">Bottom</span>
          </button>

          {/* Hide/Remove Dashlet Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer ml-0.5"
            title="Hide from this dashboard"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The actual Dashlet Content */}
      <div className="pointer-events-none sm:pointer-events-auto opacity-95">
        {children}
      </div>
    </div>
  );
};
