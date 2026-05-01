'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { toast } from '@/components/ui/Toast';
import { 
  User as UserIcon,
  Building, 
  Bell, 
  Shield, 
  Database, 
  Monitor, 
  Smartphone, 
  Globe, 
  Key,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Settings
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { User, UserRole } from '@/types';
import { PageHeader } from '@/components/ui/Breadcrumbs';
import { useNavigation } from '@/hooks/useNavigation';

interface ExtendedUser extends User {
  pharmacy_name?: string;
}

interface PharmacySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  operating_hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export default function SettingsPage() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { goBack, getBackPath, addToHistory } = useNavigation();

  useEffect(() => {
    // Add current page to navigation history
    addToHistory('/settings', 'Settings');
  }, [addToHistory]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userData = await authAPI.getProfile();
        const extendedUserData = userData as ExtendedUser;
        setUser(extendedUserData);
        
        // Set profile form values
        setProfileForm({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email || '',
          phone: userData.phone || ''
        });

        // Set pharmacy form values (mock data for now)
        setPharmacyForm({
          name: extendedUserData.pharmacy_name || 'MedCare Pharmacy',
          address: '123 Main St, City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'contact@medcare.com',
          license_number: 'PH-12345-67890',
          operating_hours: {
            monday: '9:00 AM - 6:00 PM',
            tuesday: '9:00 AM - 6:00 PM',
            wednesday: '9:00 AM - 6:00 PM',
            thursday: '9:00 AM - 6:00 PM',
            friday: '9:00 AM - 6:00 PM',
            saturday: '9:00 AM - 2:00 PM',
            sunday: 'Closed'
          }
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []); // Remove router dependency to prevent infinite loop

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [pharmacyForm, setPharmacyForm] = useState<PharmacySettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    license_number: '',
    operating_hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 2:00 PM',
      sunday: 'Closed'
    }
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    low_stock_alerts: true,
    prescription_alerts: true,
    daily_reports: false,
    weekly_reports: true
  });

  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [systemSettings, setSystemSettings] = useState({
    auto_backup: true,
    backup_frequency: 'daily',
    data_retention_days: 365,
    maintenance_mode: false,
    api_rate_limit: 1000,
    session_timeout: 30
  });

  const [billingInfo, setBillingInfo] = useState({
    plan: 'professional',
    billing_cycle: 'monthly',
    card_last_four: '4242',
    next_billing_date: '2024-05-25',
    usage_stats: {
      prescriptions_used: 1250,
      prescriptions_limit: 5000,
      storage_used: 2.3,
      storage_limit: 10
    }
  });

  const [supportTickets, setSupportTickets] = useState([
    { id: 'TK-001', subject: 'Inventory sync issue', status: 'resolved', date: '2024-04-20' },
    { id: 'TK-002', subject: 'Prescription printing problem', status: 'open', date: '2024-04-23' }
  ]);

  const [faqOpen, setFaqOpen] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userData = await authAPI.getProfile();
        const extendedUserData = userData as ExtendedUser;
        setUser(extendedUserData);
        
        // Set profile form values
        setProfileForm({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email || '',
          phone: userData.phone || ''
        });

        // Set pharmacy form values (mock data for now)
        setPharmacyForm({
          name: extendedUserData.pharmacy_name || 'MedCare Pharmacy',
          address: '123 Main St, City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'contact@medcare.com',
          license_number: 'PH-12345-67890',
          operating_hours: {
            monday: '9:00 AM - 6:00 PM',
            tuesday: '9:00 AM - 6:00 PM',
            wednesday: '9:00 AM - 6:00 PM',
            thursday: '9:00 AM - 6:00 PM',
            friday: '9:00 AM - 6:00 PM',
            saturday: '9:00 AM - 2:00 PM',
            sunday: 'Closed'
          }
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []); // Remove router dependency to prevent infinite loop

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser((prev: ExtendedUser | null) => prev ? { ...prev, ...profileForm } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePharmacySave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Pharmacy settings updated successfully');
    } catch (error) {
      toast.error('Failed to update pharmacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityForm.new_password !== securityForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurityForm({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update two-factor authentication');
    } finally {
      setSaving(false);
    }
  };

  const handleSystemSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('System settings updated successfully');
    } catch (error) {
      toast.error('Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Backup completed successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setSaving(false);
    }
  };

  const handleBillingUpdate = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Billing information updated');
    } catch (error) {
      toast.error('Failed to update billing information');
    } finally {
      setSaving(false);
    }
  };

  const handleSupportSubmit = async (subject: string, message: string) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTicket = {
        id: `TK-${String(supportTickets.length + 1).padStart(3, '0')}`,
        subject,
        status: 'open',
        date: new Date().toISOString().split('T')[0]
      };
      
      setSupportTickets(prev => [newTicket, ...prev]);
      toast.success('Support ticket created successfully');
    } catch (error) {
      toast.error('Failed to create support ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
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
                <div className="text-lg font-semibold text-gray-700">Loading Settings...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'pharmacy', label: 'Pharmacy', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1">
          {/* Page Header */}
          <div className="px-6 py-6">
            <PageHeader
              title="Settings"
              subtitle="Manage your account and system preferences"
              breadcrumbs={[
                { label: "Settings", icon: Settings }
              ]}
              showBackButton={true}
              backHref={getBackPath()}
              actions={
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              }
            />
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:w-64">
                <nav className="bg-white rounded-xl shadow-sm p-2">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            value={profileForm.first_name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            value={profileForm.last_name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={handleProfileSave}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pharmacy Settings */}
                {activeTab === 'pharmacy' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Pharmacy Information</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy Name</label>
                          <input
                            type="text"
                            value={pharmacyForm.name}
                            onChange={(e) => setPharmacyForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                          <input
                            type="text"
                            value={pharmacyForm.license_number}
                            onChange={(e) => setPharmacyForm(prev => ({ ...prev, license_number: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <input
                            type="text"
                            value={pharmacyForm.address}
                            onChange={(e) => setPharmacyForm(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={pharmacyForm.phone}
                            onChange={(e) => setPharmacyForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={pharmacyForm.email}
                            onChange={(e) => setPharmacyForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={handlePharmacySave}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive updates and alerts via email</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.email_notifications}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">SMS Notifications</p>
                            <p className="text-sm text-gray-500">Receive critical alerts via SMS</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.sms_notifications}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Low Stock Alerts</p>
                            <p className="text-sm text-gray-500">Get notified when inventory is low</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.low_stock_alerts}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, low_stock_alerts: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Prescription Alerts</p>
                            <p className="text-sm text-gray-500">Notifications for new prescriptions</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.prescription_alerts}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, prescription_alerts: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Daily Reports</p>
                            <p className="text-sm text-gray-500">Receive daily summary reports</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.daily_reports}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, daily_reports: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Receive weekly analytics reports</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.weekly_reports}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, weekly_reports: e.target.checked }))}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={handleNotificationSave}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-8">
                      {/* Password Change */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                              type="password"
                              value={securityForm.current_password}
                              onChange={(e) => setSecurityForm(prev => ({ ...prev, current_password: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                              type="password"
                              value={securityForm.new_password}
                              onChange={(e) => setSecurityForm(prev => ({ ...prev, new_password: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              value={securityForm.confirm_password}
                              onChange={(e) => setSecurityForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Enable 2FA</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                          <button
                            onClick={handleTwoFactorToggle}
                            disabled={saving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={handlePasswordChange}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Settings */}
                {activeTab === 'system' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">System Configuration</h2>
                    <div className="space-y-8">
                      {/* Backup Settings */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Backup & Recovery</h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Automatic Backup</p>
                              <p className="text-sm text-gray-500">Regularly backup your pharmacy data</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={systemSettings.auto_backup}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, auto_backup: e.target.checked }))}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </label>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                            <select
                              value={systemSettings.backup_frequency}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, backup_frequency: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                            <input
                              type="number"
                              value={systemSettings.data_retention_days}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, data_retention_days: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <button
                            onClick={handleBackupNow}
                            disabled={saving}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {saving ? 'Creating Backup...' : 'Backup Now'}
                          </button>
                        </div>
                      </div>

                      {/* System Configuration */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">System Configuration</h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Maintenance Mode</p>
                              <p className="text-sm text-gray-500">Temporarily disable user access</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={systemSettings.maintenance_mode}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </label>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (requests/hour)</label>
                            <input
                              type="number"
                              value={systemSettings.api_rate_limit}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, api_rate_limit: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                              type="number"
                              value={systemSettings.session_timeout}
                              onChange={(e) => setSystemSettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <button
                          onClick={handleSystemSave}
                          disabled={saving}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save System Settings'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Settings */}
                {activeTab === 'billing' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h2>
                    <div className="space-y-8">
                      {/* Current Plan */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Current Plan</h3>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-lg font-semibold text-gray-900 capitalize">{billingInfo.plan} Plan</p>
                              <p className="text-sm text-gray-600">${billingInfo.billing_cycle === 'monthly' ? '1,450' : '14,500'} ETB/{billingInfo.billing_cycle}</p>
                            </div>
                            <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full">
                              Active
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Next billing date: {billingInfo.next_billing_date}</p>
                          <p className="text-sm text-gray-600">Card ending in: {billingInfo.card_last_four}</p>
                        </div>
                      </div>

                      {/* Usage Statistics */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Usage Statistics</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Prescriptions</span>
                              <span className="text-sm font-medium text-gray-900">
                                {billingInfo.usage_stats.prescriptions_used} / {billingInfo.usage_stats.prescriptions_limit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(billingInfo.usage_stats.prescriptions_used / billingInfo.usage_stats.prescriptions_limit) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Storage (GB)</span>
                              <span className="text-sm font-medium text-gray-900">
                                {billingInfo.usage_stats.storage_used} / {billingInfo.usage_stats.storage_limit}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-emerald-600 h-2 rounded-full"
                                style={{ width: `${(billingInfo.usage_stats.storage_used / billingInfo.usage_stats.storage_limit) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Actions */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Billing Actions</h3>
                        <div className="space-y-3">
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Upgrade Plan
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Update Payment Method
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Download Invoices
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help & Support */}
                {activeTab === 'help' && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Help & Support</h2>
                    <div className="space-y-8">
                      {/* Support Tickets */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Recent Support Tickets</h3>
                        <div className="space-y-3">
                          {supportTickets.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{ticket.subject}</p>
                                <p className="text-sm text-gray-500">{ticket.id} • {ticket.date}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FAQ */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                          {[
                            { q: 'How do I reset my password?', a: 'Go to Settings > Security > Change Password to update your password.' },
                            { q: 'How can I backup my data?', a: 'Navigate to Settings > System > Backup & Recovery to configure automatic backups.' },
                            { q: 'What is included in my subscription?', a: 'Your plan includes prescriptions, storage, and support based on your current tier.' },
                            { q: 'How do I contact support?', a: 'Use the contact form below or email support@pharmacy.com for immediate assistance.' }
                          ].map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg">
                              <button
                                onClick={() => setFaqOpen(faqOpen === `faq-${index}` ? null : `faq-${index}`)}
                                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                              >
                                <span className="font-medium text-gray-900">{faq.q}</span>
                                <span className="text-gray-400">{faqOpen === `faq-${index}` ? '−' : '+'}</span>
                              </button>
                              {faqOpen === `faq-${index}` && (
                                <div className="px-4 py-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-600">{faq.a}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Form */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">Contact Support</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Subject"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="email"
                            placeholder="Your email"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <textarea
                          placeholder="Describe your issue..."
                          rows={4}
                          className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
