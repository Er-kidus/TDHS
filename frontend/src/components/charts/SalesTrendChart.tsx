import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils/utils';

interface SalesData {
  date: string;
  sales: number;
  prescriptions: number;
  revenue: number;
}

interface SalesTrendChartProps {
  data: SalesData[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  className?: string;
}

export function SalesTrendChart({ data, timeRange = '30d', onTimeRangeChange, className }: SalesTrendChartProps) {

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name === 'revenue' ? 'Revenue' : 'Prescriptions'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {entry.name === 'revenue' 
                  ? formatCurrency(entry.value)
                  : entry.value
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgDailySales = totalSales / data.length;
  const growthRate = data.length > 1 
    ? ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue) * 100 
    : 0;

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
          <p className="text-sm text-gray-500 mt-1">Revenue and prescription volume over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <TrendingUp className="h-4 w-4 mr-1" />
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-600 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-xl font-semibold text-gray-900">
                {totalSales.toLocaleString()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-xl font-semibold text-gray-900">
                {avgDailySales.toFixed(0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="prescriptionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ETB`}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              yAxisId="prescriptions"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="revenue"
            />
            <Line
              yAxisId="prescriptions"
              type="monotone"
              dataKey="prescriptions"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="prescriptions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-center mt-4 space-x-2">
        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange?.(range)}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              range === timeRange
                ? 'bg-emerald-100 text-emerald-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Mock data generator for development
export function generateMockSalesData(days: number = 30): SalesData[] {
  const data: SalesData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseRevenue = 5000 + Math.random() * 3000;
    const basePrescriptions = 15 + Math.random() * 10;
    
    // Add some trend and seasonality
    const trend = (days - i) / days * 0.3;
    const seasonality = Math.sin(i / 7 * Math.PI) * 0.2;
    const randomVariation = (Math.random() - 0.5) * 0.3;
    
    const multiplier = 1 + trend + seasonality + randomVariation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      sales: Math.floor(basePrescriptions * multiplier),
      prescriptions: Math.floor(basePrescriptions * multiplier),
      revenue: Math.floor(baseRevenue * multiplier),
    });
  }
  
  return data;
}
