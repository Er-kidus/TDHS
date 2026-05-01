import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  minWidth?: string;
  sticky?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({ 
  data, 
  columns, 
  className, 
  onRowClick,
  loading = false,
  emptyMessage = 'No data available'
}: ResponsiveTableProps<T>) {
  const [selectedRow, setSelectedRow] = React.useState<string | null>(null);

  const handleRowClick = (row: T) => {
    const rowId = (row as any).id || JSON.stringify(row);
    setSelectedRow(rowId === selectedRow ? null : rowId);
    onRowClick?.(row);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className={cn('min-w-full divide-y divide-gray-200', className)}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sticky && 'sticky left-0 bg-gray-50 z-10',
                    column.className
                  )}
                  style={{ 
                    width: column.width,
                    minWidth: column.minWidth 
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap',
                      column.sticky && 'sticky left-0 bg-white z-10'
                    )}
                  >
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sticky && 'sticky left-0 bg-gray-50 z-10',
                  column.className
                )}
                style={{ 
                  width: column.width,
                  minWidth: column.minWidth 
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => {
            const rowId = (row as any).id || JSON.stringify(row);
            const isSelected = selectedRow === rowId;
            
            return (
              <tr
                key={rowId}
                className={cn(
                  'hover:bg-gray-50 cursor-pointer transition-colors',
                  isSelected && 'bg-emerald-50'
                )}
                onClick={() => handleRowClick(row)}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const renderedValue = column.render ? column.render(value, row) : String(value);
                  
                  return (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                        column.sticky && 'sticky left-0 bg-white z-10',
                        isSelected && column.sticky && 'bg-emerald-50 z-10'
                      )}
                      style={{ 
                        width: column.width,
                        minWidth: column.minWidth 
                      }}
                    >
                      {renderedValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Mobile card view for responsive design
interface MobileCardProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function MobileCardView<T>({ 
  data, 
  columns, 
  onRowClick, 
  className 
}: MobileCardProps<T>) {
  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);

  const handleCardClick = (row: T) => {
    const cardId = (row as any).id || JSON.stringify(row);
    setSelectedCard(cardId === selectedCard ? null : cardId);
    onRowClick?.(row);
  };

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {data.map((row) => {
        const cardId = (row as any).id || JSON.stringify(row);
        const isSelected = selectedCard === cardId;
        
        return (
          <div
            key={cardId}
            className={cn(
              'bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all',
              'hover:shadow-md hover:border-emerald-300',
              isSelected && 'border-emerald-500 shadow-md'
            )}
            onClick={() => handleCardClick(row)}
          >
            <div className="space-y-3">
              {columns.map((column) => {
                const value = row[column.key];
                const renderedValue = column.render ? column.render(value, row) : String(value);
                
                return (
                  <div key={String(column.key)} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {column.header}
                    </span>
                    <span className="text-sm text-gray-900 text-right">
                      {renderedValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Responsive table that switches between table and card view based on screen size
export function AdaptiveTable<T>({ 
  data, 
  columns, 
  className, 
  onRowClick,
  loading,
  emptyMessage 
}: ResponsiveTableProps<T>) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <MobileCardView
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        className={className}
      />
    );
  }

  return (
    <ResponsiveTable
      data={data}
      columns={columns}
      className={className}
      onRowClick={onRowClick}
      loading={loading}
      emptyMessage={emptyMessage}
    />
  );
}

// Helper function to create common table columns
export function createColumns<T>(
  definitions: Array<{
    key: keyof T;
    header: string;
    width?: string;
    minWidth?: string;
    sticky?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
    className?: string;
  }>
): Column<T>[] {
  return definitions.map(def => ({
    key: def.key,
    header: def.header,
    width: def.width,
    minWidth: def.minWidth,
    sticky: def.sticky,
    render: def.render,
    className: def.className,
  }));
}

// Example usage for inventory table
export const inventoryColumns = createColumns([
  {
    key: 'name',
    header: 'Medicine Name',
    width: '300px',
    minWidth: '200px',
    sticky: true,
    render: (value: string) => (
      <div className="font-medium text-gray-900">{value}</div>
    ),
  },
  {
    key: 'stock',
    header: 'Stock',
    width: '100px',
    render: (value: number, row: any) => (
      <div className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        value <= row.reorderLevel ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
      )}>
        {value}
      </div>
    ),
  },
  {
    key: 'reorderLevel',
    header: 'Reorder Level',
    width: '120px',
  },
  {
    key: 'unitPrice',
    header: 'Unit Price',
    width: '120px',
    render: (value: number) => (
      <div className="text-gray-900">{value.toFixed(2)} ETB</div>
    ),
  },
  {
    key: 'expiryDate',
    header: 'Expiry Date',
    width: '120px',
    render: (value: string) => (
      <div className="text-gray-900">
        {new Date(value).toLocaleDateString()}
      </div>
    ),
  },
]);

// Example usage for prescription table
export const prescriptionColumns = createColumns([
  {
    key: 'prescriptionNumber',
    header: 'Prescription #',
    width: '150px',
    sticky: true,
    render: (value: string) => (
      <div className="font-medium text-emerald-600">{value}</div>
    ),
  },
  {
    key: 'patientName',
    header: 'Patient',
    width: '200px',
    render: (value: string, row: any) => (
      <div>
        <div className="font-medium text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{row.patientPhone}</div>
      </div>
    ),
  },
  {
    key: 'doctorName',
    header: 'Doctor',
    width: '200px',
  },
  {
    key: 'datePrescribed',
    header: 'Date',
    width: '120px',
    render: (value: string) => (
      <div className="text-gray-900">
        {new Date(value).toLocaleDateString()}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '100px',
    render: (value: string) => (
      <div className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        value === 'filled' ? 'bg-emerald-100 text-emerald-800' :
        value === 'pending' ? 'bg-amber-100 text-amber-800' :
        value === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      )}>
        {value}
      </div>
    ),
  },
]);
