import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../../types/auth';
import {
  moveDashletForPersona,
  removeDashletFromPersona,
  setDashletSizeForPersona,
  DashletColSpan,
  DashletHeightPreset,
  DashboardPersona
} from '../../services/dashboardCustomizationService';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  EyeOff,
  GripVertical,
  Maximize2,
  Columns,
  Rows,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DashletCardWrapperProps {
  id: string;
  title?: string;
  role: DashboardPersona;
  index: number;
  total: number;
  isCustomizing: boolean;
  colSpan?: DashletColSpan;
  heightPreset?: DashletHeightPreset;
  customHeight?: number;
  onLayoutUpdated?: () => void;
  children: React.ReactNode;
  className?: string;
}

const getResolvedHeightPx = (preset?: DashletHeightPreset, custom?: number): number => {
  if (custom && custom > 0) return custom;
  if (preset === 'compact') return 140;
  if (preset === 'tall') return 440;
  return 260; // normal
};

export const DashletCardWrapper: React.FC<DashletCardWrapperProps> = ({
  id,
  title,
  role,
  index,
  total,
  isCustomizing,
  colSpan = 3,
  heightPreset = 'normal',
  customHeight,
  onLayoutUpdated,
  children,
  className
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Active live sizes (supports instant real-time drag and stepper updates)
  const [isDragging, setIsDragging] = useState(false);
  const [liveColSpan, setLiveColSpan] = useState<DashletColSpan>(colSpan);
  const [liveHeight, setLiveHeight] = useState<number>(() =>
    getResolvedHeightPx(heightPreset, customHeight)
  );

  useEffect(() => {
    if (!isDragging) {
      setLiveColSpan(colSpan);
      setLiveHeight(getResolvedHeightPx(heightPreset, customHeight));
    }
  }, [colSpan, heightPreset, customHeight, isDragging]);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom') => {
    moveDashletForPersona(role, id, direction);
    onLayoutUpdated?.();
  };

  const handleRemove = () => {
    removeDashletFromPersona(role, id);
    onLayoutUpdated?.();
  };

  const handleWidthChange = (newSpan: DashletColSpan) => {
    const clamped = Math.max(1, Math.min(12, newSpan)) as DashletColSpan;
    setLiveColSpan(clamped);
    setDashletSizeForPersona(role, id, clamped, heightPreset, liveHeight);
    onLayoutUpdated?.();
  };

  const handleStepWidth = (delta: number) => {
    const nextSpan = Math.max(1, Math.min(12, liveColSpan + delta)) as DashletColSpan;
    handleWidthChange(nextSpan);
  };

  const handleHeightPresetChange = (preset: DashletHeightPreset) => {
    const presetPx = preset === 'compact' ? 140 : preset === 'tall' ? 440 : 260;
    setLiveHeight(presetPx);
    setDashletSizeForPersona(role, id, liveColSpan, preset, presetPx);
    onLayoutUpdated?.();
  };

  const handleStepHeight = (deltaPx: number) => {
    const newPx = Math.max(120, Math.min(900, liveHeight + deltaPx));
    setLiveHeight(newPx);
    setDashletSizeForPersona(role, id, liveColSpan, 'custom', newPx);
    onLayoutUpdated?.();
  };

  const handleResetSize = () => {
    const defaultSpan: DashletColSpan = 3;
    const defaultHeight = 260;
    setLiveColSpan(defaultSpan);
    setLiveHeight(defaultHeight);
    setDashletSizeForPersona(role, id, defaultSpan, 'normal', defaultHeight);
    onLayoutUpdated?.();
  };

  // Drag start handler for corner, right edge, and bottom edge
  const handleStartResize = (e: React.MouseEvent, type: 'corner' | 'right' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();

    if (!cardRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const cardRect = cardRef.current.getBoundingClientRect();
    const startWidth = cardRect.width;
    const startHeight = cardRect.height;
    const parentContainer = cardRef.current.parentElement;
    const parentWidth = parentContainer ? parentContainer.getBoundingClientRect().width : window.innerWidth;
    const singleColWidth = parentWidth / 12;

    setIsDragging(true);

    let finalColSpan = liveColSpan;
    let finalHeightPx = liveHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (type === 'right' || type === 'corner') {
        const computedWidth = Math.max(singleColWidth, startWidth + deltaX);
        const computedCols = Math.max(1, Math.min(12, Math.round(computedWidth / singleColWidth))) as DashletColSpan;
        setLiveColSpan(computedCols);
        finalColSpan = computedCols;
      }

      if (type === 'bottom' || type === 'corner') {
        const computedHeight = Math.max(120, Math.min(900, Math.round(startHeight + deltaY - 80)));
        setLiveHeight(computedHeight);
        finalHeightPx = computedHeight;
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);

      setDashletSizeForPersona(
        role,
        id,
        finalColSpan,
        type === 'right' ? heightPreset : 'custom',
        finalHeightPx
      );
      onLayoutUpdated?.();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const widthPercentage = Math.round((liveColSpan / 12) * 100);

  if (!isCustomizing) {
    return (
      <div
        className={cn('w-full flex flex-col', className)}
        style={{ minHeight: `${liveHeight}px`, height: `${liveHeight}px` }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative group rounded-2xl transition-all duration-100 border-2 border-dashed bg-blue-50/25 dark:bg-blue-950/20 p-2 sm:p-2.5 shadow-xs flex flex-col justify-between select-none',
        isDragging
          ? 'border-blue-600 dark:border-blue-400 ring-4 ring-blue-500/20 shadow-lg'
          : 'border-blue-400/80 dark:border-blue-500/80 hover:border-blue-500 hover:shadow-md',
        className
      )}
      style={{ minHeight: `${liveHeight + 85}px` }}
    >
      {/* Customizer Directional & Sizing Control Bar */}
      <div className="space-y-1.5 mb-2 relative z-10">
        {/* Row 1: Item Info & 6-Way Directional Move Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-blue-200 dark:border-blue-900/70 shadow-xs backdrop-blur-xs text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-3.5 h-3.5 text-blue-500 shrink-0 cursor-grab" />
            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] shrink-0">
              #{index + 1}
            </span>
            {title && (
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px] max-w-[130px] sm:max-w-[180px]">
                {title}
              </span>
            )}
          </div>

          {/* 6-Way Directional Move Controls */}
          <div className="flex items-center gap-1 shrink-0 flex-wrap">
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

        {/* Row 2: Manual Granular Width & Height Adjustment Controls */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 text-[10px]">
          {/* Manual Width Stepper + Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Columns className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Width:
            </span>

            <div className="inline-flex items-center rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
              <button
                type="button"
                disabled={liveColSpan <= 1}
                onClick={() => handleStepWidth(-1)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
                title="Decrease width by 1 column"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="px-1.5 py-0.5 font-extrabold text-[10px] text-blue-700 dark:text-blue-300 min-w-[58px] text-center">
                {liveColSpan}/12 ({widthPercentage}%)
              </span>
              <button
                type="button"
                disabled={liveColSpan >= 12}
                onClick={() => handleStepWidth(1)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
                title="Increase width by 1 column"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="hidden sm:inline-flex rounded-md shadow-2xs bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
              {([
                { span: 3 as DashletColSpan, label: '1/4' },
                { span: 4 as DashletColSpan, label: '1/3' },
                { span: 6 as DashletColSpan, label: '1/2' },
                { span: 8 as DashletColSpan, label: '2/3' },
                { span: 12 as DashletColSpan, label: 'Full' }
              ]).map(({ span, label }) => {
                const isSelected = liveColSpan === span;
                return (
                  <button
                    key={span}
                    type="button"
                    onClick={() => handleWidthChange(span)}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                    )}
                    title={`Set width to ${span} columns (${label})`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Height Stepper + Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Rows className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Height:
            </span>

            <div className="inline-flex items-center rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shadow-2xs">
              <button
                type="button"
                disabled={liveHeight <= 120}
                onClick={() => handleStepHeight(-30)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Decrease height by 30px"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="px-1.5 py-0.5 font-extrabold text-[10px] text-indigo-700 dark:text-indigo-300 min-w-[50px] text-center">
                {liveHeight}px
              </span>
              <button
                type="button"
                disabled={liveHeight >= 900}
                onClick={() => handleStepHeight(30)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Increase height by 30px"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="hidden sm:inline-flex rounded-md shadow-2xs bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
              {([
                { preset: 'compact' as DashletHeightPreset, label: 'Compact' },
                { preset: 'normal' as DashletHeightPreset, label: 'Normal' },
                { preset: 'tall' as DashletHeightPreset, label: 'Tall' }
              ]).map(({ preset, label }) => {
                const targetPx = preset === 'compact' ? 140 : preset === 'tall' ? 440 : 260;
                const isSelected = liveHeight === targetPx;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleHeightPresetChange(preset)}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                    )}
                    title={`Set card height preset to ${preset} (${targetPx}px)`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleResetSize}
              className="p-1 rounded text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ml-0.5"
              title="Reset width & height to default"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Drag Sizing Overlay Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/15 dark:bg-blue-400/15 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-40 pointer-events-none border-2 border-blue-600">
          <div className="bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-pulse">
            <Maximize2 className="w-4 h-4 text-blue-400" />
            <span>Width: {liveColSpan}/12 cols ({widthPercentage}%) &bull; Height: {liveHeight}px</span>
          </div>
        </div>
      )}

      {/* The actual Dashlet Content */}
      <div
        className="pointer-events-none sm:pointer-events-auto opacity-95 w-full flex flex-col relative z-0 overflow-hidden"
        style={{ minHeight: `${liveHeight}px`, height: `${liveHeight}px` }}
      >
        {children}
      </div>

      {/* INTERACTIVE DRAG RESIZE HANDLES */}
      {/* 1. Right Edge Drag Handle (Width) */}
      <div
        onMouseDown={(e) => handleStartResize(e, 'right')}
        className="absolute top-8 right-0 bottom-8 w-3 cursor-col-resize hover:bg-blue-500/30 active:bg-blue-600/50 rounded-r-2xl transition-colors z-20 flex items-center justify-center group/rhandle"
        title="Drag left/right to adjust card width across 12-column grid"
      >
        <div className="w-1 h-8 rounded-full bg-blue-400/60 group-hover/rhandle:bg-blue-600 transition-colors" />
      </div>

      {/* 2. Bottom Edge Drag Handle (Height) */}
      <div
        onMouseDown={(e) => handleStartResize(e, 'bottom')}
        className="absolute bottom-0 left-8 right-8 h-3 cursor-row-resize hover:bg-blue-500/30 active:bg-blue-600/50 rounded-b-2xl transition-colors z-20 flex items-center justify-center group/bhandle"
        title="Drag up/down to adjust card height manually"
      >
        <div className="h-1 w-12 rounded-full bg-blue-400/60 group-hover/bhandle:bg-blue-600 transition-colors" />
      </div>

      {/* 3. Bottom-Right Corner Drag Handle (Width + Height) */}
      <div
        onMouseDown={(e) => handleStartResize(e, 'corner')}
        className="absolute bottom-1 right-1 w-6 h-6 cursor-se-resize bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-xl rounded-tl-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform z-30"
        title="Drag corner to manually resize both Width and Height simultaneously"
      >
        <Maximize2 className="w-3 h-3 transform rotate-90" />
      </div>
    </div>
  );
};
