import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OnboardingData, OnboardingStepId, UploadedDocument, ONBOARDING_STEPS } from '../types/onboarding';
import { useToast } from './ToastContext';
import { RADIAN_PERSONA_AVATARS, getAvatarByGender } from '../utils/radianAvatars';
import { getAssignedAssetsForEmployee } from '../services/assetService';
import { getOnboardingStatutoryDocuments } from '../services/corporateDocumentService';

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  // Step 1: Personal Info - Only HR Admin pre-assigned fields will be populated
  personalInfo: {
    name: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    nationality: '',
    bloodGroup: '',
    email: '',
    corporateEmail: '',
    personalEmail: '',
    jobTitle: '',
    department: '',
    employeeId: '',
    startDate: '',
    workLocation: '',
    workModel: 'Hybrid',
    employmentType: 'Full-time',
    education: '',
    line1Manager: '',
    line2Manager: '',
    phone: '',
    contactNumber1: '',
    contactNumber2: '',
    hireSource: '',
    offerReference: '',
    githubUsername: '',
    linkedinUrl: '',
    dependents: [],
    emergencyContacts: []
  },

  // Step 2: Statutory Documents - All start as pending for user to upload, categorized by section
  documents: [
    {
      id: 'doc-gov-id',
      type: 'government_id',
      name: 'Government-Issued Photo ID (Passport or Driver License)',
      category: 'Government & Identity Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-passport-photo',
      type: 'passport_photo',
      name: 'Official Passport-Size Photo for Badge',
      category: 'Government & Identity Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-edu-cert',
      type: 'educational_certificate',
      name: 'Highest Educational Degree Certificate & Transcripts',
      category: 'Education Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-prev-offer-letter',
      type: 'previous_offer_letter',
      name: 'Previous Organization Offer / Appointment Letter',
      category: 'Last Organization Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-relieving-letter',
      type: 'relieving_letter',
      name: 'Relieving Letter (From Last Organization)',
      category: 'Last Organization Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-experience-letter',
      type: 'experience_letter',
      name: 'Previous Experience Certificate / Service Letter',
      category: 'Last Organization Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-salary-slips',
      type: 'salary_slips',
      name: 'Last 3 Months Payslips / Salary Slips',
      category: 'Last Organization Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-bank-details',
      type: 'bank_details',
      name: 'Bank Account / Voided Check (Direct Deposit)',
      category: 'Financial & Tax Documents',
      required: false,
      status: 'pending'
    },
    {
      id: 'doc-tax-forms',
      type: 'tax_documents',
      name: 'Tax Withholding Forms (W-4 / State Form / Form 16)',
      category: 'Financial & Tax Documents',
      required: false,
      status: 'pending'
    }
  ],

  // Step 3: NDA / Agreement
  nda: {
    agreementVersion: 'v2026.2 (Enterprise Proprietary Information Agreement)',
    accepted: false,
    acceptedAt: undefined,
    signedName: ''
  },

  // Step 4: Corporate Account Setup
  corporateAccount: {
    corporateEmail: '',
    accountStatus: 'Provisioned',
    ssoProvider: 'Okta Enterprise SSO',
    temporaryPassword: 'TempPass#2026!Qtr',
    instructions:
      'Your corporate Google Workspace and GitHub Enterprise accounts are provisioned under your corporate email. On Day 1, you will authenticate via Okta SSO using your primary work laptop.'
  },

  // Step 5: Employee Photo - Clean state, employee must upload photo
  photo: {
    photoUrl: '',
    fileName: '',
    fileSize: ''
  },

  // Step 6: Email Signature
  emailSignature: {
    name: '',
    title: '',
    department: '',
    phone: '',
    mobile: '',
    tagline: ''
  },

  // Step 7: Equipment - Only items assigned by HR/Admin
  equipment: {
    selectedEquipment: [],
    specialRequests: '',
    status: 'Requested'
  },

  // Step 8: Team & Manager
  team: {
    managerName: '',
    managerTitle: '',
    managerEmail: '',
    managerPhone: '',
    managerAvatar: '',
    teamName: '',
    teamDescription: '',
    firstWeekBuddy: ''
  },

  // Step 9: Office Setup - Clean state, employee sets preferences
  officeSetup: {
    deskLocation: '',
    parkingRequired: false,
    licensePlate: '',
    permitType: '',
    accessCardLevel: '',
    lockerRequired: false,
    specialAccommodations: ''
  },

  // Step & Flow metadata
  currentStepIndex: 0,
  status: 'In Progress',
  completedSteps: []
};

