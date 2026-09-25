import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import { Search, User, CheckSquare, ArrowRight, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const { candidates, tasks, navigateTo } = useOnboarding();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCandidates = query.trim()
    ? candidates.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query.toLowerCase()) ||
          c.lastName.toLowerCase().includes(query.toLowerCase()) ||
          c.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
          c.department.toLowerCase().includes(query.toLowerCase())
      )
    : candidates.slice(0, 4);

  const filteredTasks = query.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : tasks.slice(0, 3);

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      style={{ paddingTop: '400px' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global quick navigation search"
        style={{ height: '600px', maxHeight: '600px' }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in flex flex-col text-left"
      >
        {/* Search header */}
        <div className="shrink-0 flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Type candidate name, department, role, or task..."
            className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search candidates and tasks"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            aria-label="Close search modal"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Results List with Inline Scroller */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
          {/* Candidates Section */}
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
              Candidates ({filteredCandidates.length})
            </span>
            {filteredCandidates.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">No candidates match.</div>
            ) : (
              <div className="space-y-1">
                {filteredCandidates.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigateTo('detail', c.id);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600">
                        <User className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {c.jobTitle} • {c.department} ({c.status.replace(/_/g, ' ')})
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider px-2 block mb-1">
              Checklist Tasks ({filteredTasks.length})
            </span>
            {filteredTasks.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">No tasks match.</div>
            ) : (
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigateTo('tasks');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600">
                        <CheckSquare className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Assignee: {t.assignee.name} • Due {t.dueDate}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to exit</span>
          <span>Jump to any candidate or onboarding task</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
