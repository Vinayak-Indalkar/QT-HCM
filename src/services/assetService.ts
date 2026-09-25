import { ITAsset } from '../types/asset';
export type { ITAsset } from '../types/asset';
import { RADIAN_PERSONA_AVATARS, getRadianAvatarByName } from '../utils/radianAvatars';

export const INITIAL_ENTERPRISE_ASSETS: ITAsset[] = [
  {
    id: 'AST-1001',
    assetTag: 'QTR-LAP-0101',
    name: 'Apple MacBook Pro 16" (M3 Max, 36GB, 1TB SSD)',
    category: 'Laptop',
    serialNumber: 'C02G8492MD6R',
    status: 'Assigned',
    condition: 'Excellent',
    assignedTo: {
      id: 'emp-1',
      name: 'John Doe',
      email: 'john.doe@quantira.com',
      department: 'Engineering',
      avatarUrl: RADIAN_PERSONA_AVATARS.johnDoe,
      assignedDate: '2026-09-15'
    },
    location: 'San Francisco HQ',
    purchaseDate: '2026-08-10',
    purchaseCost: 3499,
    warrantyExpiry: '2029-08-10',
    specifications: {
      'Processor': 'Apple M3 Max (16-core CPU, 40-core GPU)',
      'Memory': '36GB Unified Memory',
      'Storage': '1TB NVMe Apple SSD',
      'Display': '16.2" Liquid Retina XDR (3456x2234, 120Hz ProMotion)',
      'OS': 'macOS Sequoia 15.1'
    },
    notes: 'Primary engineering workstation assigned during onboarding flow.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'
  },
  {
    id: 'AST-1002',
    assetTag: 'QTR-MON-0204',
    name: 'Dell UltraSharp 32" 4K USB-C Hub Monitor (U3223QE)',
    category: 'Monitor',
    serialNumber: 'CN-0K7G4-74445',
    status: 'Assigned',
    condition: 'Excellent',
    assignedTo: {
      id: 'emp-1',
      name: 'John Doe',
      email: 'john.doe@quantira.com',
      department: 'Engineering',
      avatarUrl: RADIAN_PERSONA_AVATARS.johnDoe,
      assignedDate: '2026-09-15'
    },
    location: 'San Francisco HQ',
    purchaseDate: '2026-08-15',
    purchaseCost: 899,
    warrantyExpiry: '2029-08-15',
    specifications: {
      'Screen Size': '31.5 Inch IPS Black',
      'Resolution': '3840 x 2160 (4K UHD, 60Hz)',
      'Connectivity': 'USB-C (90W Power Delivery), HDMI 2.1, DisplayPort 1.4',
      'Color Gamut': '100% sRGB, 98% DCI-P3'
    },
    notes: 'Assigned for desk pod #402 setup.',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300'
  },
  {
    id: 'AST-1003',
    assetTag: 'QTR-LAP-0102',
    name: 'Apple MacBook Pro 14" (M3 Pro, 18GB, 512GB SSD)',
    category: 'Laptop',
    serialNumber: 'C02H5921MD4K',
    status: 'Assigned',
    condition: 'Excellent',
    assignedTo: {
      id: 'cand-1',
      name: 'Sarah Jenkins',
      email: 'sarah.j@quantira.com',
      department: 'Product',
      avatarUrl: RADIAN_PERSONA_AVATARS.sarahJenkins,
      assignedDate: '2026-09-12'
    },
    location: 'Remote - USA',
    purchaseDate: '2026-08-01',
    purchaseCost: 2199,
    warrantyExpiry: '2029-08-01',
    specifications: {
      'Processor': 'Apple M3 Pro (11-core CPU, 14-core GPU)',
      'Memory': '18GB Unified Memory',
      'Storage': '512GB SSD',
      'Display': '14.2" Liquid Retina XDR'
    },
    notes: 'Configured and shipped via FedEx priority to remote employee.',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300'
  },
  {
    id: 'AST-1004',
    assetTag: 'QTR-LAP-0103',
    name: 'Lenovo ThinkPad X1 Carbon Gen 11 (Core i7, 32GB, 1TB)',
    category: 'Laptop',
    serialNumber: 'PF3N8B7A',
    status: 'Assigned',
    condition: 'Good',
    assignedTo: {
      id: 'cand-2',
      name: 'David Chen',
      email: 'david.c@quantira.com',
      department: 'Engineering',
      avatarUrl: getRadianAvatarByName('David Chen'),
      assignedDate: '2026-09-10'
    },
    location: 'San Francisco HQ',
    purchaseDate: '2026-06-20',
    purchaseCost: 2249,
    warrantyExpiry: '2029-06-20',
    specifications: {
      'Processor': 'Intel Core i7-1365U (10 Cores, up to 5.20 GHz)',
      'Memory': '32GB LPDDR5',
      'Storage': '1TB PCIe Gen4 Performance NVMe SSD',
      'Display': '14" WUXGA (1920 x 1200) IPS Anti-glare',
      'OS': 'Ubuntu Linux 24.04 LTS'
    },
    notes: 'Dual-boot enterprise Linux configuration for infrastructure engineering.',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300'
  },
  {
    id: 'AST-1005',
    assetTag: 'QTR-DIS-0301',
    name: 'Apple Studio Display 27" 5K (Nano-texture Glass, Tilt Stand)',
    category: 'Monitor',
    serialNumber: 'C02K9876P09L',
    status: 'Available',
    condition: 'New',
    assignedTo: null,
    location: 'San Francisco HQ (IT Stockroom A)',
    purchaseDate: '2026-09-01',
    purchaseCost: 1899,
    warrantyExpiry: '2029-09-01',
    specifications: {
      'Screen Size': '27 Inch 5K Retina (5120 x 2880)',
      'Brightness': '600 nits',
      'Camera': '12MP Ultra Wide camera with Center Stage',
      'Audio': 'Six-speaker sound system with Spatial Audio'
    },
    notes: 'Unopened unit in IT hardware staging area, ready for dispatch.',
    imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=300'
  },
  {
    id: 'AST-1006',
    assetTag: 'QTR-LAP-0105',
    name: 'Apple MacBook Air 15" (M3, 16GB, 512GB SSD)',
    category: 'Laptop',
    serialNumber: 'C02J8112M99X',
    status: 'Available',
    condition: 'New',
    assignedTo: null,
    location: 'San Francisco HQ (IT Stockroom B)',
    purchaseDate: '2026-09-05',
    purchaseCost: 1499,
    warrantyExpiry: '2029-09-05',
    specifications: {
      'Processor': 'Apple M3 chip (8-core CPU, 10-core GPU)',
      'Memory': '16GB Unified Memory',
      'Storage': '512GB SSD',
      'Weight': '3.3 lbs (1.51 kg)'
    },
    notes: 'General business unit laptop reserve pool.'
  },
  {
    id: 'AST-1007',
    assetTag: 'QTR-MOB-0401',
    name: 'Apple iPhone 15 Pro (256GB, Titanium Blue) - Enterprise eSIM',
    category: 'Mobile Device',
    serialNumber: 'DN6W4012PL5Q',
    status: 'Assigned',
    condition: 'Excellent',
    assignedTo: {
      id: 'mgr-1',
      name: 'Marcus Brody',
      email: 'manager@quantira.com',
      department: 'Engineering',
      avatarUrl: RADIAN_PERSONA_AVATARS.marcusBrody,
      assignedDate: '2026-04-12'
    },
    location: 'San Francisco HQ',
    purchaseDate: '2026-04-01',
    purchaseCost: 1099,
    warrantyExpiry: '2028-04-01',
    specifications: {
      'Storage': '256GB',
      'Carrier': 'Verizon Enterprise Unlimited 5G Ultra Wideband',
      'MDM Management': 'Jamf Pro Corporate Supervised'
    },
    notes: 'Executive on-call mobile communication device.'
  },
  {
    id: 'AST-1008',
    assetTag: 'QTR-PER-0501',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    category: 'Peripheral',
    serialNumber: 'KQ1P-99214',
    status: 'Assigned',
    condition: 'Excellent',
    assignedTo: {
      id: 'cand-1',
      name: 'Sarah Jenkins',
      email: 'sarah.j@quantira.com',
      department: 'Product',
      avatarUrl: RADIAN_PERSONA_AVATARS.sarahJenkins,
      assignedDate: '2026-09-12'
    },
    location: 'Remote - USA',
    purchaseDate: '2026-08-01',
    purchaseCost: 198,
    warrantyExpiry: '2027-08-01',
    specifications: {
      'Switches': 'Gateron Jupiter Brown (Tactile)',
      'Connectivity': 'Bluetooth 5.1 & Type-C Wired',
      'Body': 'CNC Machined Aluminum Body'
    },
    notes: 'Standard developer mechanical ergonomics bundle.'
  },
  {
    id: 'AST-1009',
    assetTag: 'QTR-AUD-0601',
    name: 'Jabra Evolve2 85 Wireless ANC Headset with Boom Mic',
    category: 'Audio/Video',
    serialNumber: 'JBR-85-40192',
    status: 'Maintenance',
    condition: 'Fair',
    assignedTo: null,
    location: 'Austin Technology Center',
    purchaseDate: '2025-11-15',
    purchaseCost: 499,
    warrantyExpiry: '2027-11-15',
    specifications: {
      'ANC': 'Digital Hybrid Active Noise Cancellation',
      'Battery Life': 'Up to 37 Hours',
      'Bluetooth Adapter': 'Jabra Link 380 USB-C'
    },
    notes: 'Sent to IT Service Desk for firmware diagnostic and ear cushion replacement.'
  },
  {
    id: 'AST-1010',
    assetTag: 'QTR-AUD-0602',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    category: 'Audio/Video',
    serialNumber: 'S80129482J',
    status: 'Available',
    condition: 'New',
    assignedTo: null,
    location: 'San Francisco HQ (IT Stockroom A)',
    purchaseDate: '2026-09-10',
    purchaseCost: 399,
    warrantyExpiry: '2028-09-10',
    specifications: {
      'Noise Canceling': 'Dual Processors & 8 Microphones',
      'Battery Life': '30 Hours with Quick Charging',
      'Color': 'Black'
    },
    notes: 'Reserved for upcoming engineering batch onboarding.'
  }
];

