import { Patient } from '@/types';

// Helper functions for localStorage
const getStoredPatients = (): Patient[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('patients');
  if (!stored) {
    // Initialize with sample data if empty
    const samplePatients = [
      {
        id: 'p1',
        first_name: 'John',
        last_name: 'Doe',
        national_id: '1234567890',
        date_of_birth: '1980-05-15',
        phone: '0911223344',
        email: 'john.doe@example.com',
        address: 'Addis Ababa, Bole',
        blood_type: 'O+',
        allergies: ['Penicillin'],
        chronic_conditions: ['Hypertension'],
        emergency_contact: {
          name: 'Jane Doe',
          phone: '0911556677',
          relationship: 'Spouse'
        },
        insurance_info: {
          provider: 'Nyala Insurance',
          policy_number: 'POL-12345'
        },
        last_visit: '2023-10-20',
        total_prescriptions: 12,
        active_medications: ['Amlodipine 5mg']
      },
      {
        id: 'p2',
        first_name: 'Abebe',
        last_name: 'Bikila',
        national_id: '0987654321',
        date_of_birth: '1975-08-10',
        phone: '0922334455',
        email: 'abebe.b@example.com',
        address: 'Addis Ababa, Kazanchis',
        blood_type: 'A+',
        allergies: [],
        chronic_conditions: ['Diabetes'],
        emergency_contact: {
          name: 'Kebede Abebe',
          phone: '0922889900',
          relationship: 'Son'
        },
        insurance_info: {
          provider: 'United Insurance',
          policy_number: 'POL-67890'
        },
        last_visit: '2023-11-05',
        total_prescriptions: 8,
        active_medications: ['Metformin 500mg', 'Glipizide 5mg']
      }
    ];
    localStorage.setItem('patients', JSON.stringify(samplePatients));
    return samplePatients;
  }
  return JSON.parse(stored);
};

const setStoredPatients = (patients: Patient[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('patients', JSON.stringify(patients));
};

// EMR API for integration
export const emrAPI = {
  searchPatients: async (query: string, pharmacyId?: string): Promise<Patient[]> => {
    console.log(`Searching EMR for patients: ${query} (Pharmacy: ${pharmacyId})`);
    
    try {
      const patients = getStoredPatients();
      
      if (!query) {
        return patients;
      }
      
      const lowerQuery = query.toLowerCase();
      return patients.filter(patient =>
        patient.first_name?.toLowerCase().includes(lowerQuery) ||
        patient.last_name?.toLowerCase().includes(lowerQuery) ||
        patient.national_id?.includes(lowerQuery) ||
        patient.phone?.includes(lowerQuery)
      );
    } catch (error) {
      console.error('Failed to load patients from localStorage:', error);
      return [];
    }
  },

  getPatient: async (id: string): Promise<Patient> => {
    const patients = getStoredPatients();
    const patient = patients.find(p => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return patient;
  },

  createPatient: async (patientData: any): Promise<Patient> => {
    const patients = getStoredPatients();
    const newPatient = {
      ...patientData,
      id: patientData.id || `PAT-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    patients.push(newPatient);
    setStoredPatients(patients);
    return newPatient;
  },

  updatePatient: async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
    const patients = getStoredPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');
    
    patients[index] = { ...patients[index], ...patientData };
    setStoredPatients(patients);
    return patients[index];
  },

  deletePatient: async (id: string): Promise<void> => {
    const patients = getStoredPatients();
    const filtered = patients.filter(p => p.id !== id);
    setStoredPatients(filtered);
  }
};
