import React from 'react';
import { UserRole } from '../../types/auth';
import {
  resetPersonaLayout
} from '../../services/dashboardCustomizationService';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import {
  Sliders,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DashboardCustomizerToolbarProps {
  role: UserRole;
  isCustomizing: boolean;
  onToggleCustomizing: () => void;
  activeDashletsCount: number;
  onLayoutUpdated?: () => void;
  className?: string;
}

export const DashboardCustomizerToolbar: React.FC<DashboardCustomizerToolbarProps> = ({
  role,
  isCustomizing,
  onToggleCustomizing,
  activeDashletsCount,
  onLayoutUpdated,
  className
}) => {
  const handleReset = () => {
    resetPersonaLayout(role);
    onLayoutUpdated?.();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Top Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              {role.replace('_', ' ')} Dashboard Layout
            </span>
            <span className="text-slate-400 ml-1.5">
              ({activeDashletsCount} Active Dashlets)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCustomizing && (
            <IconButton
              variant="secondary"
              size="sm"
              onClick={handleReset}
              icon={<RefreshCw className="w-4 h-4" />}
              aria-label="Reset Layout"
            />
          )}

          <Button
            variant={isCustomizing ? 'primary' : 'secondary'}
            size="sm"
            onClick={onToggleCustomizing}
            leftIcon={<Sliders className="w-3.5 h-3.5" />}
            className={cn(
              'text-xs font-bold transition-all cursor-pointer',
              isCustomizing
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-200'
            )}
          >
            {isCustomizing ? 'Done Customizing' : 'Customize Dashboard'}
          </Button>
        </div>
      </div>

      {/* Customize Mode Instruction Notice */}
      {isCustomizing && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Full Layout Movement Active:</strong> Use the <strong>Top, Bottom, Left, Right, Up,</strong> and <strong>Down</strong> controls on any dashlet to move it everywhere, or click <strong>Hide</strong> to remove it.
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleCustomizing}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-3 cursor-pointer"
          >
            Exit &amp; Save
          </button>
        </div>
      )}
    </div>
  );
};
