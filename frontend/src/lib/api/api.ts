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
