import React from 'react';

/**
 * Reusable page skeleton component for React.Suspense fallback
 * during route lazy loading. Matches enterprise layout design tokens.
 */
export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full animate-pulse p-2 sm:p-4 text-left">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Metric / Filter row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main content table/grid skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xs">
        <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between px-4 gap-4"
            >
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700/60 rounded" />
              <div className="h-4 w-1/6 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/6 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
