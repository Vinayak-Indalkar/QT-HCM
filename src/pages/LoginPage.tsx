import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { UserRole } from '../types/auth';
import { Button, TextInput, Checkbox, Card, QuantiraLogo } from '../components';
import {
  Shield,
  Users,
  UserCheck,
  GraduationCap,
  LogIn,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../utils/cn';

export const LoginPage: React.FC = () => {
  const { login } = useRole();
  const [email, setEmail] = useState('hr@quantira.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your corporate email.');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      login(undefined, { email, password });
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      login(role);
      setIsLoading(false);
    }, 300);
  };

  const quickRoles = [
    {
      role: 'HR' as UserRole,
      title: 'HR Administrator',
      email: 'hr@quantira.com',
      badge: 'Manage People & Onboarding',
      icon: Users,
      bg: 'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      role: 'EMPLOYEE' as UserRole,
      title: 'Employee',
      email: 'john.doe@quantira.com',
      badge: 'View My Profile & Data',
      icon: GraduationCap,
      bg: 'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      role: 'MANAGER' as UserRole,
      title: 'Manager',
      email: 'manager@quantira.com',
      badge: 'Oversee Team & Arrival',
      icon: UserCheck,
      bg: 'hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      role: 'SUPER_ADMIN' as UserRole,
      title: 'Super Admin',
      email: 'admin@quantira.com',
      badge: 'System Governance',
      icon: Shield,
      bg: 'hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-fade-in font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Login Form Card (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-8 sm:p-10 shadow-xl border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Header / Branding */}
            <div className="flex items-center gap-3.5 mb-6">
              <QuantiraLogo variant="full" className="h-10" imgClassName="h-10 w-auto" />
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                HR Portal
              </span>
            </div>

            <div className="text-left mb-6">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your corporate credentials to access the onboarding dashboard.
              </p>
            </div>

            {error && (
              <div role="alert" className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium text-left">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <TextInput
                label="Corporate Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@quantira.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />

              <TextInput
                label="Security Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="flex items-center justify-between pt-1">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  label="Remember this workstation"
                />
                <button
                  type="button"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2 font-bold"
                rightIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In & Enter Dashboard
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: Quick 1-Click Role Login Demo Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4 text-left">
          <div className="p-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Instant Role Switching
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1-Click Demo Personas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select any persona to immediately sign in and inspect their dashboard:
            </p>
          </div>

          <div className="space-y-2.5">
            {quickRoles.map((item) => {
              const IconComp = item.icon;

              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item.role)}
                  className={cn(
                    'w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all flex items-center justify-between text-left group shadow-2xs hover:shadow-md cursor-pointer',
                    item.bg
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      <IconComp className={cn('w-5 h-5', item.iconColor)} aria-hidden="true" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate">
                        {item.email}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 ml-2">
                    Sign in →
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> WCAG 2.2 AA & Salt Design System
            </div>
            <p className="text-[11px] text-slate-400">
              Authentication and role sessions are managed via demo providers and ready for SSO/OAuth backend integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
