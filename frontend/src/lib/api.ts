import axios, { AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, User, Pharmacy, Medication, Prescription, Inventory, InventoryWithMedication } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1',
  timeout: 10000,
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
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      // Mock authentication for testing when backend is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using mock authentication for testing');
        
        // Mock user data based on email
        const mockUser = {
          id: '1',
          email: data.email,
          first_name: 'Test',
          last_name: 'User',
          role: (data.email.includes('admin') ? 'admin' : 
                data.email.includes('doctor') ? 'doctor' : 
                data.email.includes('pharmacist') ? 'pharmacist' : 'patient') as 'admin' | 'pharmacist' | 'technician' | 'doctor' | 'patient',
          phone: '+251911234567',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return {
          token: 'mock-token-' + Date.now(),
          user: mockUser
        };
      }
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Mock registration for testing when backend is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using mock registration for testing');
        
        // Mock user data based on registration data
        const mockUser = {
          id: '1',
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: (data.role || 'patient') as 'admin' | 'pharmacist' | 'technician' | 'doctor' | 'patient',
          phone: data.phone || '+251911234567',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return {
          token: 'mock-token-' + Date.now(),
          user: mockUser
        };
      }
      throw error;
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/refresh');
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    try {
      const response: AxiosResponse<User> = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      // Mock profile for testing when backend is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using mock profile for testing');
        
        // Return a mock user profile
        return {
          id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'pharmacist' as 'admin' | 'pharmacist' | 'technician' | 'doctor' | 'patient',
          phone: '+251911234567',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }
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

// Medication API
export const medicationAPI = {
  getMedications: async (search?: string): Promise<Medication[]> => {
    const params = search ? { search } : {};
    const response: AxiosResponse<Medication[]> = await api.get('/medications', { params });
    return response.data;
  },

  getMedication: async (id: string): Promise<Medication> => {
    const response: AxiosResponse<Medication> = await api.get(`/medications/${id}`);
    return response.data;
  },

  createMedication: async (data: Omit<Medication, 'id' | 'created_at'>): Promise<Medication> => {
    const response: AxiosResponse<Medication> = await api.post('/medications', data);
    return response.data;
  },

  updateMedication: async (id: string, data: Partial<Medication>): Promise<Medication> => {
    const response: AxiosResponse<Medication> = await api.put(`/medications/${id}`, data);
    return response.data;
  },

  deleteMedication: async (id: string): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },
};

// Prescription API
export const prescriptionAPI = {
  getPrescriptions: async (): Promise<Prescription[]> => {
    try {
      const response: AxiosResponse<Prescription[]> = await api.get('/prescriptions');
      return response.data;
    } catch (error: any) {
      // Mock prescriptions for testing when backend is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using mock prescriptions for testing');
        
        return [
          {
            id: '1',
            prescription_number: 'RX001',
            patient_id: '1',
            patient_name: 'John Doe',
            doctor_id: '1',
            prescriber_name: 'Dr. Smith',
            pharmacy_id: '1',
            drug_name: 'Amoxicillin',
            dosage: '500mg',
            quantity: 30,
            priority: 'medium' as 'high' | 'medium' | 'low',
            notes: 'Take twice daily with food',
            status: 'pending' as 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'expired',
            date_prescribed: new Date().toISOString(),
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            prescription_number: 'RX002',
            patient_id: '2',
            patient_name: 'Jane Smith',
            doctor_id: '2',
            prescriber_name: 'Dr. Johnson',
            pharmacy_id: '1',
            drug_name: 'Lisinopril',
            dosage: '10mg',
            quantity: 60,
            priority: 'low' as 'high' | 'medium' | 'low',
            notes: 'Take once daily in the morning',
            status: 'filled' as 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'expired',
            date_prescribed: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ];
      }
      throw error;
    }
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
    try {
      const response: AxiosResponse<Inventory[]> = await api.get('/inventory/low-stock', {
        params: { pharmacy_id: pharmacyId }
      });
      return response.data;
    } catch (error: any) {
      // Mock low stock items for testing when backend is not available
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Backend not available, using mock low stock items for testing');
        
        return [
          {
            id: '1',
            medication_id: 'MED001',
            pharmacy_id: pharmacyId,
            quantity_on_hand: 5,
            reorder_level: 20,
            unit_cost: 15.50,
            selling_price: 25.00,
            expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            batch_number: 'BATCH001',
            supplier: 'Pharma Supply Co.',
            last_updated: new Date().toISOString()
          },
          {
            id: '2',
            medication_id: 'MED002',
            pharmacy_id: pharmacyId,
            quantity_on_hand: 8,
            reorder_level: 25,
            unit_cost: 22.75,
            selling_price: 35.00,
            expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            batch_number: 'BATCH002',
            supplier: 'Medical Distributors Ltd.',
            last_updated: new Date().toISOString()
          }
        ];
      }
      throw error;
    }
  },

  restockItem: async (id: string, quantity: number): Promise<void> => {
    await api.post('/inventory/restock', { id, quantity });
  },
};

export default api;
