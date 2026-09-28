import React from 'react';
import { useOnboarding, NavigationPage, ProfileTabId } from '../../context/OnboardingContext';
import { useRole } from '../../context/RoleContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CheckSquare,
  FileCheck2,
  BarChart3,
  Settings,
  X,
  Sparkles,
  LogOut,
  User,
  Sliders,
  Wrench,
  Laptop,
  FileText,
  LayoutGrid,
  MapPin,
  PhoneCall,
  Briefcase,
  AtSign,
  Lock,
  ChevronDown,
  ChevronRight,
  Building2,
  Building,
  ShieldCheck,
  Network,
  SlidersHorizontal,
  GitBranch
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const PROFILE_SUB_ITEMS: Array<{
  id: ProfileTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'basic', label: 'Basic Information', icon: User },
  { id: 'contact', label: 'Contact & Address', icon: MapPin },
  { id: 'emergency', label: 'Emergency Contact', icon: PhoneCall },
  { id: 'employment', label: 'Employment Information', icon: Briefcase },
  { id: 'reporting', label: 'Manager & Reporting', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'signature', label: 'Signature', icon: AtSign },
  { id: 'assets', label: 'Assets', icon: Laptop },
  { id: 'password', label: 'Change Password', icon: Lock }
];

export const CONFIG_SUB_ITEMS: Array<{
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'analytics', label: 'Module Customizer', icon: Sliders },
  { id: 'custom_dashboards', label: 'Custom Dashboards', icon: LayoutDashboard }
];

export const SETUP_SUB_ITEMS: Array<{
  id: NavigationPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'setup_organization', label: 'Organization', icon: Building2 },
  { id: 'setup_branches', label: 'Branches', icon: Building },
  { id: 'setup_structure', label: 'Organization Structure', icon: Network },
  { id: 'setup_users', label: 'Users', icon: Users },
  { id: 'setup_roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { id: 'setup_workflow', label: 'Workflow', icon: GitBranch }
];

