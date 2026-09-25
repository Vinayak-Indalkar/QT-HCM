export type DocumentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export type DocumentType = 
  | 'government_id'
  | 'signed_offer'
  | 'i9_tax_form'
  | 'w4_form'
  | 'nda'
  | 'direct_deposit'
  | 'background_check'
  | 'degree_certificate'
  | (string & {});

export interface OnboardingDocument {
  id: string;
  candidateId: string;
  type: DocumentType;
  title: string;
  description: string;
  status: DocumentStatus;
  required: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}
