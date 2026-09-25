/**
 * @fileoverview Executive Business Card Organism
 * Enterprise smart vCard visualization displaying corporate branding,
 * verified contact credentials, clickable mailto link, and QR code.
 * @module components/organisms/ExecutiveBusinessCard
 */

import React from 'react';
import { CreditCard, Cpu, Mail, Phone, Globe, QrCode } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ExecutiveBusinessCardProps {
  /** Full display name of the employee */
  fullName: string;
  /** Job title or designation */
  jobTitle: string;
  /** Department name */
  department: string;
  /** Corporate email address */
  email: string;
  /** Contact phone number */
  phone?: string;
  /** Corporate website URL */
  website?: string;
  /** Optional custom class name */
  className?: string;
}

export const ExecutiveBusinessCard: React.FC<ExecutiveBusinessCardProps> = ({
  fullName,
  jobTitle,
  department,
  email,
  phone = '+1 (415) 555-0100',
  website = 'www.quantiratechnologies.com',
  className
}) => {
  return (
    <div className={cn('flex flex-col h-full w-full max-w-[380px]', className)}>
      <div className="flex items-center justify-between shrink-0 mb-3 h-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Executive Business Card
        </label>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          Smart vCard
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative mx-auto w-full max-w-[380px] aspect-[3.5/2] rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 flex flex-col justify-between select-none transition-transform hover:scale-[1.01]">
        {/* Subtle Watermark Logo Overlay */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        <img
          src="/logos/png/icon-white.png"
          alt=""
          className="absolute right-2 top-2 w-28 h-28 object-contain opacity-5 select-none pointer-events-none"
        />

        {/* Top: Quantira Brand Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <img
              src="/logos/png/icon-color.png"
              alt="Quantira"
              className="w-7 h-7 object-contain drop-shadow-sm shrink-0"
            />
            <div>
              <span className="text-xs font-extrabold tracking-widest uppercase text-white block">
                Quantira
              </span>
              <span className="text-[8px] tracking-wider text-blue-300 uppercase block -mt-0.5">
                Technologies
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            <Cpu className="w-2.5 h-2.5 text-blue-400" />
            <span>Smart vCard</span>
          </div>
        </div>

        {/* Middle: Employee Name & Title */}
        <div className="relative z-10 py-1">
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {fullName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs font-bold text-blue-400">
              {jobTitle}
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs text-slate-300">
              {department}
            </span>
          </div>
        </div>

        {/* Bottom Row: Contact Info & QR Code */}
        <div className="pt-3 border-t border-white/15 flex items-end justify-between relative z-10 gap-3">
          <div className="space-y-1 text-[11px] text-slate-300 min-w-0">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-blue-400 shrink-0" />
              <a
                href={`mailto:${email}`}
                className="truncate hover:text-white hover:underline transition-colors text-slate-200"
                title={email}
              >
                {email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">{phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">{website}</span>
            </div>
          </div>

          {/* QR Code Graphic for Digital vCard */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Scan vCard
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
