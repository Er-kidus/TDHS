import axios, { AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User, Pharmacy, Medication, Prescription, Inventory, InventoryWithMedication } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login, but not from register page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    // Store user data in localStorage for getProfile to use
    if (typeof window !== 'undefined' && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    // Store user data in localStorage for getProfile to use
    if (typeof window !== 'undefined' && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/refresh');
    if (typeof window !== 'undefined' && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get('/users/profile');
    if (typeof window !== 'undefined' && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await api.get('/users');
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response: AxiosResponse<User> = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response: AxiosResponse<User> = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Pharmacy API
export const pharmacyAPI = {
  getPharmacies: async (): Promise<Pharmacy[]> => {
    const response: AxiosResponse<Pharmacy[]> = await api.get('/pharmacies');
    return response.data;
  },

  getPharmacy: async (id: string): Promise<Pharmacy> => {
    const response: AxiosResponse<Pharmacy> = await api.get(`/pharmacies/${id}`);
    return response.data;
  },

  createPharmacy: async (data: Omit<Pharmacy, 'id' | 'created_at' | 'is_active'>): Promise<Pharmacy> => {
    const response: AxiosResponse<Pharmacy> = await api.post('/pharmacies', data);
    return response.data;
  },

  updatePharmacy: async (id: string, data: Partial<Pharmacy>): Promise<Pharmacy> => {
    const response: AxiosResponse<Pharmacy> = await api.put(`/pharmacies/${id}`, data);
    return response.data;
  },

  deletePharmacy: async (id: string): Promise<void> => {
    await api.delete(`/pharmacies/${id}`);
  },
};

// Helper functions for localStorage medications
const getStoredMedications = (): Medication[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('medications');
  if (!stored) {
    // Initialize with sample data if empty
    const sampleMedications = [
      {
        id: 'med1',
        ndc_code: '12345-678-90',
        brand_name: 'Amoxil',
        generic_name: 'Amoxicillin',
        dosage_form: 'Capsule',
        strength: '500mg',
        manufacturer: 'GSK',
        description: 'Antibiotic for bacterial infections',
        is_controlled_substance: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'med2',
        ndc_code: '23456-789-01',
        brand_name: 'Lipitor',
        generic_name: 'Atorvastatin',
        dosage_form: 'Tablet',
        strength: '20mg',
        manufacturer: 'Pfizer',
        description: 'Cholesterol-lowering medication',
        is_controlled_substance: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'med3',
        ndc_code: '34567-890-12',
        brand_name: 'Metformin',
        generic_name: 'Metformin Hydrochloride',
        dosage_form: 'Tablet',
        strength: '500mg',
        manufacturer: 'Merck',
        description: 'Diabetes medication',
        is_controlled_substance: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'med4',
        ndc_code: '45678-901-23',
        brand_name: 'Amlodipine',
        generic_name: 'Amlodipine Besylate',
        dosage_form: 'Tablet',
        strength: '5mg',
        manufacturer: 'Pfizer',
        description: 'Blood pressure medication',
        is_controlled_substance: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'med5',
        ndc_code: '56789-012-34',
        brand_name: 'Omeprazole',
        generic_name: 'Omeprazole',
        dosage_form: 'Capsule',
        strength: '20mg',
        manufacturer: 'AstraZeneca',
        description: 'Acid reflux medication',
        is_controlled_substance: false,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('medications', JSON.stringify(sampleMedications));
    return sampleMedications;
  }
  return JSON.parse(stored);
};

const setStoredMedications = (medications: Medication[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('medications', JSON.stringify(medications));
};

// Medication API
export const medicationAPI = {
  getMedications: async (search?: string): Promise<Medication[]> => {
    try {
      const medications = getStoredMedications();
      
      if (!search) {
        return medications;
      }
      
      const lowerSearch = search.toLowerCase();
      return medications.filter(med =>
        med.brand_name?.toLowerCase().includes(lowerSearch) ||
        med.generic_name?.toLowerCase().includes(lowerSearch) ||
        med.ndc_code?.toLowerCase().includes(lowerSearch)
      );
    } catch (error) {
      console.error('Failed to load medications from localStorage:', error);
      // Fallback to API if localStorage fails
      const params = search ? { search } : {};
      const response: AxiosResponse<Medication[]> = await api.get('/medications', { params });
      return response.data;
    }
  },

  getMedication: async (id: string): Promise<Medication> => {
    const medications = getStoredMedications();
    const medication = medications.find(m => m.id === id);
    if (medication) return medication;
    
    // Fallback to API
    const response: AxiosResponse<Medication> = await api.get(`/medications/${id}`);
    return response.data;
  },

  createMedication: async (data: Omit<Medication, 'id' | 'created_at'>): Promise<Medication> => {
    const medications = getStoredMedications();
    const newMedication = {
      ...data,
      id: `MED-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    medications.push(newMedication);
    setStoredMedications(medications);
    return newMedication;
  },

  updateMedication: async (id: string, data: Partial<Medication>): Promise<Medication> => {
    const medications = getStoredMedications();
    const index = medications.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Medication not found');
    
    medications[index] = { ...medications[index], ...data };
    setStoredMedications(medications);
    return medications[index];
  },

  deleteMedication: async (id: string): Promise<void> => {
    const medications = getStoredMedications();
    const filtered = medications.filter(m => m.id !== id);
    setStoredMedications(filtered);
  },
};

// Prescription API
export const prescriptionAPI = {
  getPrescriptions: async (): Promise<Prescription[]> => {
    const response: AxiosResponse<Prescription[]> = await api.get('/prescriptions');
    return response.data;
  },

  getPrescription: async (id: string): Promise<Prescription> => {
    const response: AxiosResponse<Prescription> = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  createPrescription: async (data: any): Promise<Prescription> => {
    const response: AxiosResponse<Prescription> = await api.post('/prescriptions', data);
    return response.data;
  },

  updatePrescription: async (id: string, data: Partial<Prescription>): Promise<Prescription> => {
    const response: AxiosResponse<Prescription> = await api.put(`/prescriptions/${id}`, data);
    return response.data;
  },

  deletePrescription: async (id: string): Promise<void> => {
    await api.delete(`/prescriptions/${id}`);
  },

  fillPrescription: async (id: string): Promise<void> => {
    await api.post(`/prescriptions/${id}/fill`);
  },

  getPatientPrescriptions: async (patientId: string): Promise<Prescription[]> => {
    const response: AxiosResponse<Prescription[]> = await api.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },
};

// Inventory API
export const inventoryAPI = {
  getInventory: async (pharmacyId: string): Promise<InventoryWithMedication[]> => {
    const response: AxiosResponse<InventoryWithMedication[]> = await api.get('/inventory', {
      params: { pharmacy_id: pharmacyId }
    });
    return response.data;
  },

  getInventoryItem: async (id: string): Promise<Inventory> => {
    const response: AxiosResponse<Inventory> = await api.get(`/inventory/${id}`);
    return response.data;
  },

  createInventoryItem: async (data: Omit<Inventory, 'id' | 'last_updated'>): Promise<Inventory> => {
    const response: AxiosResponse<Inventory> = await api.post('/inventory', data);
    return response.data;
  },

  updateInventoryItem: async (id: string, data: Partial<Inventory>): Promise<Inventory> => {
    const response: AxiosResponse<Inventory> = await api.put(`/inventory/${id}`, data);
    return response.data;
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },

  getLowStockItems: async (pharmacyId: string): Promise<Inventory[]> => {
    const response: AxiosResponse<Inventory[]> = await api.get('/inventory/low-stock', {
      params: { pharmacy_id: pharmacyId }
    });
    return response.data;
  },

  restockItem: async (id: string, quantity: number): Promise<void> => {
    await api.post('/inventory/restock', { id, quantity });
  },
};

export default api;
