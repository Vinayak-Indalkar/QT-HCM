import React, { useState } from 'react';
import { Header } from '../organisms/Header';
import { Sidebar } from '../organisms/Sidebar';
import { GlobalSearchModal } from '../organisms/GlobalSearchModal';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-950 text-slate-900 dark:text-white dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Top Application Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
      />

      {/* Main Container - Full Width */}
      <div className="flex-1 flex w-full">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Viewport - offset by sidebar width on desktop */}
        <main
          id="main-content"
          role="main"
          className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full lg:ml-72"
        >
          {children}
        </main>
      </div>

      {/* Global Quick Search Palette Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      {/* Enterprise Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 sm:px-8 text-xs text-slate-500 dark:text-slate-400 text-center lg:pl-78">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center justify-center gap-1.5">
            <img src="/logos/png/icon-color.png" alt="" className="w-3.5 h-3.5 object-contain dark:hidden" />
            <img src="/logos/png/icon-white.png" alt="" className="w-3.5 h-3.5 object-contain hidden dark:inline-block" />
            © {new Date().getFullYear()} Quantira Technologies Inc. • Enterprise Employee Onboarding Portal
          </span>
          <div className="flex items-center gap-4">
            <span>WCAG 2.2 Level AA Compliant</span>
            <span>•</span>
            <span>Salt Design System Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
