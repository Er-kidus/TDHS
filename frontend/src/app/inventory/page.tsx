'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { InventoryStatus, CompactInventoryStatus } from '@/components/ui/InventoryStatus';
import { AdaptiveTable } from '@/components/ui/ResponsiveTable';
import { PDFExport } from '@/components/ui/PDFExport';
import { toast } from '@/components/ui/Toast';
import { Search, Plus, Filter, Download, AlertTriangle, Package, TrendingUp, Package as PackageIcon } from 'lucide-react';
import { inventoryAPI } from '@/lib/api';
import { Inventory, InventoryWithMedication } from '@/types';
import { AddInventoryModal } from '@/components/ui/AddInventoryModal';
import { PageHeader } from '@/components/ui/Breadcrumbs';
import { useNavigation } from '@/hooks/useNavigation';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryWithMedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  const { goBack, getBackPath, addToHistory } = useNavigation();

  useEffect(() => {
    // Add current page to navigation history
    addToHistory('/inventory', 'Inventory');
  }, []); // Remove addToHistory dependency to prevent infinite loop

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const pharmacyId = localStorage.getItem('pharmacyId');
        if (!pharmacyId) {
          toast.error('No pharmacy selected');
          return;
        }
        const inventoryData = await inventoryAPI.getInventory(pharmacyId);
        setInventory(inventoryData);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        toast.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, [router]);

  const handleAddItemSuccess = (newItem: InventoryWithMedication) => {
    setInventory(prev => [newItem, ...prev]);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = (item.medication_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.manufacturer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesLowStock = !showLowStockOnly || item.quantity_on_hand <= item.reorder_level;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const inventoryColumns = [
    {
      key: 'medication_name' as keyof InventoryWithMedication,
      header: 'Drug Name',
      render: (value: string, item: InventoryWithMedication) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{item.ndc}</div>
          </div>
        </div>
      )
    },
    {
      key: 'manufacturer' as keyof InventoryWithMedication,
      header: 'Manufacturer'
    },
    {
      key: 'quantity_on_hand' as keyof InventoryWithMedication,
      header: 'Stock',
      render: (value: number, item: InventoryWithMedication) => {
        // Create a compatible item object for the CompactInventoryStatus component
        const compatibleItem = {
          id: item.id,
          medicine_name: item.medication_name,
          quantity_on_hand: value,
          reorder_level: item.reorder_level,
          expiry_date: item.expiry_date || '',
          batch_number: item.batch_number || '',
          is_controlled: false, // This would need to be added to the model
          unit_price: item.unit_price || 0
        };
        return <CompactInventoryStatus item={compatibleItem} />;
      }
    },
    {
      key: 'unit_price' as keyof InventoryWithMedication,
      header: 'Unit Price',
      render: (value: number) => `${(value || 0).toFixed(2)} ETB`
    },
    {
      key: 'expiry_date' as keyof InventoryWithMedication,
      header: 'Expiry',
      render: (value: string) => {
        const expiryDate = new Date(value);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className={`font-medium ${
            daysUntilExpiry < 30 ? 'text-red-600' : 
            daysUntilExpiry < 90 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {expiryDate.toLocaleDateString()}
            <div className="text-xs text-gray-500">
              {daysUntilExpiry} days
            </div>
          </div>
        );
      }
    },
    {
      key: 'batch_number' as keyof InventoryWithMedication,
      header: 'Batch'
    },
    {
      key: 'medication_id' as keyof InventoryWithMedication,
      header: 'Controlled',
      render: () => (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          No
        </span>
      )
    }
  ];

  const handleExportPDF = () => {
    const pdfContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1f2937; margin-bottom: 20px;">Inventory Report</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Drug Name</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Stock</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Unit Price</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Expiry</th>
            </tr>
          </thead>
          <tbody>
            ${filteredInventory.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.medication_name || ''}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.quantity_on_hand}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${(item.unit_price || 0).toFixed(2)} ETB</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Create a temporary element with the report content
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.backgroundColor = 'white';
    element.style.fontFamily = 'Arial, sans-serif';
    
    element.innerHTML = pdfContent;
    document.body.appendChild(element);
    
    // Use html2canvas to create image and download
    import('html2canvas').then(({ default: html2canvas }) => {
      return html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
    }).then((canvas) => {
      // Convert to image and download
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgData;
      link.click();
      
      // Clean up
      document.body.removeChild(element);
      toast.success('Inventory report exported successfully');
    }).catch((error) => {
      console.error('Export error:', error);
      toast.error('Failed to export report');
      document.body.removeChild(element);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-lg font-semibold text-gray-700">Loading Inventory...</div>
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
              title="Inventory Management"
              subtitle="Manage your pharmacy stock and medications"
              breadcrumbs={[
                { label: "Inventory", icon: PackageIcon }
              ]}
              showBackButton={true}
              backHref={getBackPath()}
              actions={
                <>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
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
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {inventory.filter(item => item.quantity_on_hand <= item.reorder_level).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-red-600">
                      {inventory.filter(item => {
                        if (!item.expiry_date) return false;
                        const expiryDate = new Date(item.expiry_date);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return daysUntilExpiry < 30;
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventory.reduce((sum, item) => sum + (item.quantity_on_hand * (item.unit_price || 0)), 0).toFixed(2)} ETB
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
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
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                  </div>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="antibiotics">Antibiotics</option>
                    <option value="pain_relief">Pain Relief</option>
                    <option value="cardiovascular">Cardiovascular</option>
                    <option value="diabetes">Diabetes</option>
                  </select>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showLowStockOnly}
                      onChange={(e) => setShowLowStockOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Low Stock Only</span>
                  </label>
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

          {/* Inventory Table */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-xl shadow-sm">
              <AdaptiveTable
                data={filteredInventory}
                columns={inventoryColumns}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddItemSuccess}
        pharmacyId={localStorage.getItem('pharmacyId') || ''}
      />
    </div>
  );
}
