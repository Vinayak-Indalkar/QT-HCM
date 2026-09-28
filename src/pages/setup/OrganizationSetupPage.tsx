import React, { useState } from 'react';
import { useOnboarding, NavigationPage } from '../../context/OnboardingContext';
import { OrganizationView } from '../../components/setup/OrganizationView';
import { BranchesView } from '../../components/setup/BranchesView';
import { UsersView } from '../../components/setup/UsersView';
import { RolesPermissionsView } from '../../components/setup/RolesPermissionsView';
import { OrganizationStructureView } from '../../components/setup/OrganizationStructureView';
import { WorkflowSetupView } from '../../components/setup/WorkflowSetupView';
import {
  Building2,
  Building,
  Users,
  ShieldCheck,
  Network,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  GitBranch
} from 'lucide-react';

export type SetupSubTab =
  | 'organization'
  | 'branches'
  | 'structure'
  | 'users'
  | 'roles'
  | 'workflow';

export interface OrganizationSetupPageProps {
  initialTab?: SetupSubTab;
  structureSubTab?: 'departments' | 'designations' | 'locations';
}

export const OrganizationSetupPage: React.FC<OrganizationSetupPageProps> = ({
  initialTab = 'organization',
  structureSubTab = 'departments'
}) => {
  const { navigateTo } = useOnboarding();
  const [activeTab, setActiveTab] = useState<SetupSubTab>(initialTab);

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2, desc: 'Corporate legal entity & branding' },
    { id: 'branches', label: 'Branches', icon: Building, desc: 'Multi-site branch network' },
    { id: 'structure', label: 'Organization Structure', icon: Network, desc: 'Departments, designations & locations' },
    { id: 'users', label: 'Users', icon: Users, desc: 'ERP system user accounts' },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck, desc: 'Granular RBAC access policies' },
    { id: 'workflow', label: 'Workflow', icon: GitBranch, desc: 'Automated pipelines & approval gates' }
  ];

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
            <span>Super Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 dark:text-blue-400">Enterprise Setup</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enterprise Setup &amp; Organization Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure corporate identity, multi-site branches, RBAC privileges, organization structure, and automated workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            Multi-Tenant ERP Edition
          </span>
        </div>
      </div>

      {/* Main Setup Tabs Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as SetupSubTab);
                if (tab.id === 'organization') navigateTo('setup_organization' as any);
                else if (tab.id === 'branches') navigateTo('setup_branches' as any);
                else if (tab.id === 'users') navigateTo('setup_users' as any);
                else if (tab.id === 'roles') navigateTo('setup_roles' as any);
                else if (tab.id === 'structure') navigateTo('setup_structure' as any);
                else if (tab.id === 'workflow') navigateTo('setup_workflow' as any);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
              }`}
            >
              <div>
                <span className="text-xs font-bold block leading-tight">{tab.label}</span>
                <span className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {tab.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Render Active View */}
      {activeTab === 'organization' && <OrganizationView />}
      {activeTab === 'branches' && <BranchesView />}
      {activeTab === 'structure' && <OrganizationStructureView initialSubTab={structureSubTab} />}
      {activeTab === 'users' && <UsersView />}
      {activeTab === 'roles' && <RolesPermissionsView />}
      {activeTab === 'workflow' && <WorkflowSetupView />}
    </div>
  );
};
