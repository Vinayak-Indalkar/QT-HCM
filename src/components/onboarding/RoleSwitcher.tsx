import React, { useState, useRef, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { UserRole } from '../../types/auth';
import { ChevronDown, Shield, Users, UserCheck, GraduationCap, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setRole, availableRoles } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />;
      case 'HR':
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
      case 'MANAGER':
        return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'EMPLOYEE':
        return <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current role: ${availableRoles[currentRole].title}. Click to switch demo role.`}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
      >
        {getRoleIcon(currentRole)}
        <span>Role: <strong className="font-extrabold text-blue-600 dark:text-blue-400">{availableRoles[currentRole].title}</strong></span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Demo role selector"
          className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 animate-fade-in text-left"
        >
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Switch Demo Role (MVP Testing)
            </span>
          </div>

          <div className="space-y-1">
            {(Object.keys(availableRoles) as UserRole[]).map((roleKey) => {
              const isSelected = currentRole === roleKey;
              const roleInfo = availableRoles[roleKey];

              return (
                <button
                  key={roleKey}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectRole(roleKey)}
                  className={cn(
                    'w-full flex items-start justify-between p-2 rounded-lg text-xs transition-colors text-left group',
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="mt-0.5">{getRoleIcon(roleKey)}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {roleInfo.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {roleInfo.description}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2 mt-0.5" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 text-[11px] text-slate-400">
            Easily test all 4 user perspectives without re-authenticating.
          </div>
        </div>
      )}
    </div>
  );
};
