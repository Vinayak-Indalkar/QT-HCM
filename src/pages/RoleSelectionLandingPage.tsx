import React from 'react';
import { useRole } from '../context/RoleContext';
import { UserRole } from '../types/auth';
import { Shield, Users, UserCheck, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { QuantiraLogo } from '../components/atoms/Logo';
import { cn } from '../utils/cn';

export interface RoleSelectionLandingPageProps {
  onRoleSelected: (role: UserRole) => void;
}

export const RoleSelectionLandingPage: React.FC<RoleSelectionLandingPageProps> = ({
  onRoleSelected
}) => {
  const { setRole } = useRole();

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    onRoleSelected(role);
  };

  const roleCards = [
    {
      role: 'SUPER_ADMIN' as UserRole,
      title: 'Super Admin',
      subtitle: 'Manage System & Configurations',
      description: 'Access system-level dashboards, user role management, permission policies, and enterprise onboarding settings.',
      icon: Shield,
      accentColor: 'border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 hover:border-purple-500',
      iconBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300'
    },
    {
      role: 'HR' as UserRole,
      title: 'HR Administrator',
      subtitle: 'Manage People & Onboarding Pipeline',
      description: 'Review employee onboarding submissions, verify I-9 & identification documents, approve equipment, and track department progress.',
      icon: Users,
      accentColor: 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 hover:border-blue-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'
    },
    {
      role: 'MANAGER' as UserRole,
      title: 'Manager',
      subtitle: 'Manage Team & Direct Reports',
      description: 'View assigned team members, monitor arrival countdowns, assign onboarding buddies, and prepare Day 1 syncs.',
      icon: UserCheck,
      accentColor: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
    },
    {
      role: 'EMPLOYEE' as UserRole,
      title: 'Employee',
      subtitle: 'View Employee Profile & Data',
      description: 'View your comprehensive employee profile, uploaded documents, signed NDA, campus ID badge, and assigned hardware.',
      icon: GraduationCap,
      accentColor: 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 text-center space-y-10 animate-fade-in">
      {/* Hero Header */}
      <div className="space-y-4 max-w-2xl mx-auto flex flex-col items-center">
        <QuantiraLogo variant="full" className="h-12" imgClassName="h-12 w-auto" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Enterprise Onboarding Suite
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Select Your Portal Persona
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Select a role below to launch and test that persona's onboarding experience. You can switch between roles at any time using the header switcher.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
        {roleCards.map((card) => {
          const IconComponent = card.icon;

          return (
            <div
              key={card.role}
              onClick={() => handleSelectRole(card.role)}
              className={cn(
                'p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-lg hover:-translate-y-0.5',
                card.accentColor
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn('p-3 rounded-xl', card.iconBg)}>
                    <IconComponent className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Role Option
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                    {card.subtitle}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-700/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Enter as {card.title}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 max-w-xl mx-auto flex items-center justify-between">
        <span>✨ Salt Design System Architecture</span>
        <span>•</span>
        <span>WCAG 2.2 AA Accessible</span>
        <span>•</span>
        <span>Plus Jakarta Sans</span>
      </div>
    </div>
  );
};
