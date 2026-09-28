import React from 'react';
import { Modal } from '../organisms';
import { RADIAN_PERSONA_AVATARS } from '../../utils/radianAvatars';
import { Button } from '../atoms';
import { formatDate } from '../../utils/formatters';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  X,
  ExternalLink,
  Building,
  Calendar,
  Lock,
  Award,
  CreditCard,
  User,
  Landmark,
  BadgeCheck
} from 'lucide-react';

import { DocumentItem, downloadDocumentFile } from '../../utils/downloadDocumentFile';
export type { DocumentItem };
export { downloadDocumentFile };

export interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  employeeName: string;
  jobTitle: string;
  department: string;
  startDate: string;
  employeeId?: string;
  signedName?: string;
  acceptedAt?: string;
  agreementVersion?: string;
  photoUrl?: string;
  digitalSignatureUrl?: string | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  employeeName,
  jobTitle,
  department,
  startDate,
  employeeId = 'EMP-2024-0847',
  signedName,
  acceptedAt,
  agreementVersion = 'v2026.2 (Enterprise Proprietary Information Agreement)',
  photoUrl,
  digitalSignatureUrl
}) => {
  if (!doc) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadDocumentFile(
      doc,
      employeeName,
      employeeId,
      department,
      jobTitle,
      signedName,
      acceptedAt
    );
  };

  const renderDocumentContent = () => {
    // 1. NON-DISCLOSURE AGREEMENT (NDA) & LEGAL CONTRACT
    if (doc.type === 'nda') {
      return (
        <div className="space-y-6 text-left">
          {/* Certificate Header */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
                  EXECUTED LEGAL INSTRUMENT
                </span>
                <h3 className="text-lg font-black text-white">
                  Proprietary Information & Inventions Agreement
                </h3>
                <span className="text-xs text-slate-400">{agreementVersion}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Legally Binding
            </span>
          </div>

          {/* Parties Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                EMPLOYER / CORPORATION
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                Quantira Technologies, Inc.
              </span>
              <span className="text-slate-500">101 California Street, San Francisco, CA 94111</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                EMPLOYEE / RECIPIENT
              </span>
              <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                {employeeName}
              </span>
              <span className="text-slate-500">{jobTitle} • {department} (ID: {employeeId})</span>
            </div>
          </div>

          {/* Contract Body Summary */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Agreement Terms & Covenants Acknowledged
            </h4>
            <p>
              <strong>1. Confidentiality:</strong> The Employee acknowledges that during their employment, they will have access to proprietary trade secrets, algorithms, customer databases, technical architectures, and financial records of Quantira Technologies, Inc. The Employee covenants not to disclose or misappropriate any Confidential Information during or subsequent to their employment.
            </p>
            <p>
              <strong>2. Assignment of Inventions:</strong> All inventions, intellectual property, software source code, patents, and copyrightable works created by the Employee within the scope of their employment are the exclusive property of Quantira Technologies, Inc.
            </p>
            <p>
              <strong>3. Non-Solicitation & Ethics:</strong> The Employee agrees to adhere to the Enterprise Ethics Policy, Data Protection standards (GDPR, SOC 2 Type II, ISO 27001), and confidential treatment of third-party client materials.
            </p>
          </div>

          {/* Electronic Signature Block */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Electronic Signature Verification Record
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                ESIGN & UETA Act Compliant
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Signed By</span>
                {digitalSignatureUrl ? (
                  <div className="py-1">
                    <img src={digitalSignatureUrl} alt="Digital Signature" className="h-10 max-w-[220px] object-contain" />
                    <span className="text-[11px] text-slate-500 font-semibold block">{signedName || employeeName}</span>
                  </div>
                ) : (
                  <span className="font-serif italic text-xl font-bold text-slate-900 dark:text-white block mt-0.5">
                    {signedName || employeeName}
                  </span>
                )}
                <span className="text-[11px] text-slate-500">
                  Timestamp: {formatDate(acceptedAt || startDate)} 10:14:22 UTC
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cryptographic Hash</span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold block">
                  SHA-256: 7f8a9e1c2b4d...992a
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Verified & Countersigned
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. GOVERNMENT PHOTO ID (Passport / Driver License)
    if (doc.type === 'government_id') {
      return (
        <div className="space-y-6 text-left">
          <div className="p-4 rounded-2xl bg-blue-950 text-white border border-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-800/80 text-blue-200 flex items-center justify-center font-bold">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">United States Passport / Official Photo ID</h3>
                <span className="text-xs text-blue-300">Identity & Employment Eligibility Verification (Form I-9)</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white">
              VERIFIED
            </span>
          </div>

          {/* Official ID Credential Card */}
          <div className="p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 bg-blue-800 rounded-sm flex items-center justify-center text-[10px] font-black text-white">USA</div>
                <span className="text-xs font-black tracking-wider text-slate-800 dark:text-slate-100 dark:text-slate-200 uppercase">
                  PASSPORT CARD / IDENTITY CREDENTIAL
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">DOC #P482910482</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-md shrink-0 bg-slate-200">
                <img
                  src={photoUrl || RADIAN_PERSONA_AVATARS.johnDoe}
                  alt="Government ID"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Surname</span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {employeeName.split(' ').slice(-1)[0] || 'DOE'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Given Names</span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {employeeName.split(' ')[0] || 'JOHN'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Nationality</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">UNITED STATES OF AMERICA</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Date of Birth</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">14 AUG 1994</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Issuing Authority</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">U.S. DEPARTMENT OF STATE</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Expiration Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">22 JUL 2034</span>
                </div>
              </div>
            </div>

            {/* MRZ Code simulation */}
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-tight select-all">
              P&lt;USADOE&lt;&lt;JOHN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
              4829104820USA9408144M3407228&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Form I-9 Section 2 physical/digital inspection completed & approved by People Operations on {formatDate(startDate)}.</span>
          </div>
        </div>
      );
    }

    // 3. EDUCATIONAL DEGREE / CERTIFICATE
    if (doc.type === 'educational_certificate') {
      return (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-2xl border-4 border-amber-600/30 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-center space-y-4 shadow-lg relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center shadow-inner">
              <Award className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-serif tracking-widest text-slate-500 uppercase block">
                THE TRUSTEES OF THE UNIVERSITY CONFER UPON
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white mt-1">
                {employeeName}
              </h3>
              <p className="text-sm font-serif italic text-slate-600 dark:text-slate-300 mt-1">
                the Degree of
              </p>
              <h4 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                Bachelor of Science in Computer Science
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                with all Honors, Rights, and Privileges thereunto appertaining
              </p>
            </div>

            <div className="pt-4 border-t border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-6">
              <div>
                <span className="font-serif italic block">President of the University</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">Dr. L. Rafael Reif</span>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/60 flex items-center justify-center font-bold text-[10px] text-amber-700 dark:text-amber-300">
                SEAL
              </div>
              <div>
                <span className="font-serif italic block">Dean of Engineering</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">Dr. Anantha Chandrakasan</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500">Verified via National Student Clearinghouse:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Authenticated Degree Record</span>
          </div>
        </div>
      );
    }

    // 4. BANK ACCOUNT DETAILS / VOIDED CHECK
    if (doc.type === 'bank_details') {
      return (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-2xl border-2 border-blue-300 dark:border-blue-800 bg-linear-to-r from-blue-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                <span className="font-black text-base text-blue-950 dark:text-blue-200">
                  JPMorgan Chase Bank, N.A.
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-rose-600 border border-rose-300 px-2.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40">
                VOID - DIRECT DEPOSIT ONLY
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Beneficiary:</span>
                <span className="font-bold text-slate-900 dark:text-white">{employeeName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Bank Routing Transit Number (ABA):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">121000247</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Account Number (Checking):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">*********6789</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Deposit Allocation:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Net Payroll</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <span>⑆121000247⑆</span>
              <span>*********6789⑈</span>
              <span>1042</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pre-note verification successful. Direct deposit active for upcoming payroll cycle.</span>
          </div>
        </div>
      );
    }

    // 5. TAX WITHHOLDING FORMS (W-4)
    if (doc.type === 'tax_documents') {
      return (
        <div className="space-y-6 text-left">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department of the Treasury — IRS</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Form W-4 Employee's Withholding Certificate</h3>
              </div>
              <span className="font-bold text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                Tax Year 2026
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Social Security Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">***-**-6789</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Filing Status</span>
                <span className="font-bold text-slate-900 dark:text-white">Single / Married Filing Separately</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Multiple Jobs Adjustment</span>
                <span className="font-bold text-slate-900 dark:text-white">Standard</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Dependents (Step 3)</span>
                <span className="font-bold text-slate-900 dark:text-white">$0.00</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Extra Withholding (Step 4c)</span>
                <span className="font-bold text-slate-900 dark:text-white">$0.00</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Electronic Signature</span>
                <span className="font-serif italic font-bold text-sm text-slate-900 dark:text-white">{employeeName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Submitted Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(startDate)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 6. PASSPORT PHOTO / BADGE PHOTO
    if (doc.type === 'passport_photo') {
      return (
        <div className="space-y-6 text-center">
          <div className="w-48 h-56 mx-auto rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100">
            <img
              src={photoUrl || RADIAN_PERSONA_AVATARS.johnDoe}
              alt="Official Badge Portrait"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{employeeName}</h3>
            <p className="text-xs text-slate-500">{jobTitle} • {department}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Biometric Standard ISO/IEC 19794-5 Compliant
            </span>
          </div>
        </div>
      );
    }

    // DEFAULT FALLBACK (Generic document)
    return (
      <div className="p-6 text-center space-y-4">
        <FileText className="w-12 h-12 text-blue-500 mx-auto" />
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">{doc.name}</h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">{doc.fileName || 'document.pdf'} • {doc.fileSize || '1.8 MB'}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
          This document has been verified by Human Resources and archived in the enterprise document repository.
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.name}
      description={`Official record for ${employeeName} (${employeeId})`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {renderDocumentContent()}
    </Modal>
  );
};
