export type AssetCategory =
  | 'Laptop'
  | 'Desktop'
  | 'Monitor'
  | 'Mobile Device'
  | 'Peripheral'
  | 'Audio/Video'
  | 'Accessories';

export type AssetStatus = 'Available' | 'Assigned' | 'Maintenance' | 'Retired';

export type AssetCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged';

export interface AssetAssignee {
  id: string;
  name: string;
  email: string;
  department: string;
  avatarUrl?: string;
  assignedDate: string;
}

export interface ITAsset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  assignedTo: AssetAssignee | null;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
  specifications?: Record<string, string>;
  notes?: string;
  imageUrl?: string;
  updatedAt?: string;
}
