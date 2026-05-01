import React, { useState, useCallback } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface OptimisticUpdateProps {
  id: string;
  type: 'prescription' | 'inventory' | 'patient';
  initialStatus: string;
  onUpdate: (id: string, newStatus: string) => Promise<any>;
  className?: string;
}

type UpdateStatus = 'idle' | 'updating' | 'success' | 'error';

export function OptimisticUpdate({ id, type, initialStatus, onUpdate, className }: OptimisticUpdateProps) {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const handleStatusChange = useCallback(async (newStatus: string) => {
    // Immediately update UI (optimistic update)
    setCurrentStatus(newStatus);
    setStatus('updating');

    try {
      // Call the update function
      await onUpdate(id, newStatus);
      
      // Success
      setStatus('success');
      toast.success(`${type} status updated successfully`);
      
      // Reset status after delay
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      // Revert on error
      setCurrentStatus(initialStatus);
      setStatus('error');
      toast.error(`Failed to update ${type} status`);
      
      // Reset status after delay
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [id, type, initialStatus, onUpdate]);

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'filled':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailableStatuses = () => {
    if (type === 'prescription') {
      return [
        { value: 'pending', label: 'Pending', color: 'text-amber-600' },
        { value: 'filled', label: 'Filled', color: 'text-emerald-600' },
        { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
      ];
    }
    return [];
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Current Status Display */}
      <div className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
        getStatusColor()
      )}>
        {status === 'updating' ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          getStatusIcon()
        )}
        <span className="capitalize">{currentStatus}</span>
      </div>

      {/* Status Selector */}
      {type === 'prescription' && status === 'idle' && (
        <div className="relative">
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {getAvailableStatuses().map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Update Status Indicator */}
      {status !== 'idle' && (
        <div className={cn(
          'text-xs font-medium',
          status === 'success' ? 'text-emerald-600' :
          status === 'error' ? 'text-red-600' :
          'text-gray-600'
        )}>
          {status === 'updating' && 'Updating...'}
          {status === 'success' && 'Updated'}
          {status === 'error' && 'Failed'}
        </div>
      )}
    </div>
  );
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  items: T[],
  updateFunction: (id: string, updates: Partial<T>) => Promise<T>
) {
  const [optimisticItems, setOptimisticItems] = useState(items);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    // Immediately update local state (optimistic update)
    setOptimisticItems(prev => 
      prev.map(item => 
        (item as any).id === id 
          ? { ...item, ...updates }
          : item
      )
    );

    // Mark as updating
    setUpdatingIds(prev => new Set(prev).add(id));

    try {
      // Call the actual update function
      const updatedItem = await updateFunction(id, updates);
      
      // Update with actual server response
      setOptimisticItems(prev => 
        prev.map(item => 
          (item as any).id === id 
            ? updatedItem
            : item
        )
      );

      toast.success('Item updated successfully');
    } catch (error) {
      // Revert on error
      setOptimisticItems(items);
      toast.error('Failed to update item');
    } finally {
      // Remove from updating set
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [items, updateFunction]);

  return {
    optimisticItems,
    updateItem,
    isUpdating: (id: string) => updatingIds.has(id),
  };
}

// Real-time inventory update component
export function RealTimeInventoryUpdate({ 
  itemId, 
  currentQuantity, 
  onUpdate 
}: {
  itemId: string;
  currentQuantity: number;
  onUpdate: (itemId: string, newQuantity: number) => Promise<void>;
}) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(currentQuantity);

  const handleUpdate = useCallback(async () => {
    if (tempQuantity === quantity) return;

    setIsUpdating(true);
    try {
      await onUpdate(itemId, tempQuantity);
      setQuantity(tempQuantity);
      toast.success('Inventory updated successfully');
    } catch (error) {
      setTempQuantity(quantity); // Revert on error
      toast.error('Failed to update inventory');
    } finally {
      setIsUpdating(false);
    }
  }, [itemId, tempQuantity, quantity, onUpdate]);

  const isLowStock = quantity <= 10;
  const isOutOfStock = quantity === 0;

  return (
    <div className="flex items-center space-x-3">
      <div className={cn(
        'flex items-center px-3 py-1 rounded-full text-sm font-medium',
        isOutOfStock ? 'bg-red-100 text-red-800' :
        isLowStock ? 'bg-amber-100 text-amber-800' :
        'bg-emerald-100 text-emerald-800'
      )}>
        <span>{quantity} units</span>
        {isLowStock && !isOutOfStock && (
          <AlertCircle className="h-3 w-3 ml-1" />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={tempQuantity}
          onChange={(e) => setTempQuantity(parseInt(e.target.value) || 0)}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={isUpdating}
        />
        <button
          onClick={handleUpdate}
          disabled={isUpdating || tempQuantity === quantity}
          className={cn(
            'px-3 py-1 text-sm rounded-lg transition-colors',
            isUpdating || tempQuantity === quantity
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          )}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Update'
          )}
        </button>
      </div>
    </div>
  );
}