interface OnboardingFlowContextType {
  data: OnboardingData;
  activeEmployeeId: string;
  currentStepIndex: number;
  currentStep: (typeof ONBOARDING_STEPS)[number];
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  loadEmployee: (employeeId: string, initialInfo?: Partial<OnboardingData['personalInfo']>) => void;
  updatePersonalInfo: (info: Partial<OnboardingData['personalInfo']>) => void;
  uploadDocument: (docId: string, file: { name: string; size: string }) => void;
  removeDocument: (docId: string) => void;
  addCustomDocument: (doc: {
    name: string;
    type: string;
    fileName: string;
    fileSize: string;
    category?: string;
    required?: boolean;
  }) => void;
  signNda: (signedName: string) => void;
  updatePhoto: (photo: { photoUrl: string; fileName: string; fileSize: string } | null) => void;
  updateSignature: (sig: Partial<OnboardingData['emailSignature']>) => void;
  toggleEquipment: (item: string) => void;
  setEquipmentRequests: (notes: string) => void;
  updateOfficeSetup: (setup: Partial<OnboardingData['officeSetup']>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isStepCompleted: (stepId: OnboardingStepId) => boolean;
}

const OnboardingFlowContext = createContext<OnboardingFlowContextType | undefined>(undefined);

const STORAGE_KEY_FLOW = 'onboarding_mvp_flow_data';

export const OnboardingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, warning, info } = useToast();

  const [activeEmployeeId, setActiveEmployeeId] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get('invite');
      if (invite) return invite;
      const storedActive = localStorage.getItem('quantira_active_onboarding_id');
      if (storedActive) return storedActive;
      const savedCand = localStorage.getItem('quantira_onboarding_candidates');
      if (savedCand) {
        const cands = JSON.parse(savedCand);
        if (Array.isArray(cands) && cands.length > 0) {
          return cands[0].id;
        }
      }
    } catch {
      // ignore
    }
    return 'EMP-2024-0847';
  });

  const mergeSavedData = (parsed: any): OnboardingData => {
    const customDocs = (parsed.documents || []).filter(
      (d: any) => !INITIAL_ONBOARDING_DATA.documents.some((initDoc) => initDoc.id === d.id)
    );
    const mergedDocs = [
      ...INITIAL_ONBOARDING_DATA.documents.map((initDoc) => {
        const existing = parsed.documents?.find((d: any) => d.id === initDoc.id);
        return existing ? { ...initDoc, ...existing } : initDoc;
      }),
      ...customDocs
    ];
    return {
      ...INITIAL_ONBOARDING_DATA,
      ...parsed,
      personalInfo: {
        ...INITIAL_ONBOARDING_DATA.personalInfo,
        ...parsed.personalInfo,
        workModel: parsed.personalInfo?.workModel || INITIAL_ONBOARDING_DATA.personalInfo.workModel || 'Hybrid',
        corporateEmail: parsed.personalInfo?.corporateEmail || INITIAL_ONBOARDING_DATA.personalInfo.corporateEmail,
        personalEmail: parsed.personalInfo?.personalEmail || '',
        education: parsed.personalInfo?.education || '',
        phone: parsed.personalInfo?.phone || ''
      },
      documents: mergedDocs,
    };
  };

  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get('invite');
      const targetId = invite || localStorage.getItem('quantira_active_onboarding_id');
      if (targetId) {
        const savedEmp = localStorage.getItem(`onboarding_flow_${targetId}`);
        if (savedEmp) {
          const parsed = JSON.parse(savedEmp);
          if (parsed && parsed.personalInfo) {
            return mergeSavedData(parsed);
          }
        }
      }
      const saved = localStorage.getItem(STORAGE_KEY_FLOW);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.personalInfo) {
          return mergeSavedData(parsed);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ONBOARDING_DATA;
  });

  const PREDEFINED_MANAGERS = [
    { name: 'Marcus Brody', title: 'VP of Engineering' },
    { name: 'Alexandra Wright', title: 'Director of Operations' },
    { name: 'Claire Delacroix', title: 'VP of Product' },
    { name: 'Victor Vance', title: 'VP of Design' },
    { name: 'Rachel Green', title: 'Head of Marketing' },
    { name: 'Eleanor Vance', title: 'HR Operations Lead' },
    { name: 'Sarah Jenkins', title: 'Engineering Manager' },
    { name: 'David Chen', title: 'Product Lead' },
    { name: 'Michael Chang', title: 'Head of Architecture' }
  ];

  const loadEmployee = useCallback(
    (employeeId: string, initialInfo?: Partial<OnboardingData['personalInfo']>) => {
      setActiveEmployeeId(employeeId);
      try {
        localStorage.setItem('quantira_active_onboarding_id', employeeId);
      } catch {
        // ignore
      }

      let candidateInfo: Partial<OnboardingData['personalInfo']> = {};
      let foundCandidate: any = null;
      try {
        const savedCand = localStorage.getItem('quantira_onboarding_candidates');
        if (savedCand) {
          const cands = JSON.parse(savedCand);
          const found = cands.find(
            (c: any) => c.id === employeeId || (initialInfo?.email && c.email === initialInfo.email)
          );
          if (found) {
            foundCandidate = found;
            const fName = found.firstName || (found.name ? found.name.split(' ')[0] : '');
            const lName = found.lastName || (found.name ? found.name.split(' ').slice(1).join(' ') : '');
            const fullN = found.name || `${fName} ${lName}`.trim();
            candidateInfo = {
              name: fullN,
              firstName: fName,
              lastName: lName,
              gender: found.gender || '',
              email: found.corporateEmail || found.email,
              corporateEmail: found.corporateEmail || found.email,
              personalEmail: found.personalEmail || '',
              jobTitle: found.jobTitle,
              department: found.department,
              startDate: found.startDate,
              workLocation: found.officeLocation || found.workLocation,
              workModel: found.workModel || 'Hybrid',
              employmentType: found.employmentType,
              line1Manager: found.line1Manager || found.manager,
              line2Manager: found.line2Manager,
              phone: found.phone || '',
              education: found.education || '',
              customFields: found.customFields || {}
            };

            // Sync custom fields to localStorage if present
            if (found.customFields && Object.keys(found.customFields).length > 0) {
              try {
                const existingCustom = JSON.parse(localStorage.getItem('quantira_employee_custom_values') || '{}');
                localStorage.setItem(
                  'quantira_employee_custom_values',
                  JSON.stringify({ ...existingCustom, ...found.customFields })
                );
              } catch {}
            }
          }
        }
      } catch {}

      const mergedPersonalInfo = {
        ...INITIAL_ONBOARDING_DATA.personalInfo,
        employeeId,
        workModel: candidateInfo.workModel || initialInfo?.workModel || foundCandidate?.workModel || 'Hybrid',
        ...candidateInfo,
        ...(initialInfo || {})
      };

      const fullName =
        mergedPersonalInfo.name ||
        `${mergedPersonalInfo.firstName} ${mergedPersonalInfo.lastName}`.trim();
      mergedPersonalInfo.name = fullName;
      const corpEmail =
        initialInfo?.corporateEmail ||
        initialInfo?.email ||
        foundCandidate?.corporateEmail ||
        foundCandidate?.email ||
        candidateInfo.corporateEmail ||
        candidateInfo.email ||
        mergedPersonalInfo.corporateEmail ||
        mergedPersonalInfo.email ||
        `${mergedPersonalInfo.firstName.toLowerCase()}.${mergedPersonalInfo.lastName.toLowerCase()}@quantira.com`;

      mergedPersonalInfo.corporateEmail = corpEmail;
      mergedPersonalInfo.email = corpEmail;
      const managerName =
        mergedPersonalInfo.line1Manager ||
        foundCandidate?.line1Manager ||
        foundCandidate?.manager ||
        '';
      const matchedMgr = PREDEFINED_MANAGERS.find(
        (m) => m.name.toLowerCase() === managerName.toLowerCase()
      );
      const managerTitle =
        matchedMgr?.title || foundCandidate?.managerTitle || (managerName ? 'Engineering Manager & Team Lead' : '');
      const managerEmail = managerName ? `${managerName.toLowerCase().replace(/\s+/g, '.')}@quantira.com` : '';

      // Extract hardware & equipment assigned by HR / Admin / Assets Menu
      const equipmentItems: string[] = [];
      let equipmentNotes = '';

      // 1. Fetch directly assigned assets from Central IT Inventory (Assets Menu)
      try {
        const catalogAssigned = getAssignedAssetsForEmployee(employeeId, fullName, corpEmail);
        catalogAssigned.forEach((ast) => {
          equipmentItems.push(`${ast.name} [${ast.assetTag}]`);
        });
      } catch {}

      // 2. Extract hardware fields recorded in candidate profile
      if (foundCandidate?.equipment) {
        if (foundCandidate.equipment.laptopModel) {
          equipmentItems.push(foundCandidate.equipment.laptopModel);
        }
        if (foundCandidate.equipment.monitors) {
          const mCount = Number(foundCandidate.equipment.monitors);
          equipmentItems.push(mCount === 1 ? '1x External 4K UHD Display' : `${mCount}x Dual 4K UHD Displays`);
        }
        if (Array.isArray(foundCandidate.equipment.accessories)) {
          equipmentItems.push(...foundCandidate.equipment.accessories);
        }
        if (foundCandidate.equipment.notes) {
          equipmentNotes = foundCandidate.equipment.notes;
        }
      }

      // 3. Fetch statutory document requirements from Corporate Documents (Documents Menu)
      let statutoryDocsFromMenu: UploadedDocument[] = [];
      try {
        const rawDocsMenu = getOnboardingStatutoryDocuments();
        statutoryDocsFromMenu = rawDocsMenu.map((doc) => ({
          id: doc.id,
          type: doc.code,
          name: doc.title,
          required: doc.mandatory,
          status: 'pending'
        }));
      } catch {}

      const preOnboardingData = foundCandidate?.onboardingData;

      try {
        const saved = localStorage.getItem(`onboarding_flow_${employeeId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const finalEquipmentList = Array.from(
            new Set([
              ...(parsed.equipment?.selectedEquipment || []),
              ...equipmentItems,
              ...(preOnboardingData?.equipment?.selectedEquipment || [])
            ])
          );

          const baseDocs = parsed.documents && parsed.documents.length > 0 ? parsed.documents : INITIAL_ONBOARDING_DATA.documents;
          const mergedDocsList = [
            ...baseDocs,
            ...statutoryDocsFromMenu.filter((md) => !baseDocs.some((bd: any) => bd.id === md.id || bd.name === md.name))
          ];

          const mergedData: OnboardingData = {
            ...INITIAL_ONBOARDING_DATA,
            ...parsed,
            personalInfo: {
              ...INITIAL_ONBOARDING_DATA.personalInfo,
              ...parsed.personalInfo,
              ...mergedPersonalInfo,
              corporateEmail: corpEmail,
              email: corpEmail,
              personalEmail: parsed.personalInfo?.personalEmail || candidateInfo.personalEmail || initialInfo?.personalEmail || '',
              education: parsed.personalInfo?.education || candidateInfo.education || initialInfo?.education || '',
              phone: parsed.personalInfo?.phone || candidateInfo.phone || initialInfo?.phone || ''
            },
            documents: mergedDocsList,
            corporateAccount: {
              ...INITIAL_ONBOARDING_DATA.corporateAccount,
              ...(parsed.corporateAccount || {}),
              corporateEmail: corpEmail,
              instructions: `Your corporate Google Workspace and GitHub Enterprise accounts are provisioned under ${corpEmail}. On Day 1, you will authenticate via Okta SSO using your primary work laptop.`
            },
            emailSignature: {
              ...INITIAL_ONBOARDING_DATA.emailSignature,
              name: fullName,
              title: mergedPersonalInfo.jobTitle,
              department: mergedPersonalInfo.department,
              mobile: mergedPersonalInfo.phone || '',
              ...(parsed.emailSignature || {})
            },
            team: {
              ...INITIAL_ONBOARDING_DATA.team,
              managerName,
              managerTitle,
              managerEmail,
              teamName: `${mergedPersonalInfo.department} Team`,
              ...(parsed.team || {})
            },
            equipment: {
              ...INITIAL_ONBOARDING_DATA.equipment,
              selectedEquipment: finalEquipmentList,
              specialRequests:
                parsed.equipment?.specialRequests ||
                preOnboardingData?.equipment?.specialRequests ||
                equipmentNotes ||
                '',
              status: parsed.equipment?.status || 'Requested'
            }
          };
          setData(mergedData);
          try {
            localStorage.setItem(`onboarding_flow_${employeeId}`, JSON.stringify(mergedData));
            localStorage.setItem(STORAGE_KEY_FLOW, JSON.stringify(mergedData));
          } catch {}
          return;
        }
      } catch {
        // ignore
      }

      // Initialize with this employee's info
      const initialEquipmentFromCandidate = Array.from(
        new Set([
          ...equipmentItems,
          ...(preOnboardingData?.equipment?.selectedEquipment || [])
        ])
      );

      const initialMergedDocs = [
        ...INITIAL_ONBOARDING_DATA.documents,
        ...statutoryDocsFromMenu.filter((md) => !INITIAL_ONBOARDING_DATA.documents.some((bd) => bd.id === md.id || bd.name === md.name))
      ];

      const newEmployeeData: OnboardingData = {
        ...INITIAL_ONBOARDING_DATA,
        personalInfo: mergedPersonalInfo,
        documents: initialMergedDocs,
        corporateAccount: {
          ...INITIAL_ONBOARDING_DATA.corporateAccount,
          corporateEmail: corpEmail,
          instructions: `Your corporate Google Workspace and GitHub Enterprise accounts are provisioned under ${corpEmail}. On Day 1, you will authenticate via Okta SSO using your primary work laptop.`
        },
        emailSignature: {
          ...INITIAL_ONBOARDING_DATA.emailSignature,
          name: fullName,
          title: mergedPersonalInfo.jobTitle,
          department: mergedPersonalInfo.department,
          mobile: mergedPersonalInfo.phone || ''
        },
        team: {
          ...INITIAL_ONBOARDING_DATA.team,
          managerName,
          managerTitle,
          managerEmail,
          teamName: `${mergedPersonalInfo.department} Team`
        },
        equipment: {
          ...INITIAL_ONBOARDING_DATA.equipment,
          selectedEquipment: initialEquipmentFromCandidate,
          specialRequests:
            preOnboardingData?.equipment?.specialRequests ||
            equipmentNotes ||
            '',
          status: 'Requested'
        },
        currentStepIndex: 0,
        completedSteps: [],
        status: 'In Progress'
      };
      setData(newEmployeeData);
      try {
        localStorage.setItem(`onboarding_flow_${employeeId}`, JSON.stringify(newEmployeeData));
        localStorage.setItem(STORAGE_KEY_FLOW, JSON.stringify(newEmployeeData));
      } catch {
        // ignore
      }
    },
    []
  );

  // Local storage save & resume
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FLOW, JSON.stringify(data));
      if (activeEmployeeId) {
        localStorage.setItem(`onboarding_flow_${activeEmployeeId}`, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  }, [data, activeEmployeeId]);

  // Reactively sync with Documents Menu and Assets Menu updates in real-time
  useEffect(() => {
    const handleDocsUpdated = () => {
      try {
        const statutory = getOnboardingStatutoryDocuments();
        setData((prev) => {
          const currentDocs = prev.documents || [];
          const updatedDocs: UploadedDocument[] = [
            ...currentDocs,
            ...statutory
              .filter((sd) => !currentDocs.some((cd) => cd.id === sd.id || cd.name.toLowerCase() === sd.title.toLowerCase()))
              .map((sd) => ({
                id: sd.id,
                type: sd.code,
                name: sd.title,
                required: sd.mandatory,
                status: 'pending' as const
              }))
          ];
          return { ...prev, documents: updatedDocs };
        });
      } catch (e) {
        console.error('Error synchronizing statutory documents:', e);
      }
    };

    const handleAssetsUpdated = () => {
      try {
        const fullName = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim();
        const assigned = getAssignedAssetsForEmployee(
          activeEmployeeId,
          fullName,
          data.personalInfo.corporateEmail || data.personalInfo.email
        );
        if (assigned.length > 0) {
          setData((prev) => {
            const currentSelected = prev.equipment.selectedEquipment || [];
            const newNames = assigned.map((a) => a.name);
            const mergedEquipment = Array.from(new Set([...currentSelected, ...newNames]));
            return {
              ...prev,
              equipment: {
                ...prev.equipment,
                selectedEquipment: mergedEquipment,
                assignedAssets: assigned
              }
            };
          });
        }
      } catch (e) {
        console.error('Error synchronizing assigned assets:', e);
      }
    };

    window.addEventListener('quantira_documents_updated', handleDocsUpdated);
    window.addEventListener('quantira_assets_updated', handleAssetsUpdated);
    return () => {
      window.removeEventListener('quantira_documents_updated', handleDocsUpdated);
      window.removeEventListener('quantira_assets_updated', handleAssetsUpdated);
    };
  }, [activeEmployeeId, data.personalInfo]);

  const currentStep = ONBOARDING_STEPS[data.currentStepIndex] || ONBOARDING_STEPS[0];

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < ONBOARDING_STEPS.length) {
      setData((prev) => ({ ...prev, currentStepIndex: index }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const nextStep = useCallback(() => {
    setData((prev) => {
      const stepMeta = ONBOARDING_STEPS[prev.currentStepIndex];
      const completed = new Set(prev.completedSteps);
      if (stepMeta) completed.add(stepMeta.id);

      const nextIndex = Math.min(ONBOARDING_STEPS.length - 1, prev.currentStepIndex + 1);
      return {
        ...prev,
        currentStepIndex: nextIndex,
        completedSteps: Array.from(completed)
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const prevStep = useCallback(() => {
    setData((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1)
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updatePersonalInfo = useCallback((infoUpdate: Partial<OnboardingData['personalInfo']>) => {
    setData((prev) => {
      let fName = infoUpdate.firstName ?? prev.personalInfo.firstName;
      let lName = infoUpdate.lastName ?? prev.personalInfo.lastName;
      let fullN = infoUpdate.name ?? prev.personalInfo.name;

      if (infoUpdate.name !== undefined && infoUpdate.firstName === undefined && infoUpdate.lastName === undefined) {
        const parts = infoUpdate.name.trim().split(/\s+/);
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      } else if ((infoUpdate.firstName !== undefined || infoUpdate.lastName !== undefined) && infoUpdate.name === undefined) {
        fullN = `${fName} ${lName}`.trim();
      }

      // If gender changed and no custom user file upload exists, update photoUrl to match gender
      const newGender = infoUpdate.gender !== undefined ? infoUpdate.gender : prev.personalInfo.gender;
      let updatedPhoto = prev.photo;
      if (infoUpdate.gender && infoUpdate.gender !== prev.personalInfo.gender && !prev.photo?.fileName) {
        const genderAvatar = getAvatarByGender(newGender, fullN);
        updatedPhoto = {
          ...prev.photo,
          photoUrl: genderAvatar
        };
        try {
          if (activeEmployeeId) {
            localStorage.setItem(`quantira_avatar_${activeEmployeeId}`, genderAvatar);
          }
          window.dispatchEvent(new CustomEvent('quantira_profile_photo_updated', { detail: { photoUrl: genderAvatar } }));
        } catch {}
      }

      return {
        ...prev,
        photo: updatedPhoto,
        personalInfo: {
          ...prev.personalInfo,
          ...infoUpdate,
          name: fullN,
          firstName: fName,
          lastName: lName
        }
      };
    });
  }, [activeEmployeeId]);

  const uploadDocument = useCallback(
    (docId: string, file: { name: string; size: string }) => {
      setData((prev) => {
        const nextDocs = prev.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                fileName: file.name,
                fileSize: file.size,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded' as const
              }
            : d
        );

        // Synchronize to employee profile documents repository
        try {
          const profileStorageKey = `quantira_employee_documents_${activeEmployeeId}`;
          const currentProfileDocs = JSON.parse(localStorage.getItem(profileStorageKey) || '[]');
          const targetDoc = nextDocs.find((d) => d.id === docId);
          let updated = currentProfileDocs.map((pDoc: any) =>
            pDoc.id === docId
              ? {
                  ...pDoc,
                  fileName: file.name,
                  fileSize: file.size,
                  uploadedAt: new Date().toISOString(),
                  status: 'verified'
                }
              : pDoc
          );
          if (targetDoc && !currentProfileDocs.some((pDoc: any) => pDoc.id === docId)) {
            updated.push({
              id: targetDoc.id,
              type: targetDoc.type,
              name: targetDoc.name,
              category: (targetDoc as any).category || 'Prior Employment',
              fileName: file.name,
              fileSize: file.size,
              uploadedAt: new Date().toISOString(),
              status: 'verified',
              isLocked: false,
              required: targetDoc.required
            });
          }
          localStorage.setItem(profileStorageKey, JSON.stringify(updated));
        } catch {}

        return {
          ...prev,
          documents: nextDocs
        };
      });
      success('Document Uploaded', `${file.name} is ready for HR review.`);
    },
    [activeEmployeeId, success]
  );

  const removeDocument = useCallback(
    (docId: string) => {
      setData((prev) => {
        const isCustom = docId.startsWith('doc-custom-');
        const nextDocs = isCustom
          ? prev.documents.filter((d) => d.id !== docId)
          : prev.documents.map((d) =>
              d.id === docId
                ? {
                    ...d,
                    fileName: undefined,
                    fileSize: undefined,
                    uploadedAt: undefined,
                    status: 'pending' as const
                  }
                : d
            );

        // Synchronize to employee profile documents repository
        try {
          const profileStorageKey = `quantira_employee_documents_${activeEmployeeId}`;
          const currentProfileDocs = JSON.parse(localStorage.getItem(profileStorageKey) || '[]');
          const updated = isCustom
            ? currentProfileDocs.filter((pDoc: any) => pDoc.id !== docId)
            : currentProfileDocs.map((pDoc: any) =>
                pDoc.id === docId
                  ? {
                      ...pDoc,
                      fileName: undefined,
                      fileSize: undefined,
                      uploadedAt: undefined,
                      status: 'pending'
                    }
                  : pDoc
              );
          localStorage.setItem(profileStorageKey, JSON.stringify(updated));
        } catch {}

        return {
          ...prev,
          documents: nextDocs
        };
      });
      warning('Document Removed', 'You can upload an updated copy at any time.');
    },
    [activeEmployeeId, warning]
  );

  const addCustomDocument = useCallback(
    (doc: {
      name: string;
      type: string;
      fileName: string;
      fileSize: string;
      category?: string;
      required?: boolean;
    }) => {
      const newDoc: UploadedDocument = {
        id: `doc-custom-${Date.now()}`,
        type: doc.type || 'other_document',
        name: doc.name,
        category: doc.category || 'Prior Employment',
        required: doc.required ?? false,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };

      setData((prev) => {
        const nextDocs = [...prev.documents, newDoc];

        // Synchronize to employee profile documents repository
        try {
          const profileStorageKey = `quantira_employee_documents_${activeEmployeeId}`;
          const currentProfileDocs = JSON.parse(localStorage.getItem(profileStorageKey) || '[]');
          const profileItem = {
            id: newDoc.id,
            type: newDoc.type,
            name: newDoc.name,
            category: newDoc.category || 'Prior Employment',
            fileName: newDoc.fileName,
            fileSize: newDoc.fileSize,
            uploadedAt: newDoc.uploadedAt,
            status: 'verified',
            isLocked: false,
            required: false,
            description: 'Uploaded by employee during onboarding verification.'
          };
          localStorage.setItem(profileStorageKey, JSON.stringify([...currentProfileDocs, profileItem]));
        } catch {}

        return {
          ...prev,
          documents: nextDocs
        };
      });

      success('Document Added', `"${doc.name}" has been uploaded and added to your profile.`);
    },
    [activeEmployeeId, success]
  );

  const signNda = useCallback((signedName: string) => {
    setData((prev) => ({
      ...prev,
      nda: {
        ...prev.nda,
        accepted: true,
        acceptedAt: new Date().toISOString(),
        signedName
      }
    }));
    success('Agreement Signed', 'NDA acceptance recorded with timestamp verification.');
  }, [success]);

  const updatePhoto = useCallback((photoInfo: { photoUrl: string; fileName: string; fileSize: string } | null) => {
    setData((prev) => {
      const nextPhoto = photoInfo
        ? {
            photoUrl: photoInfo.photoUrl,
            fileName: photoInfo.fileName,
            fileSize: photoInfo.fileSize,
            uploadedAt: new Date().toISOString()
          }
        : {
            photoUrl: undefined,
            fileName: undefined,
            fileSize: undefined,
            uploadedAt: undefined
          };

      try {
        if (photoInfo?.photoUrl) {
          if (activeEmployeeId) {
            localStorage.setItem(`quantira_profile_photo_${activeEmployeeId}`, photoInfo.photoUrl);
            localStorage.setItem(`quantira_avatar_${activeEmployeeId}`, photoInfo.photoUrl);
          }
          localStorage.setItem('quantira_avatar_CANDIDATE', photoInfo.photoUrl);
          const savedCandidates = localStorage.getItem('quantira_candidates');
          if (savedCandidates) {
            const list = JSON.parse(savedCandidates);
            const empId = activeEmployeeId || prev.personalInfo.employeeId;
            const updatedCandidates = list.map((c: any) =>
              c.id === empId || c.employeeId === empId
                ? { ...c, avatarUrl: photoInfo.photoUrl }
                : c
            );
            localStorage.setItem('quantira_candidates', JSON.stringify(updatedCandidates));
          }
          window.dispatchEvent(new CustomEvent('quantira_profile_photo_updated', { detail: { photoUrl: photoInfo.photoUrl } }));
        } else {
          if (activeEmployeeId) {
            localStorage.removeItem(`quantira_profile_photo_${activeEmployeeId}`);
            localStorage.removeItem(`quantira_avatar_${activeEmployeeId}`);
          }
          window.dispatchEvent(new CustomEvent('quantira_profile_photo_updated', { detail: { photoUrl: null } }));
        }
      } catch {}

      return {
        ...prev,
        photo: nextPhoto
      };
    });

    if (photoInfo) {
      success('Photo Updated', 'Your ID badge & profile picture have been updated.');
    } else {
      info('Photo Removed', 'You can upload a new photo.');
    }
  }, [activeEmployeeId, info, success]);

  const updateSignature = useCallback((sig: Partial<OnboardingData['emailSignature']>) => {
    setData((prev) => ({
      ...prev,
      emailSignature: { ...prev.emailSignature, ...sig }
    }));
  }, []);

  const toggleEquipment = useCallback((item: string) => {
    setData((prev) => {
      const current = prev.equipment.selectedEquipment;
      const exists = current.includes(item);
      const next = exists ? current.filter((i) => i !== item) : [...current, item];
      return {
        ...prev,
        equipment: { ...prev.equipment, selectedEquipment: next }
      };
    });
  }, []);

  const setEquipmentRequests = useCallback((notes: string) => {
    setData((prev) => ({
      ...prev,
      equipment: { ...prev.equipment, specialRequests: notes }
    }));
  }, []);

  const updateOfficeSetup = useCallback((setup: Partial<OnboardingData['officeSetup']>) => {
    setData((prev) => ({
      ...prev,
      officeSetup: { ...prev.officeSetup, ...setup }
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    const allStepIds = ONBOARDING_STEPS.map((s) => s.id);
    const updated: OnboardingData = {
      ...data,
      status: 'Completed',
      completedSteps: allStepIds,
      completedAt: new Date().toISOString()
    };
    setData(updated);
    try {
      localStorage.setItem(STORAGE_KEY_FLOW, JSON.stringify(updated));
      if (activeEmployeeId) {
        localStorage.setItem(`onboarding_flow_${activeEmployeeId}`, JSON.stringify(updated));
      }
      window.dispatchEvent(
        new CustomEvent('quantira_employee_completed', {
          detail: { employeeId: activeEmployeeId, data: updated }
        })
      );
    } catch {
      // ignore
    }
    success('Onboarding Completed!', 'Your onboarding package has been submitted to HR.');
  }, [data, activeEmployeeId, success]);

  const resetOnboarding = useCallback(() => {
    setData(INITIAL_ONBOARDING_DATA);
    try {
      localStorage.removeItem(STORAGE_KEY_FLOW);
    } catch {
      // ignore
    }
    info('Onboarding Reset', 'Restored initial demo onboarding state.');
  }, [info]);

  const isStepCompleted = useCallback(
    (stepId: OnboardingStepId) => {
      return data.completedSteps.includes(stepId);
    },
    [data.completedSteps]
  );

  return (
    <OnboardingFlowContext.Provider
      value={{
        data,
        activeEmployeeId,
        loadEmployee,
        currentStepIndex: data.currentStepIndex,
        currentStep,
        goToStep,
        nextStep,
        prevStep,
        updatePersonalInfo,
        uploadDocument,
        removeDocument,
        addCustomDocument,
        signNda,
        updatePhoto,
        updateSignature,
        toggleEquipment,
        setEquipmentRequests,
        updateOfficeSetup,
        completeOnboarding,
        resetOnboarding,
        isStepCompleted
      }}
    >
      {children}
    </OnboardingFlowContext.Provider>
  );
};

export const useOnboardingFlow = () => {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error('useOnboardingFlow must be used within an OnboardingFlowProvider');
  }
  return context;
};
