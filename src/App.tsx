import React, { useEffect, Suspense, lazy } from 'react';
import { SaltProvider } from '@salt-ds/core';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { DemoRoleProvider, useRole } from './context/RoleContext';
import { OnboardingFlowProvider, useOnboardingFlow } from './context/OnboardingFlowContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';

import { AppLayout } from './components/shell/AppLayout';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { PageSkeleton } from './components/feedback/PageSkeleton';

// Code-split dynamic page imports for optimal bundle performance
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const MyTeamPage = lazy(() => import('./pages/MyTeamPage').then((m) => ({ default: m.MyTeamPage })));
const SuperAdminDashboardPage = lazy(() =>
  import('./pages/SuperAdminDashboardPage').then((m) => ({ default: m.SuperAdminDashboardPage }))
);
const EmployeeOnboardingPage = lazy(() =>
  import('./pages/EmployeeOnboardingPage').then((m) => ({ default: m.EmployeeOnboardingPage }))
);
const EmployeeProfileView = lazy(() =>
  import('./components/employee/EmployeeProfileView').then((m) => ({ default: m.EmployeeProfileView }))
);
const CandidatesDirectoryPage = lazy(() =>
  import('./pages/CandidatesDirectoryPage').then((m) => ({ default: m.CandidatesDirectoryPage }))
);
const CandidateDetailPage = lazy(() =>
  import('./pages/CandidateDetailPage').then((m) => ({ default: m.CandidateDetailPage }))
);
const TasksChecklistPage = lazy(() =>
  import('./pages/TasksChecklistPage').then((m) => ({ default: m.TasksChecklistPage }))
);
const ComplianceDocsPage = lazy(() =>
  import('./pages/ComplianceDocsPage').then((m) => ({ default: m.ComplianceDocsPage }))
);
const AnalyticsPipelinePage = lazy(() =>
  import('./pages/AnalyticsPipelinePage').then((m) => ({ default: m.AnalyticsPipelinePage }))
);
const SettingsConfigPage = lazy(() =>
  import('./pages/SettingsConfigPage').then((m) => ({ default: m.SettingsConfigPage }))
);
const AssetsManagementPage = lazy(() =>
  import('./pages/AssetsManagementPage').then((m) => ({ default: m.AssetsManagementPage }))
);
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const HrDashboardPage = lazy(() => import('./pages/HrDashboardPage').then((m) => ({ default: m.HrDashboardPage })));
const ManagerDashboardPage = lazy(() =>
  import('./pages/ManagerDashboardPage').then((m) => ({ default: m.ManagerDashboardPage }))
);
const EmployeeDashboardPage = lazy(() =>
  import('./pages/EmployeeDashboardPage').then((m) => ({ default: m.EmployeeDashboardPage }))
);
const CustomDashboardsPage = lazy(() =>
  import('./pages/CustomDashboardsPage').then((m) => ({ default: m.CustomDashboardsPage }))
);
const OrganizationSetupPage = lazy(() =>
  import('./pages/setup/OrganizationSetupPage').then((m) => ({ default: m.OrganizationSetupPage }))
);

const AppInner: React.FC = () => {
  const { mode } = useTheme();
  const { isAuthenticated, currentRole, login } = useRole();
  const { activePage, navigateTo } = useOnboarding();
  const { loadEmployee } = useOnboardingFlow();

  // Handle direct onboarding invite links (e.g. ?invite=EMP-2024-0847&name=Vinayak&email=vinayak@yopmail.com)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const inviteId = params.get('invite');
      const name = params.get('name');
      const email = params.get('email');
      const role = params.get('role');
      const dept = params.get('dept');
      const loc = params.get('loc');
      const start = params.get('start');
      const type = params.get('type');
      const l1 = params.get('l1');
      const l2 = params.get('l2');
      if (inviteId) {
        login('EMPLOYEE');
        const parts = (name || 'Employee').trim().split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || '';
        loadEmployee(inviteId, {
          firstName,
          lastName,
          email: email || '',
          corporateEmail: email || '',
          jobTitle: role || 'Team Member',
          employeeId: inviteId,
          ...(dept ? { department: dept } : {}),
          ...(loc ? { workLocation: loc } : {}),
          ...(start ? { startDate: start } : {}),
          ...(type ? { employmentType: type } : {}),
          ...(l1 ? { line1Manager: l1 } : {}),
          ...(l2 ? { line2Manager: l2 } : {})
        });
        navigateTo('wizard');
      }
    } catch {
      // ignore
    }
  }, [login, navigateTo, loadEmployee]);

  // If not logged in, present enterprise login page with 1-click persona options
  if (!isAuthenticated) {
    return (
      <SaltProvider mode={mode}>
        <ErrorBoundary componentName="Login Portal">
          <Suspense fallback={<PageSkeleton />}>
            <LoginPage />
          </Suspense>
        </ErrorBoundary>
      </SaltProvider>
    );
  }

  // Active page routing within the layout shell
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        if (currentRole === 'EMPLOYEE') return <EmployeeDashboardPage />;
        if (currentRole === 'MANAGER') return <ManagerDashboardPage />;
        if (currentRole === 'HR') return <HrDashboardPage />;
        if (currentRole === 'SUPER_ADMIN') return <DashboardPage />;
        return <DashboardPage />;
      case 'candidates':
        return <CandidatesDirectoryPage />;
      case 'profile':
        return <EmployeeProfileView />;
      case 'directory':
        if (currentRole === 'EMPLOYEE') return <EmployeeProfileView />;
        return <MyTeamPage />;
      case 'wizard':
        return <EmployeeOnboardingPage onReturnToDashboard={() => navigateTo('dashboard')} />;
      case 'detail':
        return <CandidateDetailPage />;
      case 'tasks':
        return <TasksChecklistPage />;
      case 'compliance':
        return <ComplianceDocsPage />;
      case 'analytics':
        if (currentRole === 'SUPER_ADMIN') return <SuperAdminDashboardPage initialTab="employee" />;
        return <AnalyticsPipelinePage />;
      case 'settings':
        return <SettingsConfigPage />;
      case 'assets':
        return <AssetsManagementPage />;
      case 'custom_dashboards':
        return <CustomDashboardsPage />;
      case 'setup':
        return <OrganizationSetupPage initialTab="organization" />;
      case 'setup_organization':
        return <OrganizationSetupPage initialTab="organization" />;
      case 'setup_branches':
        return <OrganizationSetupPage initialTab="branches" />;
      case 'setup_users':
        return <OrganizationSetupPage initialTab="users" />;
      case 'setup_roles':
        return <OrganizationSetupPage initialTab="roles" />;
      case 'setup_structure':
        return <OrganizationSetupPage initialTab="structure" />;
      default:
        if (currentRole === 'EMPLOYEE') return <EmployeeDashboardPage />;
        if (currentRole === 'MANAGER') return <ManagerDashboardPage />;
        if (currentRole === 'HR') return <HrDashboardPage />;
        return <DashboardPage />;
    }
  };

  return (
    <SaltProvider mode={mode}>
      <AppLayout>
        <ErrorBoundary componentName={activePage}>
          <Suspense fallback={<PageSkeleton />}>
            {renderActivePage()}
          </Suspense>
        </ErrorBoundary>
      </AppLayout>
    </SaltProvider>
  );
};

export function App() {
  return (
    <ErrorBoundary componentName="Application Root">
      <ThemeProvider>
        <ToastProvider>
          <DemoRoleProvider>
            <OnboardingFlowProvider>
              <OnboardingProvider>
                <AppInner />
              </OnboardingProvider>
            </OnboardingFlowProvider>
          </DemoRoleProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
