import React, { useState, useEffect } from 'react';
import {
  OrganizationProfile,
  getOrganizationProfile,
  saveOrganizationProfile,
  DEFAULT_ORG_PROFILE
} from '../../services/organizationSetupService';
import { Button } from '../atoms';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Save,
  RotateCcw,
  Globe,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

export const OrganizationView: React.FC = () => {
  const { success, info } = useToast();
  const [profile, setProfile] = useState<OrganizationProfile>(() => getOrganizationProfile());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getOrganizationProfile());
    };
    window.addEventListener('quantira_org_profile_updated', handleUpdate);
    return () => window.removeEventListener('quantira_org_profile_updated', handleUpdate);
  }, []);

  const handleChange = (field: keyof OrganizationProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      saveOrganizationProfile(profile);
      setIsSaving(false);
      success('Organization Profile Saved', 'Corporate entity configuration updated successfully.');
    }, 200);
  };

  const handleReset = () => {
    setProfile(DEFAULT_ORG_PROFILE);
    saveOrganizationProfile(DEFAULT_ORG_PROFILE);
    info('Defaults Restored', 'Organization profile restored to standard enterprise defaults.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left animate-fade-in">
      {/* Action Header & Branding Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-600/30 border border-white/20 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {profile.name || 'Organization Profile'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {profile.licenseStatus}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {profile.legalName} • {profile.taxId} • {profile.industry}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs font-bold"
            >
              Reset Defaults
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-md shadow-blue-600/25 cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: 3 Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Legal & Statutory Identity (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Legal Entity & Statutory Data */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                1. Legal Entity &amp; Statutory Registration
              </span>
              <span className="text-[11px] font-mono text-slate-400">ID: {profile.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Company Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Full Legal Registered Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Organization Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tax ID / EIN / GSTIN / VAT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Corporate Registration Number
                </label>
                <input
                  type="text"
                  value={profile.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Industry Classification
                </label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Corporate Address */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                2. Corporate Headquarters &amp; Communication
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-blue-500" />
                  Official Email
                </label>
                <input
                  type="email"
                  value={profile.corporateEmail}
                  onChange={(e) => handleChange('corporateEmail', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-indigo-500" />
                  Website URL
                </label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Street Address Line 1
                </label>
                <input
                  type="text"
                  value={profile.addressLine1}
                  onChange={(e) => handleChange('addressLine1', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  City
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  State / Province
                </label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Country
                </label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  value={profile.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className="w-full font-mono px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Currency, Timezone & License Tier (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 3: Financial & Localization Parameters */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              3. Currency &amp; Localization
            </span>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Base Accounting Currency
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="SGD ($)">SGD ($) - Singapore Dollar</option>
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
                  <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                  <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Corporate Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="America/Los_Angeles (PST/PDT)">America/Los_Angeles (PST/PDT)</option>
                  <option value="America/New_York (EST/EDT)">America/New_York (EST/EDT)</option>
                  <option value="America/Chicago (CST/CDT)">America/Chicago (CST/CDT)</option>
                  <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
                  <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
                  <option value="Australia/Sydney (AEST)">Australia/Sydney (AEST)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Fiscal Year Starting Month
                </label>
                <select
                  value={profile.fiscalYearStart}
                  onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="January">January (Calendar Year: Jan - Dec)</option>
                  <option value="April">April (Financial Year: Apr - Mar)</option>
                  <option value="July">July (Mid-Year: Jul - Jun)</option>
                  <option value="October">October (Quarter 4: Oct - Sep)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Default Date Format
                </label>
                <select
                  value={profile.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer font-mono"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (UK / EU Standard)</option>
                  <option value="DD-MMM-YYYY">DD-MMM-YYYY (e.g. 25-Sep-2026)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 4: Commercial ERP License & Multi-Tenant Specs */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Award className="w-4 h-4 text-amber-500" />
              4. Commercial ERP License Specs
            </span>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile.subscriptionTier}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  Multi-Tenant
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>User Capacity:</span>
                  <strong className="font-mono">{profile.maxAllowedUsers} Active Accounts</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Multi-Branch Capability:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">Unlimited Multi-Site</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>White-Label Tenant Key:</span>
                  <strong className="font-mono text-[11px]">TENANT-QT-2026-X89</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
