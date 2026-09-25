import React from 'react';
import { AuditLogEntry } from '../../types/candidate';
import { formatDateTime } from '../../utils/formatters';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AuditTimelineProps {
  logs: AuditLogEntry[];
  className?: string;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs, className }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">
        No audit log entries recorded yet.
      </div>
    );
  }

  const getIcon = (type?: AuditLogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />;
    }
  };

  return (
    <ol className={cn('relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6 text-left', className)}>
      {logs.map((log) => (
        <li key={log.id} className="relative pl-6">
          {/* Dot */}
          <span className="absolute -left-2.5 top-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs">
            {getIcon(log.type)}
          </span>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {log.action}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {formatDateTime(log.timestamp)}
              </span>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              By <strong className="font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">{log.user}</strong>
            </span>

            {log.details && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-800">
                {log.details}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
