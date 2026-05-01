import React from 'react';
import { AlertTriangle, Clock, Package, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { daysUntilExpiry, getExpiryStatus } from '@/lib/utils';

interface InventoryItem {
  id: string;
  medicine_name: string;
  quantity_on_hand: number;
  reorder_level: number;
  expiry_date: string;
  batch_number: string;
  is_controlled: boolean;
  unit_price: number;
}

interface InventoryStatusProps {
  item: InventoryItem;
  className?: string;
}

export function InventoryStatus({ item, className }: InventoryStatusProps) {
  const daysToExpiry = daysUntilExpiry(item.expiry_date);
  const expiryStatus = getExpiryStatus(item.expiry_date);
  const isLowStock = item.quantity_on_hand <= item.reorder_level;
  const stockPercentage = item.quantity_on_hand / item.reorder_level;

  const getStatusColor = () => {
    if (expiryStatus === 'expired') return 'bg-red-100 text-red-800 border-red-200';
    if (expiryStatus === 'expiring') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (isLowStock) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const getStatusIcon = () => {
    if (expiryStatus === 'expired') return <AlertTriangle className="h-4 w-4" />;
    if (expiryStatus === 'expiring') return <Clock className="h-4 w-4" />;
    if (isLowStock) return <Package className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (expiryStatus === 'expired') return 'Expired';
    if (expiryStatus === 'expiring') return `${daysToExpiry} days to expiry`;
    if (isLowStock) return `Low stock (${item.quantity_on_hand} left)`;
    return 'In stock';
  };

  const getStockBarColor = () => {
    if (stockPercentage <= 0.25) return 'bg-red-500';
    if (stockPercentage <= 0.5) return 'bg-amber-500';
    if (stockPercentage <= 0.75) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Status Badge */}
      <div className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        getStatusColor()
      )}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </div>

      {/* Stock Level Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Stock Level</span>
          <span className="font-medium text-gray-900">
            {item.quantity_on_hand} / {item.reorder_level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getStockBarColor())}
            style={{ width: `${Math.min(100, stockPercentage * 100)}%` }}
          />
        </div>
      </div>

      {/* Batch Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <Package className="h-4 w-4 mr-1" />
          Batch: {item.batch_number}
        </div>
        {item.is_controlled && (
          <div className="flex items-center px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Controlled
          </div>
        )}
      </div>

      {/* Expiry Timeline */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Expiry Date</span>
          <span className={cn(
            'font-medium',
            expiryStatus === 'expired' ? 'text-red-600' :
            expiryStatus === 'expiring' ? 'text-amber-600' :
            'text-gray-900'
          )}>
            {new Date(item.expiry_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        
        {/* Expiry Progress Bar */}
        {expiryStatus !== 'expired' && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                expiryStatus === 'expiring' ? 'bg-amber-500' : 'bg-emerald-500'
              )}
              style={{
                width: `${Math.max(0, Math.min(100, (daysToExpiry / 365) * 100))}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for table cells
export function CompactInventoryStatus({ item, className }: InventoryStatusProps) {
  if (!item) {
    return <div className={cn('flex items-center space-x-2', className)}>
      <div className="w-2 h-2 rounded-full bg-gray-300" />
      <span className="text-xs text-gray-500">No data</span>
    </div>;
  }
  
  const daysToExpiry = item.expiry_date ? daysUntilExpiry(item.expiry_date) : 0;
  const expiryStatus = item.expiry_date ? getExpiryStatus(item.expiry_date) : 'safe';
  const isLowStock = item.quantity_on_hand <= item.reorder_level;

  const getDotColor = () => {
    if (expiryStatus === 'expired') return 'bg-red-500';
    if (expiryStatus === 'expiring') return 'bg-amber-500';
    if (isLowStock) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn('w-2 h-2 rounded-full', getDotColor())} />
      <span className="text-sm text-gray-600">
        {item.quantity_on_hand} units
      </span>
      {expiryStatus === 'expiring' && (
        <span className="text-xs text-amber-600">
          {daysToExpiry}d
        </span>
      )}
    </div>
  );
}

// Alert component for critical inventory issues
export function InventoryAlert({ items }: { items: InventoryItem[] }) {
  const criticalItems = items.filter(item => {
    const daysToExpiry = daysUntilExpiry(item.expiry_date);
    const isLowStock = item.quantity_on_hand <= item.reorder_level;
    return daysToExpiry <= 7 || item.quantity_on_hand === 0;
  });

  if (criticalItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Critical Inventory Alerts
          </h3>
          <div className="mt-2 space-y-1">
            {criticalItems.slice(0, 3).map((item) => {
              const daysToExpiry = daysUntilExpiry(item.expiry_date);
              const isExpired = daysToExpiry < 0;
              const isOutOfStock = item.quantity_on_hand === 0;
              
              return (
                <div key={item.id} className="text-sm text-red-700">
                  <span className="font-medium">{item.medicine_name}</span>
                  {isExpired && ' - EXPIRED'}
                  {!isExpired && daysToExpiry <= 7 && ` - Expires in ${daysToExpiry} days`}
                  {isOutOfStock && ' - OUT OF STOCK'}
                  {!isOutOfStock && item.quantity_on_hand <= item.reorder_level && ` - Low stock (${item.quantity_on_hand})`}
                </div>
              );
            })}
            {criticalItems.length > 3 && (
              <div className="text-sm text-red-600">
                ...and {criticalItems.length - 3} more items
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
