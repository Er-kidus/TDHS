import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Pill, TrendingUp, Package } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface CategoryData {
  category: string;
  value: number;
  percentage: number;
  color: string;
  growth: number;
}

interface DrugCategoryChartProps {
  data: CategoryData[];
  chartType?: 'pie' | 'bar';
  className?: string;
}

const COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
];

export function DrugCategoryChart({ data, chartType: initialChartType = 'pie', className }: DrugCategoryChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>(initialChartType);


  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {data.category}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Share:</span>
              <span className="font-medium text-gray-900">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Growth:</span>
              <span className={cn(
                'font-medium',
                data.growth > 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);
  const avgGrowth = data.reduce((sum, item) => sum + item.growth, 0) / data.length;
  const topCategory = data.reduce((max, item) => item.value > max.value ? item : max, data[0]);

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Drug Categories</h3>
          <p className="text-sm text-gray-500 mt-1">Revenue distribution by medication category</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setChartType(chartType === 'pie' ? 'bar' : 'pie')}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              chartType === 'pie' 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            )}
          >
            {chartType === 'pie' ? 'Bar Chart' : 'Pie Chart'}
          </button>
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
            <Pill className="h-8 w-8 text-emerald-600 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Category</p>
              <p className="text-xl font-semibold text-gray-900 truncate">
                {topCategory.category}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Growth</p>
              <p className={cn(
                'text-xl font-semibold',
                avgGrowth > 0 ? 'text-emerald-600' : 'text-red-600'
              )}>
                {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k ETB`}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category List */}
      <div className="mt-6 space-y-2">
        {data.map((category, index) => (
          <div key={category.category} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-900">
                {category.category}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {formatCurrency(category.value)}
              </span>
              <span className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                category.growth > 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-red-100 text-red-700'
              )}>
                {category.growth > 0 ? '+' : ''}{category.growth.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock data generator for development
export function generateMockCategoryData(): CategoryData[] {
  return [
    {
      category: 'Antibiotics',
      value: 45000,
      percentage: 25.5,
      color: COLORS[0],
      growth: 12.5,
    },
    {
      category: 'Pain Relief',
      value: 38000,
      percentage: 21.6,
      color: COLORS[1],
      growth: 8.3,
    },
    {
      category: 'Cardiovascular',
      value: 32000,
      percentage: 18.2,
      color: COLORS[2],
      growth: -2.1,
    },
    {
      category: 'Diabetes',
      value: 28000,
      percentage: 15.9,
      color: COLORS[3],
      growth: 15.7,
    },
    {
      category: 'Vitamins',
      value: 18000,
      percentage: 10.2,
      color: COLORS[4],
      growth: 5.2,
    },
    {
      category: 'Others',
      value: 15000,
      percentage: 8.5,
      color: COLORS[5],
      growth: 3.8,
    },
  ];
}
