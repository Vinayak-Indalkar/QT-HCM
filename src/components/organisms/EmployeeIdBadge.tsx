/**
 * @fileoverview Employee ID Badge Organism
 * Enterprise physical access badge visualization displaying portrait photo,
 * verified employee ID, barcode, NFC/RFID chip icon, and building clearance level.
 * @module components/organisms/EmployeeIdBadge
 */

import React from 'react';
import { User, ShieldCheck, CreditCard, Cpu, Camera, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface EmployeeIdBadgeProps {
  /** Employee portrait photo URL */
  photoUrl?: string;
  /** Full display name of the employee */
  fullName: string;
  /** Job title or designation */
  jobTitle: string;
  /** Department name */
  department: string;
  /** Unique employee identifier code (e.g., QTR-EMP-8842) */
  employeeId?: string;
  /** Security clearance or building access level */
  accessLevel?: string;
  /** Optional click handler for the photo container to trigger image upload */
  onPhotoClick?: () => void;
  /** Optional custom class name */
  className?: string;
}

export const EmployeeIdBadge: React.FC<EmployeeIdBadgeProps> = ({
  photoUrl,
  fullName,
  jobTitle,
  department,
  employeeId = 'QTR-EMP-8842',
  accessLevel = 'Standard Floor Access',
  onPhotoClick,
  className
}) => {
  return (
    <div className={cn('flex flex-col h-full w-full max-w-[300px]', className)}>
      <div className="flex items-center justify-between shrink-0 mb-3 h-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Official Employee ID Badge
        </label>
        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
          Building Access
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative mx-auto w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col justify-between text-center select-none transition-transform hover:scale-[1.01]">
        {/* Card Lanyard Slot Clip */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full border border-slate-400/50 shadow-inner z-20" />

        {/* Card Header with Quantira Branding */}
        <div className="pt-6 pb-2 px-4 bg-linear-to-b from-blue-700 to-indigo-800 text-white relative">
          <div className="flex items-center justify-between text-[10px] tracking-widest font-black uppercase opacity-90">
            <div className="flex items-center gap-1.5">
              <img
                src="/logos/png/icon-white.png"
                alt="Quantira"
                className="w-3.5 h-3.5 object-contain inline-block shrink-0"
              />
              <span>QUANTIRA</span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
              <ShieldCheck className="w-2.5 h-2.5" /> ID PASS
            </span>
          </div>
          <p className="text-[9px] text-blue-200 font-medium tracking-wider mt-0.5 text-left pl-5">
            TECHNOLOGIES CORP
          </p>
        </div>

        {/* Card Body: Photo & Name */}
        <div className="px-4 py-2 flex flex-col items-center flex-1 justify-center space-y-2 relative">
          <img
            src="/logos/png/icon-color.png"
            alt=""
            className="absolute inset-0 m-auto w-32 h-32 object-contain opacity-[0.04] pointer-events-none select-none"
          />
          {/* Portrait Photo */}
          <div
            onClick={onPhotoClick}
            className={cn(
              "relative w-24 h-32 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 shrink-0 transition-all",
              onPhotoClick && "cursor-pointer group hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 active:scale-95"
            )}
            title={onPhotoClick ? (photoUrl ? "Click to change photo" : "Click to upload badge photo") : undefined}
          >
            {photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-85"
                />
                {onPhotoClick && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5 text-white mb-0.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white">Change</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-950/30 transition-colors">
                <Upload className="w-6 h-6 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                  Photo Pending
                </span>
                {onPhotoClick && (
                  <span className="text-[7px] font-extrabold text-blue-500 dark:text-blue-300 uppercase tracking-wider mt-0.5 bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded">
                    Click to Upload
                  </span>
                )}
              </div>
            )}
            <div className="absolute bottom-1 right-1 p-0.5 bg-emerald-500 rounded-full text-white shadow-xs z-10">
              <ShieldCheck className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Name & Title */}
          <div className="space-y-0.5 min-w-0 w-full px-1">
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
              {fullName}
            </h4>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate">
              {jobTitle}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {department}
            </p>
          </div>
        </div>

        {/* Card Footer: Barcode & Security Strip */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1">
            <span className="font-bold tracking-wider">{employeeId}</span>
            <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[120px]">
              {accessLevel}
            </span>
          </div>

          {/* Realistic Mock Barcode Strip */}
          <div className="h-6 bg-white dark:bg-slate-900 rounded p-1 flex items-center justify-center gap-0.5 shadow-2xs overflow-hidden">
            {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2].map((w, i) => (
              <span
                key={i}
                className="bg-slate-900 dark:bg-slate-200 h-full inline-block shrink-0 rounded-xs"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[8px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">
            <Cpu className="w-2.5 h-2.5 text-blue-500" />
            <span>NFC • RFID • ISO/IEC 14443</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
