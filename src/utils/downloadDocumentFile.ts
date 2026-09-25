/**
 * Utility to generate and download official Quantira HR document files.
 * Extracted from DocumentViewerModal.tsx to satisfy Vite Fast Refresh requirements:
 * a .tsx file must only export React components, not plain utility functions.
 */

export interface DocumentItem {
  id?: string;
  type: string;
  name: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status?: string;
  category?: string;
  isLocked?: boolean;
  required?: boolean;
  description?: string;
}

export const downloadDocumentFile = (
  doc: DocumentItem,
  employeeName: string,
  employeeId: string = 'EMP-2024-0847',
  department: string = 'Engineering',
  jobTitle: string = 'Software Engineer',
  signedName?: string,
  acceptedAt?: string
) => {
  let content = '';
  const isNda = doc.type === 'nda' || doc.id === 'doc-nda' || doc.name.toLowerCase().includes('nda');
  let filename = doc.fileName || `${doc.type || 'document'}_${employeeId}.txt`;

  if (isNda) {
    content = `========================================================================
QUANTIRA TECHNOLOGIES, INC.
EMPLOYEE NON-DISCLOSURE & PROPRIETARY INFORMATION AGREEMENT (NDA)
========================================================================
Effective Date: ${acceptedAt ? new Date(acceptedAt).toLocaleDateString() : 'September 15, 2026'}
Legal Status: Executed & Legally Binding (ESIGN & UETA Compliant)
Agreement Version: v2026.2 (Enterprise PIIA Standard)

PARTIES TO THE AGREEMENT:
Employer / Corporation:
  Quantira Technologies, Inc.
  101 California Street, San Francisco, CA 94111

Employee / Recipient:
  Name: ${employeeName}
  Employee ID: ${employeeId}
  Role: ${jobTitle}
  Department: ${department}

TERMS & COVENANTS ACKNOWLEDGED:
1. NON-DISCLOSURE & CONFIDENTIAL INFORMATION:
   The Employee covenants that during and subsequent to employment with Quantira Technologies,
   they will maintain in strictest confidence and not disclose or misappropriate any proprietary
   trade secrets, source code, system architectures, customer data, pricing, or financial models.

2. ASSIGNMENT OF INVENTIONS & INTELLECTUAL PROPERTY:
   All copyrightable works, patent applications, inventions, architectures, designs, software,
   and discoveries created by Employee within the scope of employment are the sole and exclusive
   intellectual property of Quantira Technologies, Inc.

3. DATA SECURITY, PRIVACY & COMPLIANCE:
   The Employee covenants strict adherence to Enterprise Data Protection Policies (GDPR, SOC 2
   Type II, ISO 27001), corporate device hygiene, and ethics guidelines.

------------------------------------------------------------------------
ELECTRONIC SIGNATURE VERIFICATION RECORD
------------------------------------------------------------------------
Signatory: ${signedName || employeeName}
Signature Status: VERIFIED & COUNTERSIGNED
Signed Timestamp: ${acceptedAt || '2026-09-15 10:14:22 UTC'}
Cryptographic Digest: SHA-256: 7f8a9e1c2b4d88e019fa76b2c8e31001bc992a83e012fe9
Authority: United States ESIGN Act (15 U.S.C. § 7001) & UETA
Countersigned by: Principal Enterprise Administrator, Quantira Technologies, Inc.
========================================================================`;
    filename = 'signed_nda_confidentiality_agreement.txt';
  } else {
    content = `========================================================================
QUANTIRA TECHNOLOGIES ENTERPRISE REPOSITORY
OFFICIAL EMPLOYEE RECORD: ${doc.name}
========================================================================
Employee Name: ${employeeName}
Employee ID: ${employeeId}
Role: ${jobTitle}
Department: ${department}
Category: ${doc.category || 'Official Record'}
Original File: ${doc.fileName || 'document.pdf'}
File Size: ${doc.fileSize || '1.8 MB'}
Verification Status: ${doc.status || 'Verified'}
Audit Timestamp: ${new Date().toISOString()}

This document is authenticated and archived in the enterprise personnel repository.
Quantira Technologies, Inc. • Human Resources & People Operations
========================================================================`;
    filename = doc.fileName
      ? (doc.fileName.endsWith('.txt') || doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.txt`)
      : `${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
