import React, { useState, useRef, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import { useRole } from '../../context/RoleContext';
import { useTour } from '../../context/TourContext';
import { Avatar } from '../atoms/Avatar';
import { IconButton } from '../atoms/IconButton';
import { QuantiraLogo } from '../atoms/Logo';
import { getEffectiveAvatar } from '../../utils/radianAvatars';
import {
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Compass,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenGlobalSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar
}) => {
  const { currentUser: onboardingUser, tasks, candidates, navigateTo } = useOnboarding();
  const { currentRole, currentUser: roleUser, logout } = useRole();
  const { mode, toggleTheme } = useTheme();
  const { startTour } = useTour();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [avatarTick, setAvatarTick] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Real-time photo & avatar synchronization
  useEffect(() => {
    const handleAvatarUpdate = () => setAvatarTick((t) => t + 1);
    window.addEventListener('quantira_profile_photo_updated', handleAvatarUpdate);
    window.addEventListener('storage', handleAvatarUpdate);
    return () => {
      window.removeEventListener('quantira_profile_photo_updated', handleAvatarUpdate);
      window.removeEventListener('storage', handleAvatarUpdate);
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed');
  const recentArrivals = candidates.filter((c) => c.status === 'orientation_scheduled' || c.status === 'verification');

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between h-18 px-4 sm:px-8">
        {/* Left side: Logo */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigateTo('dashboard')}
          >
            {/* Desktop / Tablet view: Full Theme-Adaptive SVG Logo with subtitle badge */}
            <div className="hidden sm:flex items-center gap-3">
              <QuantiraLogo variant="full" className="h-8" imgClassName="h-8 w-auto" />
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                HR Portal
              </span>
            </div>

            {/* Mobile view: Compact PNG Icon with text */}
            <div className="flex sm:hidden items-center gap-2">
              <QuantiraLogo variant="icon" className="w-8 h-8" imgClassName="w-8 h-8" />
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                Quantira
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">

          {/* Product Tour Guide Launcher */}
          <button
            type="button"
            data-tour="header-tour-btn"
            onClick={() => startTour()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Launch Interactive Product Tour"
          >
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Tour Guide</span>
          </button>

          {/* Theme Toggle Button */}
          <div data-tour="header-theme-toggle">
            <IconButton
              icon={
                mode === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
                )
              }
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
            />
          </div>

          {/* Notification Menu */}
          <div ref={notifRef} className="relative" data-tour="header-notifications">
            <div className="relative">
              <IconButton
                icon={<Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />}
                aria-label={`View notifications (${urgentTasks.length} urgent tasks)`}
                onClick={() => setIsNotifOpen((prev) => !prev)}
              />
              {urgentTasks.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 pointer-events-none animate-pulse" />
              )}
            </div>

            {isNotifOpen && (
              <div
                role="region"
                aria-label="Notifications"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 text-left animate-fade-in z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Notifications & Alerts
                    </span>
                    {urgentTasks.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {urgentTasks.length} Urgent
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">Live feed</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 py-2">
                  {urgentTasks.length === 0 && recentArrivals.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      All onboarding tasks and alerts are caught up!
                    </div>
                  ) : (
                    <>
                      {urgentTasks.map((t) => (
                        <div
                          key={t.id}
                          className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded cursor-pointer transition-colors"
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigateTo('tasks');
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {t.title}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Candidate: {t.candidateName || 'General'} • Due {t.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {recentArrivals.map((c) => (
                        <div
                          key={c.id}
                          className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded cursor-pointer transition-colors"
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigateTo('detail', c.id);
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            <Building2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {c.firstName} {c.lastName} ({c.jobTitle})
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Starts {c.startDate} • {c.progress}% completed
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigateTo('tasks');
                    }}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All Onboarding Checklist Tasks →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          {(() => {
            const userName = roleUser?.name || onboardingUser?.name;
            const activeUser = {
              name: userName,
              roleTitle: roleUser?.roleTitle || onboardingUser?.roleTitle,
              email: roleUser?.email || onboardingUser?.email,
              avatar: getEffectiveAvatar({
                id: roleUser?.id || (currentRole === 'EMPLOYEE' ? 'usr-emp-john-doe' : undefined),
                name: userName,
                avatar: roleUser?.avatar || onboardingUser?.avatar
              })
            };

            return (
              <div ref={userMenuRef} className="relative" data-tour="header-user-menu">
                <button
                  type="button"
                  data-tour="header-user-menu-btn"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label={`User account menu for ${activeUser.name} (${activeUser.roleTitle})`}
                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors cursor-pointer"
                >
                  <Avatar src={activeUser.avatar} name={activeUser.name} size="sm" status="online" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {activeUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      {activeUser.roleTitle}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" aria-hidden="true" />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    aria-label="User profile and role switcher"
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-3 text-left animate-fade-in z-50"
                  >
                    {/* Active user info */}
                    <div className="pb-3 mb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <Avatar src={activeUser.avatar} name={activeUser.name} size="md" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {activeUser.name}
                        </span>
                        <a
                          href={`mailto:${activeUser.email}`}
                          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate transition-colors"
                          title={`Send email to ${activeUser.email}`}
                        >
                          {activeUser.email}
                        </a>
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                          {activeUser.roleTitle}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          startTour();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        ✨ Take Product Tour
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigateTo('profile');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        My Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigateTo('settings');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
                      >
                        Portal Preferences & Settings
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </header>
  );
};
