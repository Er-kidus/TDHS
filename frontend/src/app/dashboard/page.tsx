'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Package, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Heart,
  Shield,
  Bell,
  Search,
  Filter,
  Plus,
  Minus,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { authAPI, inventoryAPI, prescriptionAPI } from '@/lib/api/api';
import { User, Prescription, Inventory } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { SalesTrendChart, generateMockSalesData } from '@/components/charts/SalesTrendChart';
import { DrugCategoryChart, generateMockCategoryData } from '@/components/charts/DrugCategoryChart';
import { OptimisticUpdate, RealTimeInventoryUpdate } from '@/components/features/OptimisticUpdate';
import { PDFExportComponent } from '@/components/features/PDFExport';
import { AdaptiveTable, prescriptionColumns } from '@/components/ui/ResponsiveTable';
import { CommandPalette, useCommandPalette } from '@/components/features/CommandPalette';
import { logoutToParentSystem } from '@/lib/api/integration';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [salesData, setSalesData] = useState(generateMockSalesData(30));
  const [categoryData, setCategoryData] = useState(generateMockCategoryData());
  const router = useRouter();
  
  // Command palette functionality
  const { isOpen: isCommandPaletteOpen, open: openCommandPalette, close: closeCommandPalette, selectedPatient, setSelectedPatient } = useCommandPalette();

  // Handle patient selection from command palette
  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    toast.success(`Selected patient: ${patient.first_name} ${patient.last_name}`);
    // You can navigate to patient details or perform other actions here
  };

  // Optimistic update for prescription status
  const handlePrescriptionStatusUpdate = async (prescriptionId: string, newStatus: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Optimistic update with proper typing
    setPrescriptions(prev => prev.map(p => 
      p.id === prescriptionId 
        ? { ...p, status: newStatus as Prescription['status'] }
        : p
    ));
    
    toast.success(`Prescription ${prescriptionId} status updated to ${newStatus}`);
  };

  // Real-time inventory update
  const handleInventoryUpdate = async (itemId: string, newQuantity: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Update local state
    setLowStockItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, quantity_on_hand: newQuantity } : item)
    );
  };

  // Handle order now button click
  const handleOrderNow = async (item: Inventory) => {
    try {
      const loadingToastId = toast.loading(`Placing order for Medication #${item.medication_id}...`);
      
      // Simulate API call to place order
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the item quantity to show it's been ordered
      const newQuantity = item.reorder_level * 2; // Order double the reorder level
      setLowStockItems(prev => 
        prev.map(lowItem => 
          lowItem.id === item.id 
            ? { ...lowItem, quantity_on_hand: newQuantity }
            : lowItem
        )
      );
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success(`Order placed successfully for Medication #${item.medication_id}. Stock updated to ${newQuantity} units.`);
    } catch (error) {
      toast.error(`Failed to place order for Medication #${item.medication_id}`);
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Dashboard: Checking token:', token ? 'Token found' : 'No token');
        
        if (!token) {
          console.log('Dashboard: No token found, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('Dashboard: Loading user profile...');
        // Load user profile
        const userProfile = await authAPI.getProfile();
        console.log('Dashboard: User profile loaded:', userProfile);
        setUser(userProfile);

        console.log('Dashboard: Loading prescriptions...');
        // Load recent prescriptions
        const prescriptionsData = await prescriptionAPI.getPrescriptions();
        console.log('Dashboard: Prescriptions loaded:', prescriptionsData.length);
        setPrescriptions(prescriptionsData.slice(0, 5)); // Show only 5 most recent

        // Load low stock items if user is pharmacist or admin
        if (userProfile.role === 'pharmacist' || userProfile.role === 'admin') {
          try {
            console.log('Dashboard: Loading low stock items...');
            const lowStockData = await inventoryAPI.getLowStockItems('default');
            console.log('Dashboard: Low stock items loaded:', lowStockData.length);
            setLowStockItems(lowStockData);
          } catch (error) {
            console.error('Failed to load low stock items:', error);
            setLowStockItems([]);
          }
        }
        
        console.log('Dashboard: All data loaded successfully');
      } catch (err: any) {
        console.error('Dashboard: Failed to load dashboard data:', err);
        console.log('Dashboard: Error details:', err.code, err.message);
        
        // Check if it's a network error (backend not available)
        if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          console.log('Dashboard: Backend not available, but continuing with mock data');
          // Don't redirect to login for network errors since we have mock data
        } else if (err.response?.status === 401) {
          console.log('Dashboard: Token invalid/expired, redirecting to login');
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          console.log('Dashboard: Unexpected error, but continuing with mock data');
          // For any other errors, continue with mock data instead of redirecting
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading Pharmacy System...</div>
          <div className="text-sm text-gray-500 mt-2">Initializing your workspace</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      Pharmacy Dashboard
                    </h1>
                    <p className="text-sm text-slate-600">
                      Welcome back, {user?.first_name}. Here's your overview.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Command Palette Trigger */}
                  <button
                    onClick={openCommandPalette}
                    className="flex items-center px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <span className="mr-2">Search Patients...</span>
                    <kbd className="px-2 py-1 text-xs bg-white border border-slate-300 rounded">Ctrl+K</kbd>
                  </button>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {currentTime.toLocaleDateString()} · {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                      {user?.role?.toUpperCase()}
                    </span>
                    <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 text-sm font-semibold">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Interactive Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <SalesTrendChart data={salesData} />
                  <DrugCategoryChart data={categoryData} />
                </div>

                {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{prescriptions.length}</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-xl font-bold">💊</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">+12%</span>
                    <span className="text-gray-500 ml-2">from last month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{lowStockItems.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Critical items</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-yellow-600 text-xl font-bold">⚠️</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-red-600 font-medium">Action required</span>
                    <span className="text-gray-500 ml-2">for {lowStockItems.length} items</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Filled Today</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{prescriptions.filter(p => p.status === 'filled').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Completed</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-xl font-bold">✅</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">On track</span>
                    <span className="text-gray-500 ml-2">95% completion rate</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{prescriptions.filter(p => p.status === 'pending').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 text-xl font-bold">⏰</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-orange-600 font-medium">Priority</span>
                    <span className="text-gray-500 ml-2">3 urgent orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Prescriptions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Prescriptions
                    </h3>
                    <Link href="/prescriptions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">📋</span>
                      </div>
                      <p className="text-gray-500">No prescriptions found</p>
                      <p className="text-sm text-gray-400 mt-1">New prescriptions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">RX</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                #{prescription.prescription_number}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(prescription.date_prescribed).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                prescription.status === 'filled'
                                  ? 'bg-green-100 text-green-800'
                                  : prescription.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {prescription.status}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="text-sm">→</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Low Stock Alerts */}
              {(user?.role === 'pharmacist' || user?.role === 'admin') && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Low Stock Alerts
                      </h3>
                      <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold rounded-full">
                        {lowStockItems.length} Critical
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {lowStockItems.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-green-600 text-2xl">✅</span>
                        </div>
                        <p className="text-gray-500">All items adequately stocked</p>
                        <p className="text-sm text-gray-400 mt-1">No restocking needed</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lowStockItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-semibold">!</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  Medication #{item.medication_id}
                                </p>
                                <p className="text-sm text-red-600">
                                  Stock: {item.quantity_on_hand} / Reorder at: {item.reorder_level}
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleOrderNow(item)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Order Now
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Tab Content */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Prescription Management</h3>
            <p className="text-gray-600">Comprehensive prescription tracking and management tools.</p>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h3>
            <p className="text-gray-600">Real-time inventory tracking and automated restocking.</p>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Patient Records</h3>
            <p className="text-gray-600">Secure patient information and medication history.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Reports & Analytics</h3>
            <p className="text-gray-600">Comprehensive reporting and business intelligence.</p>
          </div>
        )}
          </main>
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
