import React, { useState, useEffect } from 'react';
import { Modal } from '../organisms';
import { ConfirmDialog } from '../organisms';
import { Button } from '../atoms';
import { TextInput } from '../atoms';
import { Select } from '../atoms';
import { Candidate } from '../../types/candidate';
import { useOnboarding } from '../../context/OnboardingContext';
import { useToast } from '../../context/ToastContext';
import { getAssets } from '../../services/assetService';
import { Laptop, Users, Check } from 'lucide-react';

export interface AssignAssetsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

export const AssignAssetsManagerModal: React.FC<AssignAssetsManagerModalProps> = ({
  isOpen,
  onClose,
  candidate
}) => {
  const { updateCandidate } = useOnboarding();
  const { success } = useToast();

  const [showConfirmAssign, setShowConfirmAssign] = useState(false);
  const [laptopModel, setLaptopModel] = useState('');
  const [monitors, setMonitors] = useState('0');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [assetTag, setAssetTag] = useState('');
  const [provisioningStatus, setProvisioningStatus] = useState<'pending' | 'ordered' | 'configured' | 'shipped' | 'delivered'>('configured');
  const [manager, setManager] = useState('');
  const [buddy, setBuddy] = useState('');

  const workstationOptions = React.useMemo(() => {
    const assets = getAssets().filter((a) => a.category === 'Laptop' || a.category === 'Desktop');
    const opts: { label: string; value: string }[] = [
      { label: 'Select Laptop / Workstation Model...', value: '' }
    ];
    assets.forEach((a) => {
      opts.push({
        label: `[${a.assetTag}] ${a.name} — ${a.status === 'Available' ? 'Available' : a.status}`,
        value: a.name
      });
    });
    const standard = [
      'Apple MacBook Pro 16" (M3 Max, 36GB)',
      'Apple MacBook Pro 14" (M3 Pro, 18GB)',
      'Lenovo ThinkPad P1 Gen 6 (Intel i9, 64GB)',
      'Dell Precision 5680 Workstation'
    ];
    standard.forEach((s) => {
      if (!opts.some((o) => o.value === s)) {
        opts.push({ label: s, value: s });
      }
    });
    return opts;
  }, []);

  useEffect(() => {
    if (candidate) {
      setLaptopModel(candidate.equipment?.laptopModel || '');
      setMonitors(candidate.equipment?.monitors !== undefined ? String(candidate.equipment.monitors) : '0');
      setSelectedAccessories(candidate.equipment?.accessories || []);
      setAssetTag(candidate.equipment?.trackingNumber || '');
      setProvisioningStatus(candidate.equipment?.provisioningStatus || 'configured');
      setManager(candidate.line1Manager || candidate.manager || '');
      setBuddy('');
    }
  }, [candidate]);

  if (!candidate) return null;

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmAssign(true);
  };

  const executeConfirmAssign = () => {
    updateCandidate(candidate.id, {
      manager,
      equipment: {
        laptopModel,
        monitors: parseInt(monitors, 10) || 1,
        accessories: selectedAccessories,
        softwareLicenses: candidate.equipment?.softwareLicenses || ['Okta SSO', 'Slack', 'GitHub Enterprise'],
        emailAlias: candidate.email,
        provisioningStatus,
        trackingNumber: assetTag,
        notes: `Assigned manager: ${manager}, Buddy: ${buddy}`
      }
    });
    success('Equipment & Manager Assigned', `Assets and manager updated for ${candidate.firstName} ${candidate.lastName}`);
    onClose();
  };

  const accessoryOptions = [
    'Ergonomic Keyboard',
    'Logitech MX Master 3S',
    '4K UltraFine Monitor (27")',
    'CalDigit Thunderbolt 4 Dock',
    'Noise-Canceling Headset',
    'Laptop Riser Stand'
  ];

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign IT Assets & Manager"
      description={`Allocate hardware assets, configure IT image, and assign leadership for ${candidate.firstName} ${candidate.lastName}.`}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} leftIcon={<Check className="w-4 h-4" />}>
            Confirm Assignment
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-5 text-left">
        {/* Leadership Assignment */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Leadership & Mentorship Assignment
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              options={[
                { label: 'Select Manager...', value: '' },
                { label: 'Marcus Brody (VP Engineering)', value: 'Marcus Brody' },
                { label: 'Eleanor Vance (Head of People)', value: 'Eleanor Vance' },
                { label: 'Alexandra Wright (Principal Admin)', value: 'Alexandra Wright' },
                { label: 'David Kim (Director of Security)', value: 'David Kim' }
              ]}
            />
            <Select
              label="First-Week Team Buddy"
              value={buddy}
              onChange={(e) => setBuddy(e.target.value)}
              options={[
                { label: 'Select Team Buddy (Optional)...', value: '' },
                { label: 'Sarah Jenkins (Staff Engineer)', value: 'Sarah Jenkins' },
                { label: 'Liam Chen (Senior Lead)', value: 'Liam Chen' },
                { label: 'Priya Patel (Product Specialist)', value: 'Priya Patel' },
                { label: 'Michael Chang (DevOps Lead)', value: 'Michael Chang' }
              ]}
            />
          </div>
        </div>

        {/* Hardware & IT Assets */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              IT Asset Allocation & Hardware
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Workstation"
              value={laptopModel}
              onChange={(e) => setLaptopModel(e.target.value)}
              options={workstationOptions}
            />
            <Select
              label="External Displays"
              value={monitors}
              onChange={(e) => setMonitors(e.target.value)}
              options={[
                { label: 'None (Laptop Only)', value: '0' },
                { label: '1x 27" 4K Display', value: '1' },
                { label: '2x 27" 4K Displays', value: '2' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="IT Asset Tag / Tracking #"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              placeholder="e.g. IT-MBP-9042"
            />
            <Select
              label="Hardware Status"
              value={provisioningStatus}
              onChange={(e) => setProvisioningStatus(e.target.value as any)}
              options={[
                { label: 'Configured & Ready', value: 'configured' },
                { label: 'Ordered', value: 'ordered' },
                { label: 'Shipped to Employee', value: 'shipped' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Pending Request', value: 'pending' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-2">
              Select Accessories & Peripherals
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {accessoryOptions.map((acc) => {
                const isSelected = selectedAccessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{acc}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </Modal>

    {/* Assignment Confirmation Dialog */}
    {showConfirmAssign && (
      <ConfirmDialog
        isOpen={showConfirmAssign}
        onClose={() => setShowConfirmAssign(false)}
        onConfirm={() => {
          setShowConfirmAssign(false);
          executeConfirmAssign();
        }}
        title="Confirm Equipment & Manager Assignment"
        message={`Are you sure you want to assign manager ${manager} and hardware (${laptopModel}) to ${candidate.firstName} ${candidate.lastName}?`}
        confirmLabel="Confirm Assignment"
        variant="info"
      />
    )}
    </>
  );
};
