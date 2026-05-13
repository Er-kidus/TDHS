import React from 'react';
import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast interface
export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
}

// Custom toast functions
export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      className: 'bg-emerald-600 text-white border-emerald-700',
    });
  },
  
  error: (message: string, options?: { duration?: number }) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 5000,
      className: 'bg-red-600 text-white border-red-700',
    });
  },
  
  info: (message: string, options?: { duration?: number }) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      className: 'bg-blue-600 text-white border-blue-700',
    });
  },
  
  warning: (message: string, options?: { duration?: number }) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 4000,
      className: 'bg-amber-600 text-white border-amber-700',
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      className: 'bg-gray-800 text-white border-gray-700',
    });
  },
  
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },
};

// Toast provider component
export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'hsl(0 0% 3.9%)',
          color: 'hsl(0 0% 98%)',
          border: '1px solid hsl(0 0% 14.9%)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: 'hsl(142 76% 36%)',
            secondary: 'hsl(0 0% 98%)',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(0 84% 60%)',
            secondary: 'hsl(0 0% 98%)',
          },
        },
        warning: {
          iconTheme: {
            primary: 'hsl(38 92% 50%)',
            secondary: 'hsl(0 0% 98%)',
          },
        },
        info: {
          iconTheme: {
            primary: 'hsl(221 83% 53%)',
            secondary: 'hsl(0 0% 98%)',
          },
        },
      }}
    />
  );
}

// Hook for toast usage
export function useToast() {
  return toast;
}
