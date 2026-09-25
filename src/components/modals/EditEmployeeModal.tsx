import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/TextInput';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Candidate, EmploymentType, WorkModel } from '../../types/candidate';
import { DEPARTMENTS, LOCATIONS } from '../../services/mockData';
import {
  getCustomFields,
  CustomProfileField,
  getStandardFieldConfigs,
  StandardFieldConfig,
  getEmployeeFieldOrder,
  getEmployeeSectionOrder
} from '../../services/customFieldsService';
import { DynamicCustomFieldInput } from '../customizer/DynamicCustomFieldInput';
import { useOnboarding } from '../../context/OnboardingContext';
import { useToast } from '../../context/ToastContext';
import { UserCheck, CheckCircle2, UserPlus, MapPin, Briefcase, Users, Tag } from 'lucide-react';

export interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  candidate
}) => {
  const { updateCandidate } = useOnboarding();
  const { success } = useToast();

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('Mr.');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [nationality, setNationality] = useState('United States');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [hireSource, setHireSource] = useState('Direct Application');
  const [offerReference, setOfferReference] = useState('');
  const [email, setEmail] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contactNumber2, setContactNumber2] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [workModel, setWorkModel] = useState<WorkModel>('Hybrid');
  const [startDate, setStartDate] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [line1Manager, setLine1Manager] = useState('');
  const [line2Manager, setLine2Manager] = useState('');
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, any>>({});
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Dynamic Customizer Configuration & Sequence States
  const [empSectionOrder, setEmpSectionOrder] = useState<string[]>(() => getEmployeeSectionOrder());
  const [empFieldOrder, setEmpFieldOrder] = useState<string[]>(() => getEmployeeFieldOrder());
  const [standardFields, setStandardFields] = useState<StandardFieldConfig[]>(() => getStandardFieldConfigs());
  const [customFields, setCustomFields] = useState<CustomProfileField[]>(() => {
    try {
      return getCustomFields();
    } catch {
      return [];
    }
  });

  // Listen for real-time changes from Super Admin Customizer
  useEffect(() => {
    const handleFieldOrderUpdate = (e: any) => {
      setEmpFieldOrder(e.detail || getEmployeeFieldOrder());
    };
    const handleSectionOrderUpdate = (e: any) => {
      setEmpSectionOrder(e.detail || getEmployeeSectionOrder());
    };
    const handleFieldConfigsUpdate = (e: any) => {
      setStandardFields(e.detail || getStandardFieldConfigs());
    };
    const handleCustomFieldsUpdate = () => {
      setCustomFields(getCustomFields());
    };

    window.addEventListener('quantira_employee_field_order_updated', handleFieldOrderUpdate);
    window.addEventListener('quantira_employee_section_order_updated', handleSectionOrderUpdate);
    window.addEventListener('quantira_field_configs_updated', handleFieldConfigsUpdate);
    window.addEventListener('quantira_custom_fields_updated', handleCustomFieldsUpdate);

    return () => {
      window.removeEventListener('quantira_employee_field_order_updated', handleFieldOrderUpdate);
      window.removeEventListener('quantira_employee_section_order_updated', handleSectionOrderUpdate);
      window.removeEventListener('quantira_field_configs_updated', handleFieldConfigsUpdate);
      window.removeEventListener('quantira_custom_fields_updated', handleCustomFieldsUpdate);
    };
  }, []);

  useEffect(() => {
    if (candidate) {
      const combined = candidate.name || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
      setFullName(combined);
      setTitle(candidate.title || 'Mr.');
      setFirstName(candidate.firstName || '');
      setMiddleName(candidate.middleName || '');
      setLastName(candidate.lastName || '');
      setPreferredName(candidate.preferredName || '');
      setDateOfBirth(candidate.dateOfBirth || '');
      setGender(candidate.gender || '');
      setMaritalStatus(candidate.maritalStatus || 'Single');
      setNationality(candidate.nationality || 'United States');
      setBloodGroup(candidate.bloodGroup || 'O+');
      setHireSource(candidate.hireSource || 'Direct Application');
      setOfferReference(candidate.offerReference || '');
      setEmail(candidate.email || candidate.corporateEmail || '');
      setCorporateEmail(candidate.corporateEmail || candidate.email || '');
      setPersonalEmail(candidate.personalEmail || '');
      setPhone(candidate.phone || candidate.contactNumber1 || '');
      setContactNumber2(candidate.contactNumber2 || '');
      setAddress(candidate.address?.street || '');
      setCity(candidate.address?.city || '');
      setState(candidate.address?.state || '');
      setZipCode(candidate.address?.zipCode || '');
      setGithubUsername(candidate.githubUsername || '');
      setLinkedinUrl(candidate.linkedinUrl || '');
      setJobTitle(candidate.jobTitle || '');
      setDepartment(candidate.department || '');
      setEmploymentType(candidate.employmentType || 'Full-time');
      setWorkModel(candidate.workModel || 'Hybrid');
      setStartDate(candidate.startDate || '');
      setOfficeLocation(candidate.officeLocation || '');
      setLine1Manager(candidate.line1Manager || candidate.manager || '');
      setLine2Manager(candidate.line2Manager || '');
      setCustomFieldsValues(candidate.customFields || {});
    }
  }, [candidate, isOpen]);

  // Group and sort form sections and fields according to Super Admin customization & drag order
  const configuredFormSections = useMemo(() => {
    const fieldItems: any[] = [];

    // 1. Standard Fields configured in Customizer
    standardFields.forEach((sf) => {
      if (sf.enabled === false) return;
      if (sf.category === 'Onboarding') return;

      let section = 'Personal Info';
      if (['firstName', 'middleName', 'lastName', 'name', 'title', 'preferredName', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality', 'bloodGroup', 'education'].includes(sf.key)) {
        section = 'Personal Info';
      } else if (['personalEmail', 'phone', 'contactNumber1', 'contactNumber2', 'address', 'city', 'state', 'zipCode', 'emergencyContact'].includes(sf.key)) {
        section = 'Contact & Address';
      } else if (['corporateEmail', 'employeeId', 'designation', 'jobTitle', 'department', 'startDate', 'employmentType', 'workModel', 'workLocation', 'hireSource', 'offerReference'].includes(sf.key)) {
        section = 'Role & Timeline';
      } else if (['line1Manager', 'line2Manager', 'manager'].includes(sf.key)) {
        section = 'Reporting Management';
      }

      fieldItems.push({
        id: `std-${sf.key}`,
        key: sf.key,
        label: sf.label,
        section,
        required: sf.required,
        isCustom: false
      });
    });

    // 2. Custom Organization Profile Fields
    customFields.forEach((cf) => {
      if (cf.showInProfile === false && cf.showInAddEmployee === false) return;
      const cleanSec = cf.step ? cf.step.replace(/^Step\s*\d+\s*:\s*/i, '').trim() : 'Custom Organization Profile Fields';
      fieldItems.push({
        ...cf,
        id: cf.id,
        key: cf.key,
        label: cf.label,
        section: cleanSec || 'Custom Organization Profile Fields',
        required: cf.required,
        isCustom: true
      });
    });

    // 3. Sort fields by configured employeeFieldOrder
    if (empFieldOrder.length > 0) {
      const orderMap = new Map(empFieldOrder.map((k, idx) => [k, idx]));
      fieldItems.sort((a, b) => {
        const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : orderMap.has(a.key) ? orderMap.get(a.key)! : 9999;
        const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : orderMap.has(b.key) ? orderMap.get(b.key)! : 9999;
        return idxA - idxB;
      });
    }

    // 4. Group fields into Sections
    const sectionMap = new Map<string, any[]>();
    fieldItems.forEach((f) => {
      const sec = f.section;
      if (!sectionMap.has(sec)) {
        sectionMap.set(sec, []);
      }
      sectionMap.get(sec)!.push(f);
    });

    // 5. Sort sections by configured empSectionOrder
    const sortedSectionNames = Array.from(sectionMap.keys());
    if (empSectionOrder.length > 0) {
      const orderMap = new Map(empSectionOrder.map((name, idx) => [name, idx]));
      sortedSectionNames.sort((a, b) => {
        const idxA = orderMap.has(a) ? orderMap.get(a)! : 999;
        const idxB = orderMap.has(b) ? orderMap.get(b)! : 999;
        return idxA - idxB;
      });
    }

    return sortedSectionNames.map((secName) => ({
      name: secName,
      fields: sectionMap.get(secName)!
    }));
  }, [standardFields, customFields, empFieldOrder, empSectionOrder]);

  const getSectionMeta = (sectionName: string) => {
    switch (sectionName) {
      case 'Personal Info':
        return {
          icon: <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          title: 'Basic Employee Identity'
        };
      case 'Contact & Address':
        return {
          icon: <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          title: 'Contact Information & Residence'
        };
      case 'Role & Timeline':
        return {
          icon: <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          title: 'Role, Division & Timeline'
        };
      case 'Reporting Management':
        return {
          icon: <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          title: 'Reporting Structure & Terms'
        };
      case 'Custom Organization Profile Fields':
      default:
        return {
          icon: <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          title: sectionName
        };
    }
  };

  if (!candidate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmSave(true);
  };

  const executeSaveEmployee = () => {
    const combinedName = fullName.trim() || `${firstName.trim()} ${lastName.trim()}`.trim();
    updateCandidate(candidate.id, {
      name: combinedName,
      title,
      firstName: firstName.trim() || combinedName,
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      preferredName: preferredName.trim(),
      dateOfBirth,
      gender,
      maritalStatus,
      nationality,
      bloodGroup,
      hireSource,
      offerReference,
      email: corporateEmail.trim() || email.trim(),
      corporateEmail: corporateEmail.trim() || email.trim(),
      personalEmail: personalEmail.trim(),
      phone: phone.trim(),
      contactNumber1: phone.trim(),
      contactNumber2: contactNumber2.trim(),
      address: {
        street: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: nationality || 'United States'
      },
      githubUsername: githubUsername.trim(),
      linkedinUrl: linkedinUrl.trim(),
      jobTitle,
      department,
      employmentType,
      workModel,
      startDate,
      officeLocation,
      manager: line1Manager,
      line1Manager,
      line2Manager,
      customFields: customFieldsValues
    });

    // Also update any saved flow data in localStorage if matching
    try {
      const flowKey = `onboarding_flow_${candidate.id}`;
      const savedFlow = localStorage.getItem(flowKey);
      if (savedFlow) {
        const parsed = JSON.parse(savedFlow);
        if (parsed.personalInfo) {
          parsed.personalInfo.name = combinedName;
          parsed.personalInfo.title = title;
          parsed.personalInfo.firstName = firstName.trim() || combinedName;
          parsed.personalInfo.middleName = middleName.trim();
          parsed.personalInfo.lastName = lastName.trim();
          parsed.personalInfo.preferredName = preferredName.trim();
          parsed.personalInfo.dateOfBirth = dateOfBirth;
          parsed.personalInfo.gender = gender;
          parsed.personalInfo.maritalStatus = maritalStatus;
          parsed.personalInfo.nationality = nationality;
          parsed.personalInfo.bloodGroup = bloodGroup;
          parsed.personalInfo.hireSource = hireSource;
          parsed.personalInfo.offerReference = offerReference;
          parsed.personalInfo.corporateEmail = corporateEmail.trim() || email.trim();
          parsed.personalInfo.email = corporateEmail.trim() || email.trim();
          parsed.personalInfo.personalEmail = personalEmail.trim();
          parsed.personalInfo.phone = phone.trim();
          parsed.personalInfo.contactNumber1 = phone.trim();
          parsed.personalInfo.contactNumber2 = contactNumber2.trim();
          parsed.personalInfo.address = address.trim();
          parsed.personalInfo.city = city.trim();
          parsed.personalInfo.state = state.trim();
          parsed.personalInfo.zipCode = zipCode.trim();
          parsed.personalInfo.githubUsername = githubUsername.trim();
          parsed.personalInfo.linkedinUrl = linkedinUrl.trim();
          parsed.personalInfo.jobTitle = jobTitle;
          parsed.personalInfo.department = department;
          parsed.personalInfo.line1Manager = line1Manager;
          parsed.personalInfo.line2Manager = line2Manager;
          parsed.customFields = customFieldsValues;
          localStorage.setItem(flowKey, JSON.stringify(parsed));
        }
      }
    } catch {}

    success('Employee Updated', `Updated details for ${combinedName || candidate.id}`);
    setShowConfirmation(true);
  };

  const handleCloseAll = () => {
    setShowConfirmation(false);
    onClose();
  };

  const renderFieldInput = (field: any) => {
    const isRequired = field.required ?? false;
    const key = field.key;

    if (field.isCustom) {
      if (key === 'githubUsername') {
        return (
          <TextInput
            key={field.id || key}
            label={field.label || 'GitHub Username'}
            placeholder={field.placeholder || 'e.g. octocat'}
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required={isRequired}
          />
        );
      }
      if (key === 'linkedInUrl' || key === 'linkedinUrl') {
        return (
          <TextInput
            key={field.id || key}
            label={field.label || 'LinkedIn Profile URL'}
            placeholder={field.placeholder || 'e.g. https://linkedin.com/in/username'}
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            required={isRequired}
          />
        );
      }
      return (
        <div key={field.id || key}>
          <DynamicCustomFieldInput
            field={field}
            value={customFieldsValues[field.key] || ''}
            onChange={(val) =>
              setCustomFieldsValues((prev) => ({
                ...prev,
                [field.key]: val
              }))
            }
          />
        </div>
      );
    }

    // Standard core fields
    switch (key) {
      case 'title':
        return (
          <Select
            key={key}
            label={field.label || 'Title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            options={[
              { label: 'Mr.', value: 'Mr.' },
              { label: 'Ms.', value: 'Ms.' },
              { label: 'Mrs.', value: 'Mrs.' },
              { label: 'Dr.', value: 'Dr.' },
              { label: 'Prof.', value: 'Prof.' }
            ]}
            required={isRequired}
          />
        );

      case 'name':
        return (
          <React.Fragment key={key}>
            <TextInput
              label="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFullName(`${e.target.value} ${lastName}`.trim());
              }}
              required={isRequired}
            />
            <TextInput
              label="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="Middle name"
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setFullName(`${firstName} ${e.target.value}`.trim());
              }}
              required={isRequired}
            />
          </React.Fragment>
        );

      case 'firstName':
        return (
          <TextInput
            key={key}
            label={field.label || 'First Name'}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setFullName(`${e.target.value} ${lastName}`.trim());
            }}
            required={isRequired}
          />
        );

      case 'middleName':
        return (
          <TextInput
            key={key}
            label={field.label || 'Middle Name'}
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Middle name"
          />
        );

      case 'lastName':
        return (
          <TextInput
            key={key}
            label={field.label || 'Last Name'}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setFullName(`${firstName} ${e.target.value}`.trim());
            }}
            required={isRequired}
          />
        );

      case 'preferredName':
        return (
          <TextInput
            key={key}
            label={field.label || 'Preferred Name'}
            placeholder="e.g. Alex"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            required={isRequired}
          />
        );

      case 'dateOfBirth':
        return (
          <DatePicker
            key={key}
            label={field.label || 'Date of Birth'}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required={isRequired}
          />
        );

      case 'gender':
        return (
          <Select
            key={key}
            label={field.label || 'Gender'}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { label: 'Select Gender...', value: '' },
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Non-Binary', value: 'Non-Binary' },
              { label: 'Other', value: 'Other' },
              { label: 'Prefer not to say', value: 'Prefer not to say' }
            ]}
            required={isRequired}
          />
        );

      case 'maritalStatus':
        return (
          <Select
            key={key}
            label={field.label || 'Marital Status'}
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            options={[
              { label: 'Single', value: 'Single' },
              { label: 'Married', value: 'Married' },
              { label: 'Divorced', value: 'Divorced' },
              { label: 'Widowed', value: 'Widowed' },
              { label: 'Separated', value: 'Separated' }
            ]}
            required={isRequired}
          />
        );

      case 'nationality':
        return (
          <TextInput
            key={key}
            label={field.label || 'Nationality'}
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            required={isRequired}
          />
        );

      case 'bloodGroup':
        return (
          <Select
            key={key}
            label={field.label || 'Blood Group'}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            options={[
              { label: 'A+', value: 'A+' },
              { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' },
              { label: 'B-', value: 'B-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'AB-', value: 'AB-' },
              { label: 'O+', value: 'O+' },
              { label: 'O-', value: 'O-' },
              { label: 'Unknown', value: 'Unknown' }
            ]}
            required={isRequired}
          />
        );

      case 'corporateEmail':
      case 'email':
        return (
          <TextInput
            key={key}
            label={field.label || 'Corporate Email'}
            type="email"
            value={corporateEmail || email}
            onChange={(e) => {
              setCorporateEmail(e.target.value);
              setEmail(e.target.value);
            }}
            required={isRequired}
          />
        );

      case 'personalEmail':
        return (
          <TextInput
            key={key}
            label={field.label || 'Personal Email'}
            type="email"
            placeholder="personal@email.com"
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
            required={isRequired}
          />
        );

      case 'phone':
      case 'contactNumber1':
        return (
          <TextInput
            key={key}
            label={field.label || 'Contact Number 1'}
            placeholder="+1 (555) 0100"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required={isRequired}
          />
        );

      case 'contactNumber2':
        return (
          <TextInput
            key={key}
            label={field.label || 'Contact Number 2'}
            placeholder="+1 (555) 0101 (Optional)"
            value={contactNumber2}
            onChange={(e) => setContactNumber2(e.target.value)}
            required={isRequired}
          />
        );

      case 'address':
        return (
          <TextInput
            key={key}
            label={field.label || 'Street Address'}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Main St"
            required={isRequired}
          />
        );

      case 'city':
        return (
          <TextInput
            key={key}
            label={field.label || 'City'}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. San Francisco"
            required={isRequired}
          />
        );

      case 'state':
        return (
          <TextInput
            key={key}
            label={field.label || 'State'}
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. CA"
            required={isRequired}
          />
        );

      case 'zipCode':
        return (
          <TextInput
            key={key}
            label={field.label || 'Zip Code'}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 94105"
            required={isRequired}
          />
        );

      case 'designation':
      case 'jobTitle':
        return (
          <TextInput
            key={key}
            label={field.label || 'Designation / Job Title'}
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required={isRequired}
          />
        );

      case 'department':
        return (
          <Select
            key={key}
            label={field.label || 'Department'}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { label: 'Select Department...', value: '' },
              ...DEPARTMENTS.map((d) => ({ label: d, value: d }))
            ]}
            required={isRequired}
          />
        );

      case 'workLocation':
      case 'officeLocation':
        return (
          <Select
            key={key}
            label={field.label || 'Primary Office Location'}
            value={officeLocation}
            onChange={(e) => setOfficeLocation(e.target.value)}
            options={[
              { label: 'Select Office Location...', value: '' },
              ...LOCATIONS.map((l) => ({ label: l, value: l }))
            ]}
            required={isRequired}
          />
        );

      case 'employmentType':
        return (
          <Select
            key={key}
            label={field.label || 'Employment Type'}
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            options={[
              { label: 'Full-time', value: 'Full-time' },
              { label: 'Part-time', value: 'Part-time' },
              { label: 'Contractor', value: 'Contractor' },
              { label: 'Intern', value: 'Intern' }
            ]}
            required={isRequired}
          />
        );

      case 'workModel':
        return (
          <Select
            key={key}
            label={field.label || 'Work Model'}
            value={workModel}
            onChange={(e) => setWorkModel(e.target.value as WorkModel)}
            options={[
              { label: 'Remote', value: 'Remote' },
              { label: 'Hybrid', value: 'Hybrid' },
              { label: 'On-site', value: 'On-site' }
            ]}
            required={isRequired}
          />
        );

      case 'startDate':
        return (
          <DatePicker
            key={key}
            label={field.label || 'Official Start Date'}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required={isRequired}
          />
        );

      case 'hireSource':
        return (
          <Select
            key={key}
            label={field.label || 'Hiring Source'}
            value={hireSource}
            onChange={(e) => setHireSource(e.target.value)}
            options={[
              { label: 'Direct Application', value: 'Direct Application' },
              { label: 'LinkedIn Recruitment', value: 'LinkedIn Recruitment' },
              { label: 'Internal Referral', value: 'Internal Referral' },
              { label: 'Campus Placement', value: 'Campus Placement' },
              { label: 'Agency / Headhunter', value: 'Agency / Headhunter' }
            ]}
            required={isRequired}
          />
        );

      case 'offerReference':
        return (
          <TextInput
            key={key}
            label={field.label || 'Offer Reference'}
            value={offerReference}
            onChange={(e) => setOfferReference(e.target.value)}
            required={isRequired}
          />
        );

      case 'line1Manager':
      case 'manager':
        return (
          <TextInput
            key={key}
            label={field.label || 'Reporting Manager'}
            value={line1Manager}
            onChange={(e) => setLine1Manager(e.target.value)}
            placeholder="e.g. Supervisor Name"
            required={isRequired}
          />
        );

      case 'line2Manager':
        return (
          <TextInput
            key={key}
            label={field.label || 'Secondary / Executive Manager'}
            value={line2Manager}
            onChange={(e) => setLine2Manager(e.target.value)}
            placeholder="e.g. Executive Leadership"
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showConfirmation}
        onClose={onClose}
        title="Edit Employee Information"
        description={`Update records, reporting managers, and custom fields for ${candidate.name || `${candidate.firstName} ${candidate.lastName}`} (${candidate.id}).`}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} leftIcon={<UserCheck className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-left max-h-[75vh] overflow-y-auto pr-1">
          {configuredFormSections.map((section) => {
            const meta = getSectionMeta(section.name);
            return (
              <div
                key={section.name}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center gap-2">
                  {meta.icon}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block uppercase tracking-wider">
                    {meta.title}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {section.fields.map((f: any) => renderFieldInput(f))}
                </div>
              </div>
            );
          })}
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={handleCloseAll}
        title="Employee Updated Successfully"
        description="The employee profile records have been saved."
        size="md"
        footer={
          <div className="flex justify-end w-full">
            <Button variant="primary" onClick={handleCloseAll} className="bg-emerald-600 hover:bg-emerald-700">
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Record Saved
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                All changes for <strong>{firstName} {lastName}</strong> ({candidate.id}) have been synchronized.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Updated fields include line managers ({line1Manager}, {line2Manager}), job title ({jobTitle}), and workplace metadata.
          </p>
        </div>
      </Modal>

      {/* Pre-save Confirmation Dialog */}
      {showConfirmSave && (
        <ConfirmDialog
          isOpen={showConfirmSave}
          onClose={() => setShowConfirmSave(false)}
          onConfirm={() => {
            setShowConfirmSave(false);
            executeSaveEmployee();
          }}
          title="Confirm Profile Updates"
          message={`Are you sure you want to save the updated employee profile for ${candidate.firstName} ${candidate.lastName} (${candidate.id})?`}
          confirmLabel="Save Profile"
          variant="info"
        />
      )}
    </>
  );
};
