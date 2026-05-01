'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { SalesTrendChart, generateMockSalesData } from '@/components/charts/SalesTrendChart';
import { DrugCategoryChart, generateMockCategoryData } from '@/components/charts/DrugCategoryChart';
import { toast } from '@/components/ui/Toast';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Package, Activity, Filter, BarChart3 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/ui/Breadcrumbs';
import { useNavigation } from '@/hooks/useNavigation';

interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  totalPrescriptions: number;
  averageOrderValue: number;
  growthRate: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  patientDemographics: {
    ageGroups: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    gender: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
}


export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [salesData, setSalesData] = useState(generateMockSalesData(30));
  const [categoryData, setCategoryData] = useState(generateMockCategoryData());
  const router = useRouter();
  const { goBack, getBackPath, addToHistory } = useNavigation();

  useEffect(() => {
    // Add current page to navigation history
    addToHistory('/analytics', 'Analytics');
  }, [addToHistory]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Simulate API call to get analytics data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: AnalyticsData = {
          totalRevenue: 125000,
          totalSales: 3420,
          totalPrescriptions: 1250,
          averageOrderValue: 36.55,
          growthRate: 12.5,
          topProducts: [
            { name: 'Amoxicillin 500mg', sales: 450, revenue: 11250, growth: 15.2 },
            { name: 'Lisinopril 10mg', sales: 380, revenue: 9500, growth: 8.7 },
            { name: 'Metformin 500mg', sales: 320, revenue: 8000, growth: -2.3 },
            { name: 'Atorvastatin 20mg', sales: 290, revenue: 7250, growth: 22.1 },
            { name: 'Omeprazole 20mg', sales: 260, revenue: 6500, growth: 5.4 }
          ],
          patientDemographics: {
            ageGroups: [
              { range: '0-18', count: 120, percentage: 8.5 },
              { range: '19-35', count: 280, percentage: 19.8 },
              { range: '36-50', count: 420, percentage: 29.8 },
              { range: '51-65', count: 380, percentage: 26.9 },
              { range: '65+', count: 210, percentage: 14.9 }
            ],
            gender: [
              { type: 'Male', count: 680, percentage: 48.2 },
              { type: 'Female', count: 710, percentage: 50.4 },
              { type: 'Other', count: 20, percentage: 1.4 }
            ]
          }
        };

        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [router]);

  useEffect(() => {
    // Update data based on time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    console.log('Time range changed to:', timeRange, 'Generating data for', days, 'days');
    
    // Show toast notification for time range change
    const rangeText = timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : timeRange === '90d' ? '90 Days' : '1 Year';
    toast.info(`Updated to show ${rangeText} of data`);
    
    setSalesData(generateMockSalesData(days));
    setCategoryData(generateMockCategoryData());
  }, [timeRange]);

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(range);
  };

  const handleExportPDF = () => {
    toast.info('Generating PDF report...');
    
    // Create a temporary element with the report content
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '800px';
    element.style.padding = '40px';
    element.style.backgroundColor = 'white';
    element.style.fontFamily = 'Arial, sans-serif';
    
    const pdfContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1f2937; margin-bottom: 20px;">Analytics Report</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">Generated on ${new Date().toLocaleDateString()} (${timeRange})</p>
        
        <h2 style="color: #1f2937; margin: 30px 0 15px 0;">Key Metrics</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #6b7280;">Total Revenue</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981;">${analyticsData ? formatCurrency(analyticsData.totalRevenue) : '0 ETB'}</p>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #6b7280;">Total Sales</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3b82f6;">${analyticsData ? analyticsData.totalSales.toLocaleString() : '0'}</p>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #6b7280;">Total Prescriptions</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #8b5cf6;">${analyticsData ? analyticsData.totalPrescriptions.toLocaleString() : '0'}</p>
          </div>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #6b7280;">Average Order Value</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #f59e0b;">${analyticsData ? formatCurrency(analyticsData.averageOrderValue) : '0 ETB'}</p>
          </div>
        </div>

        <h2 style="color: #1f2937; margin: 30px 0 15px 0;">Top Products</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Product</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Sales</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${analyticsData ? analyticsData.topProducts.map((product, index) => `
              <tr style="${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${product.name}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${product.sales}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">${formatCurrency(product.revenue)}</td>
              </tr>
            `).join('') : ''}
          </tbody>
        </table>
      </div>
    `;
    
    element.innerHTML = pdfContent;
    document.body.appendChild(element);
    
    // Use html2canvas to create image and download
    import('html2canvas').then(({ default: html2canvas }) => {
      return html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
    }).then((canvas) => {
      // Convert to image and download
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgData;
      link.click();
      
      // Clean up
      document.body.removeChild(element);
      toast.success('Analytics report exported successfully');
    }).catch((error) => {
      console.error('Export error:', error);
      toast.error('Failed to export report');
      document.body.removeChild(element);
    });
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
                <div className="text-lg font-semibold text-gray-700">Loading Analytics...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1">
          {/* Page Header */}
          <div className="px-6 py-6">
            <PageHeader
              title="Analytics Dashboard"
              subtitle="Comprehensive insights and business intelligence"
              breadcrumbs={[
                { label: "Analytics", icon: BarChart3 }
              ]}
              showBackButton={true}
              backHref={getBackPath()}
              actions={
                <>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                    {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => handleTimeRangeChange(range)}
                        className={cn(
                          'px-4 py-2 text-sm font-medium transition-colors',
                          timeRange === range
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                </>
              }
            />
          </div>

          {/* Key Metrics */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.totalRevenue?.toLocaleString() || '0'} ETB
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
                      <span className="text-emerald-600">+{analyticsData?.growthRate || 0}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.totalSales?.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-blue-600">+8.3%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.totalPrescriptions?.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                      <span className="text-purple-600">+12.1%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.averageOrderValue?.toFixed(2) || '0.00'} ETB
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <TrendingDown className="w-4 h-4 text-amber-600 mr-1" />
                      <span className="text-amber-600">-2.4%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesTrendChart data={salesData} timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
              <DrugCategoryChart data={categoryData} />
            </div>
          </div>

          {/* Top Products */}
          <div className="px-6 pb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
              <div className="space-y-4">
                {analyticsData?.topProducts?.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{product.revenue.toLocaleString()} ETB</p>
                      <div className={cn(
                        'flex items-center text-sm',
                        product.growth > 0 ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {product.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {product.growth > 0 ? '+' : ''}{product.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Age Distribution</h2>
                <div className="space-y-3">
                  {analyticsData?.patientDemographics?.ageGroups?.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 w-12">{group.range}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">{group.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Gender Distribution</h2>
                <div className="space-y-3">
                  {analyticsData?.patientDemographics?.gender?.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 w-12">{group.type}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full',
                              group.type === 'Male' ? 'bg-blue-600' :
                              group.type === 'Female' ? 'bg-pink-600' :
                              'bg-purple-600'
                            )}
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">{group.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
