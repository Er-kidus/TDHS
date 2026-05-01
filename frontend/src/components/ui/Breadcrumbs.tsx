'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
}

export function Breadcrumbs({ 
  items, 
  showBackButton = false, 
  backHref,
  className 
}: BreadcrumbsProps) {
  return (
    <div className={cn("flex items-center space-x-2 text-sm text-gray-600 mb-6", className)}>
      {showBackButton && (
        <Link
          href={backHref || "/dashboard"}
          className="flex items-center space-x-1 px-3 py-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      )}
      
      <div className="flex items-center space-x-2">
        <Link
          href="/dashboard"
          className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-1 px-2 py-1 text-gray-900 font-medium">
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs, 
  showBackButton = false, 
  backHref,
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {breadcrumbs && (
        <Breadcrumbs 
          items={breadcrumbs} 
          showBackButton={showBackButton}
          backHref={backHref}
        />
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