import { useOnboardingFlow } from '../../context/OnboardingFlowContext';
import { getAssets } from '../../services/assetService';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, activeProfileTab, setActiveProfileTab, navigateTo, candidates, tasks } = useOnboarding();
  const { currentUser, logout, currentRole } = useRole();
  const { data: flowData } = useOnboardingFlow();
  const [isProfileExpanded, setIsProfileExpanded] = React.useState(true);
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(true);
  const [isSetupExpanded, setIsSetupExpanded] = React.useState(true);

  const activeCandidatesCount = candidates.filter(
    (c) => c.status !== 'completed' && c.status !== 'rejected'
  ).length;

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  const pendingDocsCount = candidates.reduce(
    (acc, c) => acc + c.documents.filter((d) => d.status === 'submitted').length,
    0
  );

  const managerAssignedCount = candidates.filter(
    (c) =>
      c.manager?.toLowerCase().includes('marcus') ||
      c.managerEmail?.toLowerCase().includes('brody') ||
      c.department?.toLowerCase() === 'engineering'
  ).length;

  const totalAssetsCount = React.useMemo(() => {
    return getAssets().length;
  }, []);

  interface NavItem {
    id: NavigationPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeText?: string;
    badgeColor?: string;
  }

  // Dynamically tailor menus per role (10-Step Onboarding is one-time via invite link only)
  const navItems: NavItem[] = React.useMemo(() => {
    // 1. Employee User: Dashboard, Onboarding Wizard & My Profile
    if (currentRole === 'EMPLOYEE') {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'wizard',
          label: 'Onboarding Wizard',
          icon: Sparkles
        },
        {
          id: 'profile',
          label: 'My Profile',
          icon: User
        }
      ];
    }

    // 2. Manager User: Dashboard, My Profile & My Team
    if (currentRole === 'MANAGER') {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'profile',
          label: 'My Profile',
          icon: User
        },
        {
          id: 'directory',
          label: 'My Team',
          icon: Users,
          count: managerAssignedCount,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
        }
      ];
    }

    // 3. Super Admin: Dashboard, My Profile, My Team, Employees, Assets, Documents, Setup, Settings, Configurations
    if (currentRole === 'SUPER_ADMIN') {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'profile',
          label: 'My Profile',
          icon: User
        },
        {
          id: 'directory',
          label: 'My Team',
          icon: Users,
          count: managerAssignedCount,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
        },
        {
          id: 'candidates',
          label: 'Employees',
          icon: Users,
          count: activeCandidatesCount,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
        },
        {
          id: 'assets',
          label: 'Assets',
          icon: Laptop,
          count: totalAssetsCount,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
        },
        {
          id: 'compliance',
          label: 'Documents',
          icon: FileText
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings
        },
        {
          id: 'analytics',
          label: 'Configurations',
          icon: Sliders
        }
      ];
    }

    // 4. Default: HR User: Dashboard, My Profile, My Team, Employees, Assets, Documents, & Settings
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
      },
      {
        id: 'profile',
        label: 'My Profile',
        icon: User
      },
      {
        id: 'directory',
        label: 'My Team',
        icon: Users,
        count: managerAssignedCount,
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
      },
      {
        id: 'candidates',
        label: 'Employees',
        icon: Users,
        count: activeCandidatesCount,
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
      },
      {
        id: 'assets',
        label: 'Assets',
        icon: Laptop,
        count: totalAssetsCount,
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
      },
      {
        id: 'compliance',
        label: 'Documents',
        icon: FileText
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings
      }
    ];
  }, [currentRole, activeCandidatesCount, managerAssignedCount, candidates.length, totalAssetsCount]);

  const handleNavClick = (pageId: NavigationPage) => {
    navigateTo(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[72px] z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel - Fixed, positioned right below top navigation without hovering over it */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed top-[72px] left-0 bottom-0 z-30 h-[calc(100vh-72px)] w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              Navigation
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider px-3 block mb-2 text-left">
              Onboarding Core
            </span>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isProfileItem = item.id === 'profile';
                const isProfileActive = isProfileItem && activePage === 'profile';
                const isConfigItem = item.id === 'analytics';
                const isConfigActive = isConfigItem && (activePage === 'analytics' || activePage === 'custom_dashboards');
                const isSetupItem = item.id === 'setup';
                const isSetupActive = isSetupItem && (activePage === 'setup' || activePage.startsWith('setup_'));
                const isActive = isProfileItem ? isProfileActive : isConfigItem ? isConfigActive : isSetupItem ? isSetupActive : activePage === item.id;
                const IconComponent = item.icon;

                if (isProfileItem) {
                  return (
                    <div key={item.id} className="space-y-1" data-tour="nav-profile">
                      <button
                        type="button"
                        data-tour="nav-profile-btn"
                        onClick={() => {
                          if (!isProfileActive) {
                            navigateTo('profile');
                            setIsProfileExpanded(true);
                          } else {
                            setIsProfileExpanded((prev) => !prev);
                          }
                        }}
                        aria-current={isProfileActive ? 'page' : undefined}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                          isProfileActive
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={cn(
                              'w-4.5 h-4.5 shrink-0',
                              isProfileActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                            )}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </div>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileExpanded((prev) => !prev);
                          }}
                          className={cn(
                            'p-1 rounded-md transition-colors',
                            isProfileActive ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                          )}
                          title={isProfileExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                        >
                          {isProfileExpanded ? (
                            <ChevronDown className={cn('w-4 h-4', isProfileActive ? 'text-white' : 'text-slate-400')} />
                          ) : (
                            <ChevronRight className={cn('w-4 h-4', isProfileActive ? 'text-white' : 'text-slate-400')} />
                          )}
                        </span>
                      </button>

                      {/* My Profile Sub-menu for All Users */}
                      {isProfileExpanded && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
                          {PROFILE_SUB_ITEMS.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = isProfileActive && activeProfileTab === subItem.id;

                            return (
                              <button
                                key={subItem.id}
                                type="button"
                                data-tour={`profile-tab-${subItem.id}`}
                                onClick={() => {
                                  setActiveProfileTab(subItem.id);
                                  navigateTo('profile', undefined, subItem.id);
                                  if (window.innerWidth < 1024) {
                                    onClose();
                                  }
                                }}
                                className={cn(
                                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                                  isSubActive
                                    ? 'bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                )}
                              >
                                <SubIcon
                                  className={cn(
                                    'w-3.5 h-3.5 shrink-0',
                                    isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                if (isConfigItem) {
                  return (
                    <div key={item.id} className="space-y-1" data-tour="nav-analytics">
                      <button
                        type="button"
                        data-tour="nav-analytics-btn"
                        onClick={() => {
                          if (!isConfigActive) {
                            navigateTo('analytics');
                            setIsConfigExpanded(true);
                          } else {
                            setIsConfigExpanded((prev) => !prev);
                          }
                        }}
                        aria-current={isConfigActive ? 'page' : undefined}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                          isConfigActive
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={cn(
                              'w-4.5 h-4.5 shrink-0',
                              isConfigActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                            )}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </div>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsConfigExpanded((prev) => !prev);
                          }}
                          className={cn(
                            'p-1 rounded-md transition-colors',
                            isConfigActive ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                          )}
                          title={isConfigExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                        >
                          {isConfigExpanded ? (
                            <ChevronDown className={cn('w-4 h-4', isConfigActive ? 'text-white' : 'text-slate-400')} />
                          ) : (
                            <ChevronRight className={cn('w-4 h-4', isConfigActive ? 'text-white' : 'text-slate-400')} />
                          )}
                        </span>
                      </button>

                      {/* Configurations Sub-menu */}
                      {isConfigExpanded && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
                          {CONFIG_SUB_ITEMS.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = activePage === subItem.id;

                            return (
                              <button
                                key={subItem.id}
                                type="button"
                                data-tour={subItem.id === 'custom_dashboards' ? 'nav-custom-dashboards' : `nav-${subItem.id}`}
                                onClick={() => {
                                  navigateTo(subItem.id);
                                  if (window.innerWidth < 1024) {
                                    onClose();
                                  }
                                }}
                                className={cn(
                                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                                  isSubActive
                                    ? 'bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                )}
                              >
                                <SubIcon
                                  className={cn(
                                    'w-3.5 h-3.5 shrink-0',
                                    isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                if (isSetupItem) {
                  return (
                    <div key={item.id} className="space-y-1" data-tour="nav-setup">
                      <button
                        type="button"
                        data-tour="nav-setup-btn"
                        onClick={() => {
                          if (!isSetupActive) {
                            navigateTo('setup_organization');
                            setIsSetupExpanded(true);
                          } else {
                            setIsSetupExpanded((prev) => !prev);
                          }
                        }}
                        aria-current={isSetupActive ? 'page' : undefined}
                        className={cn(
                          'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                          isSetupActive
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent
                            className={cn(
                              'w-4.5 h-4.5 shrink-0',
                              isSetupActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                            )}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </div>

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSetupExpanded((prev) => !prev);
                          }}
                          className={cn(
                            'p-1 rounded-md transition-colors',
                            isSetupActive ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                          )}
                          title={isSetupExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                        >
                          {isSetupExpanded ? (
                            <ChevronDown className={cn('w-4 h-4', isSetupActive ? 'text-white' : 'text-slate-400')} />
                          ) : (
                            <ChevronRight className={cn('w-4 h-4', isSetupActive ? 'text-white' : 'text-slate-400')} />
                          )}
                        </span>
                      </button>

                      {/* Setup Sub-menu */}
                      {isSetupExpanded && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
                          {SETUP_SUB_ITEMS.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = activePage === subItem.id || (activePage === 'setup' && subItem.id === 'setup_organization');

                            return (
                              <button
                                key={subItem.id}
                                type="button"
                                data-tour={`nav-${subItem.id}`}
                                onClick={() => {
                                  navigateTo(subItem.id);
                                  if (window.innerWidth < 1024) {
                                    onClose();
                                  }
                                }}
                                className={cn(
                                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                                  isSubActive
                                    ? 'bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                )}
                              >
                                <SubIcon
                                  className={cn(
                                    'w-3.5 h-3.5 shrink-0',
                                    isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{subItem.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-tour={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={cn(
                          'w-4.5 h-4.5 shrink-0',
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badgeText && (
                      <span
                        className={cn(
                          'px-2.5 py-0.5 text-xs font-bold rounded-full',
                          isActive
                            ? 'bg-blue-700/90 text-white'
                            : item.badgeColor || 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        )}
                      >
                        {item.badgeText}
                      </span>
                    )}

                    {item.count !== undefined && item.count > 0 && !item.badgeText && (
                      <span
                        className={cn(
                          'px-2.5 py-0.5 text-xs font-bold rounded-full',
                          isActive
                            ? 'bg-blue-700/90 text-white'
                            : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 dark:text-slate-300'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Sign Out */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer"
            aria-label="Sign out of your account"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
