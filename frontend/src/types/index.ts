// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  pharmacy_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type UserRole = 'admin' | 'pharmacist' | 'technician' | 'doctor' | 'patient';

// Pharmacy types
export interface Pharmacy {
  id: string;
  name: string;
  license_number: string;
  address: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

// Medication types
export interface Medication {
  id: string;
  ndc_code: string;
  brand_name: string;
  generic_name: string;
  dosage_form?: string;
  strength?: string;
  manufacturer?: string;
  description?: string;
  is_controlled_substance: boolean;
  schedule_level?: number;
  created_at: string;
}

// Prescription types
export interface Prescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  prescriber_name: string;
  pharmacy_id: string;
  drug_name: string;
  dosage: string;
  quantity: number;
  priority: 'high' | 'medium' | 'low';
  date_prescribed: string;
  date_filled?: string;
  status: PrescriptionStatus;
  notes?: string;
  qr_code_hash?: string;
  created_at: string;
}

export type PrescriptionStatus = 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'expired';

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medication_id: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity: number;
  instructions?: string;
  refills_remaining: number;
}

// Inventory types
export interface Inventory {
  id: string;
  pharmacy_id: string;
  medication_id: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_cost?: number;
  selling_price?: number;
  expiry_date?: string;
  batch_number?: string;
  supplier?: string;
  last_updated: string;
}

// Inventory with medication details
export interface InventoryWithMedication extends Inventory {
  medication_name: string;
  manufacturer?: string;
  ndc?: string;
  category?: string;
  max_stock?: number;
  unit_price?: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Form types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  pharmacy_id?: string;
}

// Extended prescription with items
export interface PrescriptionWithItems extends Prescription {
  items: PrescriptionItem[];
}
