'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { inventoryAPI, medicationAPI } from '@/lib/api/api';
import { Medication, InventoryWithMedication } from '@/types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: InventoryWithMedication) => void;
  pharmacyId: string;
}

interface FormData {
  medication_id: string;
  quantity_on_hand: number;
  reorder_level: number;
  unit_cost: number;
  selling_price: number;
  expiry_date: string;
  batch_number: string;
  supplier: string;
}

export function AddInventoryModal({ isOpen, onClose, onSuccess, pharmacyId }: AddInventoryModalProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<FormData>({
    medication_id: '',
    quantity_on_hand: 0,
    reorder_level: 10,
    unit_cost: 0,
    selling_price: 0,
    expiry_date: '',
    batch_number: '',
    supplier: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadMedications();
    }
  }, [isOpen]);

  const loadMedications = async () => {
    try {
      const meds = await medicationAPI.getMedications();
      setMedications(meds);
    } catch (error) {
      console.error('Failed to load medications:', error);
      toast.error('Failed to load medications');
    }
  };

  const filteredMedications = medications?.filter(med =>
    med.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.ndc_code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleMedicationSelect = (medication: Medication) => {
    setSelectedMedication(medication);
    setFormData(prev => ({
      ...prev,
      medication_id: medication.id,
      selling_price: 0 // You might want to set a default based on unit_cost + markup
    }));
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medication_id) {
      toast.error('Please select a medication');
      return;
    }

    if (formData.quantity_on_hand < 0) {
      toast.error('Quantity must be positive');
      return;
    }

    setLoading(true);
    try {
      const inventoryData = {
        pharmacy_id: pharmacyId,
        medication_id: formData.medication_id,
        quantity_on_hand: formData.quantity_on_hand,
        reorder_level: formData.reorder_level,
        unit_cost: formData.unit_cost || undefined,
        selling_price: formData.selling_price || undefined,
        expiry_date: formData.expiry_date || undefined,
        batch_number: formData.batch_number || undefined,
        supplier: formData.supplier || undefined
      };

      const newItem = await inventoryAPI.createInventoryItem(inventoryData);
      
      // Create a combined object for the frontend
      const medication = medications.find(m => m.id === formData.medication_id);
      const combinedItem: InventoryWithMedication = {
        ...newItem,
        medication_name: medication ? (medication.brand_name || medication.generic_name || '') : '',
        manufacturer: medication?.manufacturer,
        ndc: medication?.ndc_code || '',
        unit_price: formData.selling_price || undefined
      };

      onSuccess(combinedItem);
      onClose();
      toast.success('Inventory item added successfully');
      
      // Reset form
      setFormData({
        medication_id: '',
        quantity_on_hand: 0,
        reorder_level: 10,
        unit_cost: 0,
        selling_price: 0,
        expiry_date: '',
        batch_number: '',
        supplier: ''
      });
      setSelectedMedication(null);
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      toast.error('Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setTimeout(() => {
      setFormData({
        medication_id: '',
        quantity_on_hand: 0,
        reorder_level: 10,
        unit_cost: 0,
        selling_price: 0,
        expiry_date: '',
        batch_number: '',
        supplier: ''
      });
      setSelectedMedication(null);
      setSearchTerm('');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Inventory Item</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {/* Medication Dropdown */}
            {!selectedMedication && searchTerm && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
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
            {/* Quantity on Hand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity on Hand *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_on_hand: parseInt(e.target.value) || 0 }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => setFormData(prev => ({ ...prev, reorder_level: parseInt(e.target.value) || 0 }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batch_number}
                onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Optional"
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
                  Adding...
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
