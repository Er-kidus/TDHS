'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { CommandPalette, useCommandPalette } from '@/components/ui/CommandPalette';
import { AdaptiveTable } from '@/components/ui/ResponsiveTable';
import { PDFExport } from '@/components/ui/PDFExport';
import { toast } from '@/components/ui/Toast';
import { Search, Plus, Filter, Download, User, Calendar, Phone, Mail, MapPin, Heart, Activity, AlertTriangle, Users } from 'lucide-react';
import { authAPI, emrAPI } from '@/lib/api';
import { PageHeader } from '@/components/ui/Breadcrumbs';
import { useNavigation } from '@/hooks/useNavigation';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  national_id: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address: string;
  blood_type: string;
  allergies: string[];
  chronic_conditions: string[];
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance_info: {
    provider: string;
    policy_number: string;
  };
  last_visit: string;
  total_prescriptions: number;
  active_medications: string[];
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');
  const router = useRouter();
  const { goBack, getBackPath, addToHistory } = useNavigation();
  
  // Command palette functionality
  const { isOpen: isCommandPaletteOpen, open: openCommandPalette, close: closeCommandPalette, selectedPatient, setSelectedPatient } = useCommandPalette();

  useEffect(() => {
    // Add current page to navigation history
    addToHistory('/patients', 'Patients');
  }, [addToHistory]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Get user profile to determine pharmacy_id
        const userProfile = await authAPI.getProfile();
        
        // Load patients from EMR system
        const patientsData = await emrAPI.searchPatients('', userProfile.pharmacy_id);
        setPatients(patientsData);
      } catch (error) {
        console.error('Failed to load patients:', error);
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [router]);

  // Handle patient selection from command palette
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    toast.success(`Selected patient: ${patient.first_name} ${patient.last_name}`);
    closeCommandPalette();
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.national_id.includes(searchTerm) ||
                         patient.phone.includes(searchTerm);
    const matchesCondition = filterCondition === 'all' || 
                           patient.chronic_conditions.includes(filterCondition);
    
    return matchesSearch && matchesCondition;
  });

  const handleExportPDF = () => {
    const pdfContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1f2937; margin-bottom: 20px;">Patients Report</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Name</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">National ID</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Phone</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Blood Type</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPatients.map(patient => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${patient.first_name} ${patient.last_name}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${patient.national_id}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${patient.phone}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${patient.blood_type}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(patient.last_visit).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const pdfExport = new PDFExport({
      title: 'Patients Report',
      content: pdfContent,
      filename: `patients-report-${new Date().toISOString().split('T')[0]}.pdf`
    });

    pdfExport.generatePDF();
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const patientColumns = [
    {
      key: 'first_name',
      header: 'Patient',
      render: (value: string, item: Patient) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value} {item.last_name}</div>
            <div className="text-sm text-gray-500">ID: {item.national_id}</div>
            <div className="text-xs text-gray-400">Age: {getAge(item.date_of_birth)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'contact_info',
      header: 'Contact',
      render: (value: any, item: Patient) => (
        <div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Phone className="w-3 h-3" />
            <span>{item.phone}</span>
          </div>
          {item.email && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Mail className="w-3 h-3" />
              <span>{item.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'medical_info',
      header: 'Medical Info',
      render: (value: any, item: Patient) => (
        <div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              item.blood_type === 'A+' ? 'bg-red-500' :
              item.blood_type === 'B+' ? 'bg-blue-500' :
              item.blood_type === 'O+' ? 'bg-emerald-500' :
              item.blood_type === 'AB+' ? 'bg-purple-500' :
              'bg-gray-400'
            }`}></div>
            <span className="font-medium">{item.blood_type}</span>
          </div>
          {item.allergies.length > 0 && (
            <div className="text-xs text-red-600 mt-1">
              {item.allergies.length} allergies
            </div>
          )}
        </div>
      )
    },
    {
      key: 'chronic_conditions',
      header: 'Conditions',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((condition, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
              {condition}
            </span>
          ))}
          {value.length > 2 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{value.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      key: 'last_visit',
      header: 'Last Visit',
      render: (value: string) => (
        <div>
          <div className="text-sm">{new Date(value).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">
            {Math.ceil((new Date().getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </div>
        </div>
      )
    },
    {
      key: 'active_medications',
      header: 'Medications',
      render: (value: string[]) => (
        <div>
          <div className="text-sm font-medium">{value.length} active</div>
          {value.length > 0 && (
            <div className="text-xs text-gray-500">
              {value[0]}
              {value.length > 1 && ` +${value.length - 1} more`}
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-lg font-semibold text-gray-700">Loading Patients...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1">
          {/* Page Header */}
          <div className="px-6 py-6">
            <PageHeader
              title="Patients Management"
              subtitle="EMR-integrated patient records and medical history"
              breadcrumbs={[
                { label: "Patients", icon: Users }
              ]}
              showBackButton={true}
              backHref={getBackPath()}
              actions={
                <>
                  <button
                    onClick={openCommandPalette}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Quick Search (Ctrl+K)
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                  <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Patient
                  </button>
                </>
              }
            />
          </div>

          {/* Stats Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Patients</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {patients.filter(p => {
                        const daysSinceLastVisit = Math.ceil((new Date().getTime() - new Date(p.last_visit).getTime()) / (1000 * 60 * 60 * 24));
                        return daysSinceLastVisit <= 90;
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chronic Conditions</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {patients.reduce((sum, p) => sum + p.chronic_conditions.length, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Allergy Alerts</p>
                    <p className="text-2xl font-bold text-red-600">
                      {patients.filter(p => p.allergies.length > 0).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 pb-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                  </div>
                  
                  <select
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Conditions</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Asthma">Asthma</option>
                    <option value="Heart Disease">Heart Disease</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-xl shadow-sm">
              <AdaptiveTable
                data={filteredPatients}
                columns={patientColumns}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        onSelectPatient={handlePatientSelect}
      />
    </div>
  );
}
