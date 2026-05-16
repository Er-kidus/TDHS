'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { prescriptionAPI, medicationAPI } from '@/lib/api/api';
import { emrAPI } from '@/lib/api/emr';
import { Medication, Prescription } from '@/types';
import { authAPI } from '@/lib/api/api';

interface NewPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPrescription: Prescription) => void;
  pharmacyId: string;
}

interface FormData {
  patient_id: string;
  patient_name: string;
  medication_id: string;
  drug_name: string;
  dosage: string;
  quantity: number;
  frequency: string;
  duration: string;
  prescriber_name: string;
  priority: string;
  notes: string;
}

export function NewPrescriptionModal({ isOpen, onClose, onSuccess, pharmacyId }: NewPrescriptionModalProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [formData, setFormData] = useState<FormData>({
    patient_id: '',
    patient_name: '',
    medication_id: '',
    drug_name: '',
    dosage: '',
    quantity: 1,
    frequency: '',
    duration: '',
    prescriber_name: '',
    priority: 'normal',
    notes: ''
  });
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const medicationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedications();
      loadPatients();
      setShowPatientDropdown(true);
      setShowMedicationDropdown(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
      if (medicationDropdownRef.current && !medicationDropdownRef.current.contains(event.target as Node)) {
        setShowMedicationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadMedications = async () => {
    try {
      const meds = await medicationAPI.getMedications();
      console.log('Loaded medications:', meds);
      setMedications(meds);
    } catch (error) {
      console.error('Failed to load medications:', error);
      toast.error('Failed to load medications');
    }
  };

  const loadPatients = async () => {
    try {
      const patientsData = await emrAPI.searchPatients('', pharmacyId);
      console.log('Loaded patients:', patientsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const filteredMedications = medications?.filter(med =>
    med.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.ndc_code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredPatients = patients?.filter(patient =>
    patient.first_name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.national_id?.includes(patientSearchTerm)
  ) || [];

  const handleMedicationSelect = (medication: Medication) => {
    setSelectedMedication(medication);
    setFormData(prev => ({
      ...prev,
      medication_id: medication.id,
      drug_name: medication.brand_name || medication.generic_name || ''
    }));
    setSearchTerm('');
    setShowMedicationDropdown(false);
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`
    }));
    setPatientSearchTerm('');
    setShowPatientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }

    if (!formData.medication_id) {
      toast.error('Please select a medication');
      return;
    }

    if (formData.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setLoading(true);
    try {
      const prescriptionData = {
        patient_id: formData.patient_id,
        doctor_id: localStorage.getItem('userId') || '00000000-0000-0000-0000-000000000000',
        pharmacy_id: pharmacyId,
        date_prescribed: new Date().toISOString().split('T')[0],
        notes: formData.notes || null,
        items: [
          {
            medication_id: formData.medication_id,
            dosage: formData.dosage || null,
            frequency: formData.frequency || null,
            duration: formData.duration || null,
            quantity: formData.quantity,
            instructions: formData.notes || null,
            refills_remaining: 0
          }
        ]
      };

      const newPrescription = await prescriptionAPI.createPrescription(prescriptionData);
      onSuccess(newPrescription);
      onClose();
      toast.success('Prescription created successfully');
      
      // Reset form
      setFormData({
        patient_id: '',
        patient_name: '',
        medication_id: '',
        drug_name: '',
        dosage: '',
        quantity: 1,
        frequency: '',
        duration: '',
        prescriber_name: '',
        priority: 'normal',
        notes: ''
      });
      setSelectedMedication(null);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to create prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setTimeout(() => {
      setFormData({
        patient_id: '',
        patient_name: '',
        medication_id: '',
        drug_name: '',
        dosage: '',
        quantity: 1,
        frequency: '',
        duration: '',
        prescriber_name: '',
        priority: 'normal',
        notes: ''
      });
      setSelectedMedication(null);
      setSelectedPatient(null);
      setSearchTerm('');
      setPatientSearchTerm('');
      setShowPatientDropdown(false);
      setShowMedicationDropdown(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Prescription</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients..."
                value={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : patientSearchTerm}
                onChange={(e) => {
                  setPatientSearchTerm(e.target.value);
                  setSelectedPatient(null);
                }}
                onFocus={() => setShowPatientDropdown(true)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {/* Patient Dropdown */}
            {!selectedPatient && showPatientDropdown && (
              <div ref={patientDropdownRef} className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.national_id} • {patient.phone}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    No patients found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Medication Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search medications..."
                value={selectedMedication ? (selectedMedication.brand_name || selectedMedication.generic_name || '') : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedMedication(null);
                }}
                onFocus={() => setShowMedicationDropdown(true)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {/* Medication Dropdown */}
            {!selectedMedication && showMedicationDropdown && (
              <div ref={medicationDropdownRef} className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredMedications.length > 0 ? (
                  filteredMedications.map((medication) => (
                    <div
                      key={medication.id}
                      onClick={() => handleMedicationSelect(medication)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {medication.brand_name || medication.generic_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {medication.ndc_code} • {medication.strength || ''} {medication.dosage_form || ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    No medications found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dosage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage *
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 500mg"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select frequency</option>
                <option value="once daily">Once daily</option>
                <option value="twice daily">Twice daily</option>
                <option value="three times daily">Three times daily</option>
                <option value="four times daily">Four times daily</option>
                <option value="as needed">As needed</option>
                <option value="every 8 hours">Every 8 hours</option>
                <option value="every 12 hours">Every 12 hours</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 7 days"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prescriber */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescriber *
              </label>
              <input
                type="text"
                value={formData.prescriber_name}
                onChange={(e) => setFormData(prev => ({ ...prev, prescriber_name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Dr. Name"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
              placeholder="Additional notes or instructions"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Prescription
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
