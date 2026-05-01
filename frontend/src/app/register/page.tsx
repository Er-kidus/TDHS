'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// NoSSR component to prevent hydration mismatch
const NoSSR = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return <>{isClient ? children : null}</>;
};
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/Toast';
import { Building2, User, Mail, Lock, Phone, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { authAPI, pharmacyAPI } from '@/lib/api';
import { useSessionStorage } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['patient', 'doctor', 'pharmacist', 'technician', 'admin']),
  pharmacy_id: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { goBack, getBackPath } = useNavigation();
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  
  // Form persistence with sessionStorage
  const [savedForm, setSavedForm] = useSessionStorage('register-form', {
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'patient' as 'patient' | 'doctor' | 'pharmacist' | 'technician' | 'admin',
    pharmacy_id: '',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: savedForm.email || '',
      password: '',
      first_name: savedForm.first_name || '',
      last_name: savedForm.last_name || '',
      phone: savedForm.phone || '',
      role: savedForm.role || 'patient',
      pharmacy_id: savedForm.pharmacy_id || '',
    },
  });

  const selectedRole = watch('role');
  const needsPharmacy = ['pharmacist', 'technician'].includes(selectedRole);

  // Load pharmacies for dropdown - TEMPORARILY DISABLED FOR TESTING
  useEffect(() => {
    console.log('Register page loaded - testing without API call');
    setPharmacies([]);
    setLoadingPharmacies(false);
    
    // Original API call commented out for testing:
    // const loadPharmacies = async () => {
    //   try {
    //     const data = await pharmacyAPI.getPharmacies();
    //     setPharmacies(data);
    //   } catch (err: any) {
    //     console.error('Failed to load pharmacies:', err);
    //     // Don't show toast for network errors to avoid page crashes
    //     if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED') {
    //       toast.error('Failed to load pharmacies. Please try again.');
    //     }
    //     // Set empty pharmacies array to prevent crashes
    //     setPharmacies([]);
    //   } finally {
    //     setLoadingPharmacies(false);
    //   }
    // };
    // loadPharmacies();
  }, []);

  // Save form data to sessionStorage on change
  useEffect(() => {
    const subscription = watch((value) => {
      // Only save the fields that sessionStorage expects, with proper types
      const formDataToSave = {
        email: value.email || '',
        first_name: value.first_name || '',
        last_name: value.last_name || '',
        phone: value.phone || '',
        role: (value.role as 'patient' | 'doctor' | 'pharmacist' | 'technician' | 'admin') || 'patient',
        pharmacy_id: value.pharmacy_id || '',
      };
      setSavedForm(formDataToSave);
    });
    return () => subscription.unsubscribe();
  }, [watch, setSavedForm]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authAPI.register(data);
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
      
      // Clear sessionStorage on successful registration
      sessionStorage.removeItem('register-form');
      
      toast.success('Account created successfully!');
      window.location.href = '/dashboard';
    } catch (err: any) {
      let errorMessage = 'Registration failed';
      
      // Handle network errors gracefully
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (err?.response?.status === 409) {
        errorMessage = 'This email is already registered. Please try logging in or use a different email.';
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
      // Don't re-throw for network errors to prevent form reset
      if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNREFUSED') {
        throw err;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Account
          </h1>
          <p className="text-slate-600">
            Join the National Pharmacy Management System
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={goBack}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
          
          <NoSSR>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  {...register('first_name')}
                  placeholder="First Name"
                  label="First Name"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.first_name?.message}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Input
                  {...register('last_name')}
                  placeholder="Last Name"
                  label="Last Name"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.last_name?.message}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <Input
              {...register('email')}
              type="email"
              placeholder="email@example.com"
              label="Email Address"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              disabled={isSubmitting}
              autoComplete="email"
            />

            {/* Password */}
            <Input
              {...register('password')}
              type="password"
              placeholder="Enter password"
              label="Password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              disabled={isSubmitting}
              helperText="Must be at least 6 characters"
              autoComplete="new-password"
            />

            {/* Phone */}
            <Input
              {...register('phone')}
              type="tel"
              placeholder="+1 (555) 123-4567"
              label="Phone Number (Optional)"
              leftIcon={<Phone className="w-4 h-4" />}
              disabled={isSubmitting}
              autoComplete="tel"
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  {...register('role')}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="technician">Pharmacy Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {errors.role?.message && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Pharmacy Selection */}
            {needsPharmacy && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pharmacy *
                </label>
                {loadingPharmacies ? (
                  <Skeleton variant="default" className="h-10 w-full" />
                ) : pharmacies.length === 0 ? (
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('pharmacy_id', { required: needsPharmacy ? 'Please enter a pharmacy name' : false })}
                      type="text"
                      placeholder="Enter pharmacy name (backend unavailable)"
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900 disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-amber-600">
                      Backend server is unavailable. Please start the backend server or enter pharmacy name manually.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      {...register('pharmacy_id', { required: needsPharmacy ? 'Please select a pharmacy' : false })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-slate-900 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a pharmacy</option>
                      {pharmacies.map((pharmacy) => (
                        <option key={pharmacy.id} value={pharmacy.id}>
                          {pharmacy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {errors.pharmacy_id?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.pharmacy_id.message}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Form Actions */}
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => reset()}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                disabled={isSubmitting}
              >
                Clear Form
              </button>
              <button
                type="button"
                onClick={() => sessionStorage.removeItem('register-form')}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                disabled={isSubmitting}
              >
                Clear Saved Data
              </button>
            </div>
          </form>
          </NoSSR>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            By creating an account, you agree to our{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                alert('Terms of Service - This would open in a modal or new page');
              }}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                alert('Privacy Policy - This would open in a modal or new page');
              }}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
