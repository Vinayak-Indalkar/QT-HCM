import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemData {
  id: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className
}) => {
  const [openIds, setOpenIds] = useState<string[]>(() =>
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-slate-200 dark:divide-slate-700 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `acc-header-${item.id}`;
        const panelId = `acc-panel-${item.id}`;

        return (
          <div key={item.id} className="text-left">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  {item.badge}
                </div>

                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ml-3',
                    isOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="p-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 animate-fade-in border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/50/40 dark:bg-slate-950/20"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
