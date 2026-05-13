'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavigationHistory {
  path: string;
  title: string;
  timestamp: number;
}

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [history, setHistory] = useState<NavigationHistory[]>([]);

  // Track navigation history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('navigationHistory');
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (error) {
          console.warn('Failed to parse navigation history:', error);
        }
      }
    }
  }, []);

  const addToHistory = (path: string, title: string) => {
    const newEntry: NavigationHistory = {
      path,
      title,
      timestamp: Date.now()
    };

    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep last 10 entries
    setHistory(updatedHistory);

    if (typeof window !== 'undefined') {
      localStorage.setItem('navigationHistory', JSON.stringify(updatedHistory));
    }
  };

  const goBack = () => {
    if (history.length > 1) {
      // Go to previous page in history
      const previousEntry = history[1];
      window.location.href = previousEntry.path;
    } else {
      // Default to dashboard if no history
      window.location.href = '/dashboard';
    }
  };

  const navigate = (path: string, title?: string) => {
    if (title) {
      addToHistory(path, title);
    }
    window.location.href = path;
  };

  const getBackPath = (): string => {
    if (history.length > 1) {
      return history[1].path;
    }
    return '/dashboard';
  };

  const getBreadcrumbItems = (currentTitle: string, currentIcon?: any) => {
    const items: Array<{ label: string; href?: string; icon?: any }> = [];
    
    // Add breadcrumb items based on current path
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      // Home page
      return [];
    }

    // Build breadcrumb trail
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip the last segment (current page)
      if (index < pathSegments.length - 1) {
        const title = getPageTitle(segment);
        items.push({
          label: title,
          href: currentPath,
          icon: getPageIcon(segment)
        });
      }
    });

    // Add current page
    items.push({
      label: currentTitle,
      icon: currentIcon
    });

    return items;
  };

  return {
    goBack,
    navigate,
    getBackPath,
    getBreadcrumbItems,
    addToHistory,
    history
  };
}

// Helper functions
function getPageTitle(segment: string): string {
  const titles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'prescriptions': 'Prescriptions',
    'inventory': 'Inventory',
    'patients': 'Patients',
    'analytics': 'Analytics',
    'settings': 'Settings',
    'login': 'Login',
    'register': 'Register'
  };
  return titles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

function getPageIcon(segment: string) {
  // Import icons dynamically to avoid circular dependencies
  const icons: Record<string, any> = {
    'dashboard': () => null, // Will be handled by Home icon in breadcrumbs
    'prescriptions': null, // Will be passed from component
    'inventory': null,
    'patients': null,
    'analytics': null,
    'settings': null
  };
  return icons[segment];
}
