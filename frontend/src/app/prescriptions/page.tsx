'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { AdaptiveTable } from '@/components/ui/ResponsiveTable';
import { PDFExportUtility } from '@/components/features/PDFExport';
import { toast } from '@/components/ui/Toast';
import { Search, Plus, Filter, Download, QrCode, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { prescriptionAPI } from '@/lib/api/api';
import { Prescription, PrescriptionStatus } from '@/types';
import { PageHeader } from '@/components/layout/Breadcrumbs';
import { useNavigation } from '@/hooks/useNavigation';
import { NewPrescriptionModal } from '@/components/features/NewPrescriptionModal';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const router = useRouter();
  const { goBack, getBackPath, addToHistory } = useNavigation();

  useEffect(() => {
    // Add current page to navigation history
    addToHistory('/prescriptions', 'Prescriptions');
  }, []);

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const prescriptionsData = await prescriptionAPI.getPrescriptions();
        console.log('Prescriptions data loaded:', prescriptionsData);
        
        // Ensure we always set an array
        if (Array.isArray(prescriptionsData)) {
          setPrescriptions(prescriptionsData);
        } else if (prescriptionsData && prescriptionsData.prescriptions && Array.isArray(prescriptionsData.prescriptions)) {
          setPrescriptions(prescriptionsData.prescriptions);
        } else {
          console.warn('Prescriptions data is not in expected format:', prescriptionsData);
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Failed to load prescriptions:', error);
        toast.error('Failed to load prescriptions data');
        setPrescriptions([]); // Ensure we always have an array
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, [router]);

  const filteredPrescriptions = Array.isArray(prescriptions) ? prescriptions.filter(prescription => {
    const matchesSearch = (prescription.patient_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (prescription.drug_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (prescription.prescriber_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || prescription.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) : [];

  const handleStatusUpdate = async (prescriptionId: string, newStatus: PrescriptionStatus) => {
    try {
      // Optimistic update
      setPrescriptions(prev => 
        prev.map(p => p.id === prescriptionId ? { ...p, status: newStatus } : p)
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Prescription status updated to ${newStatus}`);
    } catch (error) {
      // Rollback on error
      setPrescriptions(prev => 
        prev.map(p => p.id === prescriptionId ? { ...p, status: p.status } : p)
      );
      toast.error('Failed to update prescription status');
    }
  };

  const isValidPrescriptionStatus = (value: string): value is PrescriptionStatus => {
    return ['filled', 'cancelled'].includes(value);
  };

  const handleStatusChange = (prescriptionId: string, value: string) => {
    if (isValidPrescriptionStatus(value)) {
      handleStatusUpdate(prescriptionId, value);
    }
  };

  const handlePrintQR = async (prescription: Prescription) => {
    const prescriptionData = {
      prescriptionNumber: prescription.id,
      patientName: prescription.patient_name,
      patientDOB: prescription.date_prescribed,
      doctorName: prescription.prescriber_name,
      datePrescribed: prescription.date_prescribed,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      medications: [{
        name: prescription.drug_name,
        dosage: prescription.dosage,
        frequency: "As prescribed",
      }],
      notes: `QR Code Hash: ${prescription.qr_code_hash || 'Generated automatically'}`,
      qrCode: prescription.id,
      qrHash: prescription.qr_code_hash || 'Generated automatically'
    };

    try {
      const pdfExport = new PDFExportUtility(prescriptionData, 'prescription');
      await pdfExport.generatePDF();
    } catch (error) {
      console.error('Failed to generate QR PDF:', error);
      toast.error('Failed to generate QR code PDF');
    }
  };

  const handleNewPrescription = () => {
    setShowNewPrescriptionModal(true);
  };

  const handlePrescriptionSuccess = (newPrescription: Prescription) => {
    setPrescriptions(prev => [newPrescription, ...prev]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'filled':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'filled':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const prescriptionColumns = [
    {
      key: 'id',
      header: 'Prescription ID',
      render: (value: string) => (
        <div className="font-mono text-sm font-medium text-gray-900">
          #{value}
        </div>
      )
    },
    {
      key: 'patient_name',
      header: 'Patient',
      render: (value: string, item: Prescription) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {item.patient_id}</div>
        </div>
      )
    },
    {
      key: 'drug_name',
      header: 'Medication',
      render: (value: string, item: Prescription) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{item.dosage}</div>
          <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
        </div>
      )
    },
    {
      key: 'prescriber_name',
      header: 'Prescriber'
    },
    {
      key: 'date_prescribed',
      header: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, item: Prescription) => (
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(value)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(value)}
              <span>{value}</span>
            </div>
          </span>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, item: Prescription) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePrintQR(item)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Print QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          {item.status === 'pending' && (
            <select
              onChange={(e) => handleStatusChange(item.id, e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Update</option>
              <option value="filled">Fill</option>
              <option value="cancelled">Cancel</option>
            </select>
          )}
        </div>
      )
    }
  ];

  const handleExportPDF = () => {
    const pdfContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1f2937; margin-bottom: 20px;">Prescriptions Report</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()}</p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Prescription ID</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Patient</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Medication</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Status</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPrescriptions.map(prescription => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">#${prescription.id}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${prescription.patient_name}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${prescription.drug_name}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${prescription.status}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${new Date(prescription.date_prescribed).toLocaleDateString()}</td>
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
      link.download = `prescriptions-report-${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgData;
      link.click();
      
      // Clean up
      document.body.removeChild(element);
      toast.success('Prescriptions report exported successfully');
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
                <div className="text-lg font-semibold text-gray-700">Loading Prescriptions...</div>
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
              title="E-Prescriptions"
              subtitle="Manage electronic prescriptions and QR codes"
              breadcrumbs={[
                { label: "Prescriptions", icon: FileText }
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
                    onClick={handleNewPrescription}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Prescription
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
                    <p className="text-sm text-gray-600">Total Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {prescriptions.filter(p => p.status === 'pending').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Filled Today</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {prescriptions.filter(p => p.status === 'filled').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-2xl font-bold text-red-600">
                      {prescriptions.filter(p => p.priority === 'high').length}
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
                      placeholder="Search prescriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="filled">Filled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>

                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
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

          {/* Prescriptions Table */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-xl shadow-sm">
              <AdaptiveTable
                data={filteredPrescriptions}
                columns={prescriptionColumns}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Prescription Modal */}
      <NewPrescriptionModal
        isOpen={showNewPrescriptionModal}
        onClose={() => setShowNewPrescriptionModal(false)}
        onSuccess={handlePrescriptionSuccess}
        pharmacyId={localStorage.getItem('pharmacyId') || ''}
      />
    </div>
  );
}