const ASSETS_STORAGE_KEY = 'quantira_enterprise_assets';

export const getAssets = (): ITAsset[] => {
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((a: ITAsset) => {
          const matched = INITIAL_ENTERPRISE_ASSETS.find((init) => init.id === a.id);
          return {
            ...a,
            imageUrl: a.imageUrl || matched?.imageUrl
          };
        });
      }
    }
  } catch (e) {
    console.error('Error loading assets from storage', e);
  }
  return INITIAL_ENTERPRISE_ASSETS;
};

export const saveAssets = (assets: ITAsset[]): void => {
  try {
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
    window.dispatchEvent(new CustomEvent('quantira_assets_updated'));
  } catch (e) {
    console.error('Error saving assets to storage', e);
  }
};

export const createAsset = (asset: Omit<ITAsset, 'id'>): ITAsset => {
  const current = getAssets();
  const newId = `AST-${1000 + current.length + 1}`;
  const newAsset: ITAsset = {
    ...asset,
    id: newId,
    updatedAt: new Date().toISOString()
  };
  const updated = [newAsset, ...current];
  saveAssets(updated);
  return newAsset;
};

export const updateAsset = (id: string, updates: Partial<ITAsset>): ITAsset | null => {
  const current = getAssets();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;
  const updatedAsset: ITAsset = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  current[index] = updatedAsset;
  saveAssets(current);
  return updatedAsset;
};

export const deleteAsset = (id: string): boolean => {
  const current = getAssets();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length === current.length) return false;
  saveAssets(filtered);
  return true;
};

/**
 * Retrieves all assets assigned to a specific employee from the Central IT Inventory (Assets Menu).
 */
export const getAssignedAssetsForEmployee = (
  employeeId: string,
  employeeName?: string,
  employeeEmail?: string
): ITAsset[] => {
  const allAssets = getAssets();
  return allAssets.filter((a) => {
    if (!a.assignedTo) return false;
    if (a.assignedTo.id && (a.assignedTo.id === employeeId || a.assignedTo.id.toLowerCase() === employeeId.toLowerCase())) {
      return true;
    }
    if (employeeEmail && a.assignedTo.email && a.assignedTo.email.toLowerCase() === employeeEmail.toLowerCase()) {
      return true;
    }
    if (employeeName && a.assignedTo.name && a.assignedTo.name.toLowerCase() === employeeName.toLowerCase()) {
      return true;
    }
    return false;
  });
};
