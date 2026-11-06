import React from 'react';
import { useOnboarding, NavigationPage, ProfileTabId } from '../../context/OnboardingContext';
import { useRole } from '../../context/RoleContext';
import {
  LayoutDashboard,
  Users,
  Settings,
  Sparkles,
  LogOut,
  User,
  Sliders,
  Laptop,
  FileText,
  LayoutGrid,
  MapPin,
  PhoneCall,
  Briefcase,
  AtSign,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Building2,
  Building,
  ShieldCheck,
  Network,
  GitBranch,
  Waves,
  Palette,
  HelpCircle
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

import { getAssets } from '../../services/assetService';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, activeProfileTab, setActiveProfileTab, navigateTo, candidates } = useOnboarding();
  const { currentUser, logout, currentRole } = useRole();
  const [isProfileExpanded, setIsProfileExpanded] = React.useState(true);
  const [isConfigExpanded, setIsConfigExpanded] = React.useState(true);
  const [isSetupExpanded, setIsSetupExpanded] = React.useState(true);

  const activeCandidatesCount = candidates.filter(
    (c) => c.status !== 'completed' && c.status !== 'rejected'
  ).length;

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
  }

  // Split into CORE MODULES and CONFIGURATION (matching the exact AquaPulse / Devi Fisheries layout)
  const { coreNavItems, configNavItems } = React.useMemo<{
    coreNavItems: NavItem[];
    configNavItems: NavItem[];
  }>(() => {
    // 1. Employee User
    if (currentRole === 'EMPLOYEE') {
      return {
        coreNavItems: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'wizard', label: 'Onboarding Wizard', icon: Sparkles }
        ],
        configNavItems: [
          { id: 'settings', label: 'Help & Support', icon: HelpCircle },
          { id: 'analytics', label: 'AquaPulse DS', icon: Palette, badgeText: 'v1.2' }
        ]
      };
    }

    // 2. Manager User
    if (currentRole === 'MANAGER') {
      return {
        coreNavItems: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'directory', label: 'My Team', icon: Users, count: managerAssignedCount }
        ],
        configNavItems: [
          { id: 'settings', label: 'Help & Support', icon: HelpCircle },
          { id: 'analytics', label: 'AquaPulse DS', icon: Palette, badgeText: 'v1.2' }
        ]
      };
    }

    // 3. Super Admin User
    if (currentRole === 'SUPER_ADMIN') {
      return {
        coreNavItems: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'directory', label: 'My Team', icon: Users, count: managerAssignedCount },
          { id: 'candidates', label: 'Employees', icon: Users, count: activeCandidatesCount },
          { id: 'assets', label: 'Assets', icon: Laptop, count: totalAssetsCount },
          { id: 'compliance', label: 'Documents', icon: FileText }
        ],
        configNavItems: [
          { id: 'setup', label: 'System Setup', icon: Building2 },
          { id: 'analytics', label: 'Configurations', icon: Sliders },
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'custom_dashboards', label: 'AquaPulse DS', icon: Palette, badgeText: 'v1.2' }
        ]
      };
    }

    // 4. HR User (Default)
    return {
      coreNavItems: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'directory', label: 'My Team', icon: Users, count: managerAssignedCount },
        { id: 'candidates', label: 'Employees', icon: Users, count: activeCandidatesCount },
        { id: 'assets', label: 'Assets', icon: Laptop, count: totalAssetsCount },
        { id: 'compliance', label: 'Documents', icon: FileText }
      ],
      configNavItems: [
        { id: 'settings', label: 'System Settings', icon: Settings },
        { id: 'analytics', label: 'AquaPulse DS', icon: Palette, badgeText: 'v1.2' }
      ]
    };
  }, [currentRole, activeCandidatesCount, managerAssignedCount, totalAssetsCount]);

  const userInitials = React.useMemo(() => {
    if (currentUser?.name) {
      const parts = currentUser.name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (currentRole === 'EMPLOYEE') return 'JD';
    if (currentRole === 'MANAGER') return 'MB';
    if (currentRole === 'HR') return 'HR';
    return 'SA';
  }, [currentUser, currentRole]);

  const roleDisplayTitle = React.useMemo(() => {
    if (currentRole === 'EMPLOYEE') return 'Employee';
    if (currentRole === 'MANAGER') return 'Department Manager';
    if (currentRole === 'HR') return 'HR Administrator';
    return 'Plant Admin';
  }, [currentRole]);

  const userDisplayName = React.useMemo(() => {
    if (currentUser?.name) return currentUser.name;
    if (currentRole === 'EMPLOYEE') return 'John Doe';
    if (currentRole === 'MANAGER') return 'Marcus Brody';
    if (currentRole === 'HR') return 'HR Operations #1';
    return 'Devi Fisheries #1';
  }, [currentUser, currentRole]);

  const handleNavClick = (pageId: NavigationPage) => {
    navigateTo(pageId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderNavSection = (items: NavItem[]) => {
    return (
      <div className="space-y-1">
        {items.map((item) => {
          const isProfileItem = item.id === 'profile';
          const isProfileActive = isProfileItem && activePage === 'profile';
          const isConfigItem = item.id === 'analytics';
          const isConfigActive = isConfigItem && (activePage === 'analytics' || activePage === 'custom_dashboards');
          const isSetupItem = item.id === 'setup';
          const isSetupActive = isSetupItem && (activePage === 'setup' || activePage.startsWith('setup_'));
          const isActive = isProfileItem ? isProfileActive : isConfigItem ? isConfigActive : isSetupItem ? isSetupActive : activePage === item.id;
          const IconComponent = item.icon;

          // 1. My Profile with Expandable Bullet Sub-Items
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
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                    isProfileActive
                      ? 'bg-teal-50/90 dark:bg-teal-950/60 text-teal-950 dark:text-teal-100 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs font-extrabold'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComponent
                      className={cn(
                        'w-4.5 h-4.5 shrink-0',
                        isProfileActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileExpanded((prev) => !prev);
                    }}
                    className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    title={isProfileExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                  >
                    {isProfileExpanded ? (
                      <ChevronUp className={cn('w-4 h-4', isProfileActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400')} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                </button>

                {/* Sub-menu styled with AquaPulse bullet dots */}
                {isProfileExpanded && (
                  <div className="space-y-0.5 py-1 pl-4 pr-1">
                    {PROFILE_SUB_ITEMS.map((subItem) => {
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
                            'w-full flex items-center px-3 py-2 rounded-xl text-left transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                            isSubActive
                              ? 'bg-teal-50/90 dark:bg-teal-950/60 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full shrink-0 mr-2.5 transition-colors',
                              isSubActive
                                ? 'bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-200 dark:ring-teal-900'
                                : 'bg-slate-300 dark:bg-slate-600'
                            )}
                          />
                          <span
                            className={cn(
                              'text-[11px] uppercase tracking-wider font-extrabold truncate',
                              isSubActive
                                ? 'text-teal-900 dark:text-teal-200'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            )}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 2. Configurations with Expandable Bullet Sub-Items
          if (isConfigItem && currentRole === 'SUPER_ADMIN') {
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
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                    isConfigActive
                      ? 'bg-teal-50/90 dark:bg-teal-950/60 text-teal-950 dark:text-teal-100 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs font-extrabold'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComponent
                      className={cn(
                        'w-4.5 h-4.5 shrink-0',
                        isConfigActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfigExpanded((prev) => !prev);
                    }}
                    className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    title={isConfigExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                  >
                    {isConfigExpanded ? (
                      <ChevronUp className={cn('w-4 h-4', isConfigActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400')} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                </button>

                {isConfigExpanded && (
                  <div className="space-y-0.5 py-1 pl-4 pr-1">
                    {CONFIG_SUB_ITEMS.map((subItem) => {
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
                            'w-full flex items-center px-3 py-2 rounded-xl text-left transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                            isSubActive
                              ? 'bg-teal-50/90 dark:bg-teal-950/60 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full shrink-0 mr-2.5 transition-colors',
                              isSubActive
                                ? 'bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-200 dark:ring-teal-900'
                                : 'bg-slate-300 dark:bg-slate-600'
                            )}
                          />
                          <span
                            className={cn(
                              'text-[11px] uppercase tracking-wider font-extrabold truncate',
                              isSubActive
                                ? 'text-teal-900 dark:text-teal-200'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            )}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 3. System Setup with Expandable Bullet Sub-Items
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
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                    isSetupActive
                      ? 'bg-teal-50/90 dark:bg-teal-950/60 text-teal-950 dark:text-teal-100 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs font-extrabold'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComponent
                      className={cn(
                        'w-4.5 h-4.5 shrink-0',
                        isSetupActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSetupExpanded((prev) => !prev);
                    }}
                    className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    title={isSetupExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                  >
                    {isSetupExpanded ? (
                      <ChevronUp className={cn('w-4 h-4', isSetupActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400')} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                </button>

                {isSetupExpanded && (
                  <div className="space-y-0.5 py-1 pl-4 pr-1">
                    {SETUP_SUB_ITEMS.map((subItem) => {
                      const isSubActive =
                        activePage === subItem.id ||
                        (activePage === 'setup' && subItem.id === 'setup_organization');

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
                            'w-full flex items-center px-3 py-2 rounded-xl text-left transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                            isSubActive
                              ? 'bg-teal-50/90 dark:bg-teal-950/60 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full shrink-0 mr-2.5 transition-colors',
                              isSubActive
                                ? 'bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-200 dark:ring-teal-900'
                                : 'bg-slate-300 dark:bg-slate-600'
                            )}
                          />
                          <span
                            className={cn(
                              'text-[11px] uppercase tracking-wider font-extrabold truncate',
                              isSubActive
                                ? 'text-teal-900 dark:text-teal-200'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            )}
                          >
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 4. Standard Parent Menu Items (Dashboard, Employees, My Team, Assets, Documents, Settings, etc.)
          return (
            <button
              key={item.id}
              type="button"
              data-tour={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer',
                isActive
                  ? 'bg-teal-50/90 dark:bg-teal-950/60 text-teal-950 dark:text-teal-100 border border-teal-100/90 dark:border-teal-900/60 shadow-2xs font-extrabold'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <IconComponent
                  className={cn(
                    'w-4.5 h-4.5 shrink-0',
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badgeText && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-bold rounded-full border',
                    isActive
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-teal-300 dark:border-teal-700 bg-teal-50/60 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  )}
                >
                  {item.badgeText}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && !item.badgeText && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-bold rounded-full border',
                    isActive
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-teal-200/80 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
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

      {/* AquaPulse / Devi Fisheries Styled Sidebar */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed top-[72px] left-0 bottom-0 z-30 h-[calc(100vh-72px)] w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-xs',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top Brand Header (from Devi Fisheries / AquaPulse design) */}
        <div className="p-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-tight">
                Quantira HRMS
              </span>
              <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider truncate">
                AquaPulse HCM
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="p-3 space-y-5 overflow-y-auto flex-1">
          {/* Section 1: CORE MODULES */}
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider px-3 block mb-2 text-left">
              Core Modules
            </span>
            {renderNavSection(coreNavItems)}
          </div>

          {/* Section 2: CONFIGURATION */}
          <div>
            <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider px-3 block mb-2 text-left">
              Configuration
            </span>
            {renderNavSection(configNavItems)}
          </div>
        </div>

        {/* Bottom User Profile Card (from Devi Fisheries / AquaPulse design) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="p-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-100/90 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-center font-extrabold text-xs shrink-0 select-none">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {userDisplayName}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate capitalize">
                  {roleDisplayTitle}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
