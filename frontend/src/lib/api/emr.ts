import { Patient } from '@/types';

// Mock EMR API for integration
export const emrAPI = {
  searchPatients: async (query: string, pharmacyId?: string): Promise<Patient[]> => {
    console.log(`Searching EMR for patients: ${query} (Pharmacy: ${pharmacyId})`);
    
    // In a real implementation, this would call an external EMR system API
    // For now, we return mock data
    return [
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
  },

  getPatient: async (id: string): Promise<Patient> => {
    // Mock single patient retrieval
    const patients = await emrAPI.searchPatients('');
    const patient = patients.find(p => p.id === id);
    if (!patient) throw new Error('Patient not found');
    return patient;
  }
};
