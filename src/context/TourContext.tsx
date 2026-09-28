import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRole } from './RoleContext';
import { UserRole } from '../types/auth';
import { NavigationPage } from './OnboardingContext';

export interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  category: string;
  targetSelector?: string;
  placement?: 'right' | 'left' | 'top' | 'bottom' | 'center';
  targetPage?: NavigationPage;
  actionLabel?: string;
  features: string[];
}

export interface TourContextType {
  isTourOpen: boolean;
  currentStepIndex: number;
  currentSteps: TourStep[];
  startTour: (startStepIndex?: number) => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  autoShowOnLogin: boolean;
  setAutoShowOnLogin: (enabled: boolean) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_AUTO_SHOW_KEY = 'quantira_tour_auto_show';
const TOUR_LAST_SEEN_KEY = 'quantira_tour_last_role';

export const ROLE_TOUR_STEPS: Record<UserRole, TourStep[]> = {
  SUPER_ADMIN: [
    {
      id: 'super_admin_dashboard',
      title: 'Enterprise Executive Dashboard',
      subtitle: 'Global Metrics, Turnaround SLA & Live Analytics',
      description: 'Your central cockpit for enterprise-wide visibility. Monitor active headcount velocity, statutory compliance rates, SLA completion metrics, and department KPIs in real-time.',
      badge: 'Step 1 of 6 • Executive Cockpit',
      icon: '👑',
      category: 'Governance',
      targetSelector: '[data-tour="nav-dashboard"]',
      placement: 'right',
      targetPage: 'dashboard',
      actionLabel: 'Explore Admin Dashboard',
      features: [
        'Real-time enterprise headcount & active throughput monitoring',
        'Statutory compliance tracking and SLA turnaround benchmarks',
        'Global system configuration and cross-department analytics'
      ]
    },
    {
      id: 'super_admin_custom_dashboards',
      title: 'Custom Dashlets & amCharts 5 Gantt',
      subtitle: '12-Column Responsive Layouts & Live Timeline Charts',
      description: 'Create and customize responsive dashlets with amCharts 5 Gantt timelines, funnel conversion rings, and bar charts. Resize column spans (1 to 12 cols) and height presets with real-time preview.',
      badge: 'Step 2 of 6 • Visual Dashboards',
      icon: '📊',
      category: 'Visualizations',
      targetSelector: '[data-tour="nav-custom-dashboards"]',
      placement: 'right',
      targetPage: 'custom_dashboards',
      actionLabel: 'Open Custom Dashboards',
      features: [
        '9 amCharts 5 visualizations: Gantt Timelines, Bar, Line, Area, Pie, Donut, Funnel, Radial Gauge',
        'Drag-free instant column spanning with responsive layout auto-fill',
        'Role-specific dashlet assignment for Admin, HR, Manager, and Employee dashboards'
      ]
    },
    {
      id: 'super_admin_employees',
      title: 'Global Employee & Candidate Roster',
      subtitle: 'End-to-End Pipeline & Stage Progression',
      description: 'Oversee all incoming personnel, track candidate offer acceptances, generate onboarding links, and audit background verification stages from a unified roster.',
      badge: 'Step 3 of 6 • Employee Pipeline',
      icon: '👥',
      category: 'Talent Directory',
      targetSelector: '[data-tour="nav-candidates"]',
      placement: 'right',
      targetPage: 'candidates',
      actionLabel: 'Inspect Employees',
      features: [
        'Unified employee directory with instant search and filter controls',
        'One-click Day-1 onboarding link generation with pre-filled tokens',
        'Stage transition auditing from screening to Day-1 orientation'
      ]
    },
    {
      id: 'super_admin_compliance',
      title: 'Statutory Verification & Legal Documents',
      subtitle: 'Passports, I-9 Clearances, Tax Verification & NDAs',
      description: 'Audit statutory candidate verification artifacts, approve uploaded passports and signed non-disclosure agreements, and enforce global compliance retention rules.',
      badge: 'Step 4 of 6 • Statutory Compliance',
      icon: '🛡️',
      category: 'Compliance',
      targetSelector: '[data-tour="nav-compliance"]',
      placement: 'right',
      targetPage: 'compliance',
      actionLabel: 'Audit Compliance Docs',
      features: [
        'Built-in document viewer with zoom, rotation, and revision feedback',
        'Clearance status badges: Verified, Pending Review, Revision Required',
        'Statutory audit trail and secure retention policies'
      ]
    },
    {
      id: 'super_admin_assets',
      title: 'IT Hardware & Asset Management',
      subtitle: 'Staging, Laptop Allocations & Serial Tracking',
      description: 'Manage the enterprise hardware inventory pool. Provision Apple MacBook Pros, Dell workstations, monitors, and peripherals with automated assignment to incoming candidates.',
      badge: 'Step 5 of 6 • Asset Logistics',
      icon: '💻',
      category: 'IT Assets',
      targetSelector: '[data-tour="nav-assets"]',
      placement: 'right',
      targetPage: 'assets',
      actionLabel: 'Open IT Inventory',
      features: [
        'Real-time available vs. assigned equipment inventory counts',
        'Direct hardware assignment to new hires with serial number tracking',
        'Automated status updates when IT provisioning gates are signed off'
      ]
    },
    {
      id: 'super_admin_header_controls',
      title: 'Role Switcher, Themes & Notifications',
      subtitle: 'Instant Persona Switching & Live Notification Alerts',
      description: 'Seamlessly switch between Super Admin, HR, Manager, and Employee personas to test role-specific workflows, toggle Dark/Light theme, and view real-time alert notifications.',
      badge: 'Step 6 of 6 • Quick Tools',
      icon: '🚀',
      category: 'Header Controls',
      targetSelector: '[data-tour="header-user-menu"]',
      placement: 'bottom',
      features: [
        'Instant Role Switcher in the top right user menu',
        'Dark & Light theme toggle with high contrast accessibility',
        'Launch this interactive tour anytime using the "Tour Guide" button'
      ]
    }
  ],

  HR: [
    {
      id: 'hr_dashboard',
      title: 'HR People Operations Cockpit',
      subtitle: 'Candidate Onboarding Pipelines & Attendance Metrics',
      description: 'Track overall candidate throughput, review Day-1 arrival counts, monitor daily employee attendance punches, and identify onboarding bottlenecks across departments.',
      badge: 'Step 1 of 5 • HR Operations',
      icon: '👥',
      category: 'Operations',
      targetSelector: '[data-tour="nav-dashboard"]',
      placement: 'right',
      targetPage: 'dashboard',
      actionLabel: 'Go to HR Dashboard',
      features: [
        'Track candidate onboarding pipelines from offer acceptance to Day-1 clearance',
        'Monitor daily time punch records and employee attendance logs',
        'Instant search, filtering, and candidate profile management'
      ]
    },
    {
      id: 'hr_candidates',
      title: 'Candidate Directory & Invite Dispatcher',
      subtitle: 'One-Click Employee Adding & Onboarding Links',
      description: 'Add new hires individually, assign line managers and buddies, and generate shareable Day-1 onboarding invitation links with pre-filled tokens.',
      badge: 'Step 2 of 5 • Talent Onboarding',
      icon: '✉️',
      category: 'Candidates',
      targetSelector: '[data-tour="nav-candidates"]',
      placement: 'right',
      targetPage: 'candidates',
      actionLabel: 'View Candidate Directory',
      features: [
        'Shareable onboarding link generator with pre-filled tokens',
        'Direct candidate profile inspector and stage velocity metrics',
        'Automated email notification triggers upon stage transitions'
      ]
    },
    {
      id: 'hr_compliance',
      title: 'Document Clearance & Statutory Verification',
      subtitle: 'Passports, I-9 Eligibility, Tax Forms & Signed NDAs',
      description: 'Inspect uploaded statutory artifacts, verify identity documents, approve background checks, and request revisions with integrated feedback.',
      badge: 'Step 3 of 5 • Document Compliance',
      icon: '🛡️',
      category: 'Compliance',
      targetSelector: '[data-tour="nav-compliance"]',
      placement: 'right',
      targetPage: 'compliance',
      actionLabel: 'Review Compliance Docs',
      features: [
        'Built-in document viewer with zoom, rotation, and revision feedback',
        'Clearance status badges: Verified, Pending Review, Revision Required',
        'Audit trail logging for all verification actions'
      ]
    },
    {
      id: 'hr_assets',
      title: 'IT Hardware & Equipment Staging',
      subtitle: 'Stage Laptops, Monitors & Peripherals for Day 1',
      description: 'Allocate laptops, workstation accessories, and software licenses to new hires so equipment arrives ahead of their first day.',
      badge: 'Step 4 of 5 • Hardware Logistics',
      icon: '💻',
      category: 'IT Hardware',
      targetSelector: '[data-tour="nav-assets"]',
      placement: 'right',
      targetPage: 'assets',
      actionLabel: 'Inspect Hardware Pool',
      features: [
        'Track equipment staging status: In Stock, Staged, Assigned, In Repair',
        'One-click asset assignment to incoming hires',
        'Seamless integration with IT provisioning checklist gates'
      ]
    },
    {
      id: 'hr_notifications_menu',
      title: 'Notifications & Quick Actions',
      subtitle: 'Live SLA Alerts, Role Switching & Tour Guide',
      description: 'Stay on top of urgent candidate checklist items, unverified documents, and SLA milestones via the live notifications bell.',
      badge: 'Step 5 of 5 • Stay Connected',
      icon: '🔔',
      category: 'Notifications',
      targetSelector: '[data-tour="header-notifications"]',
      placement: 'bottom',
      features: [
        'Live notification counter with instant deep links to pending tasks',
        'Toggle between Dark and Light mode for comfort',
        'Re-launch this guided product tour anytime'
      ]
    }
  ],

  MANAGER: [
    {
      id: 'manager_dashboard',
      title: 'Manager Operations Hub',
      subtitle: 'Team Overview & Day-1 Arrival Countdown',
      description: 'Welcome to your managerial cockpit. Oversee incoming team members, track Day-1 arrivals, and ensure all team readiness milestones are on schedule.',
      badge: 'Step 1 of 4 • Team Overview',
      icon: '👔',
      category: 'Management',
      targetSelector: '[data-tour="nav-dashboard"]',
      placement: 'right',
      targetPage: 'dashboard',
      actionLabel: 'Open Manager Dashboard',
      features: [
        'Arrival countdown for incoming team members',
        'Department headcount and milestone progression tracking',
        'Direct access to candidate dossiers and background summaries'
      ]
    },
    {
      id: 'manager_team',
      title: 'Team Directory & Employee Dossiers',
      subtitle: 'Direct Reports, Roles, Equipment & Contacts',
      description: 'View everyone on your team, inspect contact details, work models (Remote/Hybrid/Onsite), and assigned IT equipment serials.',
      badge: 'Step 2 of 4 • Team Directory',
      icon: '👥',
      category: 'Team Directory',
      targetSelector: '[data-tour="nav-directory"]',
      placement: 'right',
      targetPage: 'directory',
      actionLabel: 'View My Team',
      features: [
        'Instant contact details (email, phone, location, work model)',
        'Assigned hardware and laptop serial records',
        'Interactive employee performance KPI scorecards'
      ]
    },
    {
      id: 'manager_profile',
      title: 'My Profile & Department Settings',
      subtitle: 'Personal Records, Emergency Contacts & Preferences',
      description: 'Access and update your personal information, emergency contacts, reporting structure, and security credentials in one place.',
      badge: 'Step 3 of 4 • Profile & Access',
      icon: '👤',
      category: 'Profile',
      targetSelector: '[data-tour="nav-profile"]',
      placement: 'right',
      targetPage: 'profile',
      actionLabel: 'Open My Profile',
      features: [
        'Emergency contacts and direct reporting tree',
        'Signed documents and digital credentials',
        'Security preferences and password management'
      ]
    },
    {
      id: 'manager_header',
      title: 'Quick Actions & Guided Tour',
      subtitle: 'Real-Time Alerts & Switchable Personas',
      description: 'Monitor urgent candidate approvals and sign-offs directly from the notification center and re-run this tour anytime.',
      badge: 'Step 4 of 4 • Quick Tools',
      icon: '⭐',
      category: 'Quick Actions',
      targetSelector: '[data-tour="header-tour-btn"]',
      placement: 'bottom',
      features: [
        'One-click tour launch button right in the top navigation bar',
        'Live notification alerts for candidate milestone sign-offs',
        'High contrast dark and light mode support'
      ]
    }
  ],

  EMPLOYEE: [
    {
      id: 'employee_dashboard',
      title: 'Your Personal Onboarding Journey',
      subtitle: 'Live Onboarding Progress & Day-1 Readiness Meter',
      description: 'Welcome to Quantira! Track your real-time onboarding progression percentage, review your Day 1 readiness status, and meet your assigned buddy.',
      badge: 'Step 1 of 4 • Welcome Aboard',
      icon: '👋',
      category: 'Onboarding',
      targetSelector: '[data-tour="nav-dashboard"]',
      placement: 'right',
      targetPage: 'dashboard',
      actionLabel: 'View Dashboard',
      features: [
        'Live onboarding progression meter (0% to 100%)',
        'Real-time status of your Day-1 clearance gates',
        'Assigned buddy, line manager, and department orientation schedule'
      ]
    },
    {
      id: 'employee_wizard',
      title: 'Guided Onboarding Wizard',
      subtitle: 'Complete 10 Steps to Get 100% Day-1 Ready',
      description: 'Follow our intuitive step-by-step wizard to submit your statutory information, review policies, and sign off on your employment agreement.',
      badge: 'Step 2 of 4 • 10-Step Wizard',
      icon: '✨',
      category: 'Wizard',
      targetSelector: '[data-tour="nav-wizard"]',
      placement: 'right',
      targetPage: 'wizard',
      actionLabel: 'Open Onboarding Wizard',
      features: [
        'Intuitive 10-step wizard with save-and-resume progress',
        'Instant validation and statutory guidance on each field',
        'Digital signature pad for offer and NDA execution'
      ]
    },
    {
      id: 'employee_profile',
      title: 'Personal Profile, Docs & IT Equipment',
      subtitle: 'Submit ID, Tax Details & Review Provisioned Laptop',
      description: 'Upload required government ID photos, review your provisioned MacBook/workstation specs, and check your orientation schedule.',
      badge: 'Step 3 of 4 • Profile & Docs',
      icon: '📝',
      category: 'Identity & Gear',
      targetSelector: '[data-tour="nav-profile"]',
      placement: 'right',
      targetPage: 'profile',
      actionLabel: 'Open Profile View',
      features: [
        'Secure document upload for statutory IDs and certifications',
        'Real-time verification badges (Verified, Pending Review)',
        'Staged IT laptop and monitor specs verification'
      ]
    },
    {
      id: 'employee_topbar',
      title: 'Help & Tour Guide Launcher',
      subtitle: 'Always Available When You Need Guidance',
      description: 'You can launch this interactive tour guide anytime by clicking the Tour Guide button at the top of your screen.',
      badge: 'Step 4 of 4 • Help & Support',
      icon: '🧭',
      category: 'Assistance',
      targetSelector: '[data-tour="header-tour-btn"]',
      placement: 'bottom',
      features: [
        'One-click tour launcher available throughout your onboarding',
        'Light and Dark mode toggles for eye comfort',
        'Direct links to HR support and IT helpdesk'
      ]
    }
  ]
};

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRole, isAuthenticated } = useRole();

  const [autoShowOnLogin, setAutoShowOnLoginState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(TOUR_AUTO_SHOW_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentSteps = ROLE_TOUR_STEPS[currentRole] || ROLE_TOUR_STEPS.HR;

  // Auto-trigger tour on login or role switch if auto-show is enabled
  useEffect(() => {
    if (isAuthenticated && autoShowOnLogin) {
      const lastRole = sessionStorage.getItem(TOUR_LAST_SEEN_KEY);
      if (lastRole !== currentRole) {
        const timer = setTimeout(() => {
          setCurrentStepIndex(0);
          setIsTourOpen(true);
          sessionStorage.setItem(TOUR_LAST_SEEN_KEY, currentRole);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, currentRole, autoShowOnLogin]);

  const setAutoShowOnLogin = useCallback((enabled: boolean) => {
    setAutoShowOnLoginState(enabled);
    try {
      localStorage.setItem(TOUR_AUTO_SHOW_KEY, String(enabled));
    } catch {
      // ignore
    }
  }, []);

  const startTour = useCallback((startStepIndex: number = 0) => {
    setCurrentStepIndex(Math.max(0, Math.min(startStepIndex, currentSteps.length - 1)));
    setIsTourOpen(true);
  }, [currentSteps.length]);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, currentSteps.length - 1));
  }, [currentSteps.length]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < currentSteps.length) {
      setCurrentStepIndex(index);
    }
  }, [currentSteps.length]);

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        currentStepIndex,
        currentSteps,
        startTour,
        closeTour,
        nextStep,
        prevStep,
        goToStep,
        autoShowOnLogin,
        setAutoShowOnLogin
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
