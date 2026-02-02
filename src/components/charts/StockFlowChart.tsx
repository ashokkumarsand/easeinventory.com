'use client';

import { Button, ButtonGroup } from '@heroui/react';
import { BarChart3, LineChart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart as RechartsLineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Sample data for the chart
const weeklyData = [
  { name: 'Mon', purchases: 420, sales: 280, repairs: 4 },
  { name: 'Tue', purchases: 380, sales: 320, repairs: 6 },
  { name: 'Wed', purchases: 520, sales: 450, repairs: 3 },
  { name: 'Thu', purchases: 280, sales: 380, repairs: 5 },
  { name: 'Fri', purchases: 450, sales: 520, repairs: 8 },
  { name: 'Sat', purchases: 680, sales: 620, repairs: 2 },
  { name: 'Sun', purchases: 320, sales: 180, repairs: 1 },
];

const monthlyData = [
  { name: 'Week 1', purchases: 2800, sales: 2100, repairs: 24 },
  { name: 'Week 2', purchases: 3200, sales: 2800, repairs: 18 },
  { name: 'Week 3', purchases: 2600, sales: 3100, repairs: 22 },
  { name: 'Week 4', purchases: 3800, sales: 3400, repairs: 16 },
];

type ChartType = 'line' | 'bar' | 'area';
type TimeRange = 'weekly' | 'monthly';

interface StockFlowChartProps {
  className?: string;
}

export default function StockFlowChart({ className }: StockFlowChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  const data = timeRange === 'weekly' ? weeklyData : monthlyData;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const colors = {
      purchases: '#22c55e', // green
      sales: '#3b82f6',     // blue
      repairs: '#f59e0b',   // amber
    };

    switch (chartType) {
      case 'line':
        return (
          <RechartsLineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                border: '1px solid var(--foreground/10)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }} 
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="purchases" stroke={colors.purchases} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Purchases" />
            <Line type="monotone" dataKey="sales" stroke={colors.sales} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Sales" />
          </RechartsLineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                border: '1px solid var(--foreground/10)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }} 
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="purchases" fill={colors.purchases} radius={[6, 6, 0, 0]} name="Purchases" />
            <Bar dataKey="sales" fill={colors.sales} radius={[6, 6, 0, 0]} name="Sales" />
          </BarChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.purchases} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.purchases} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.sales} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.sales} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                border: '1px solid var(--foreground/10)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }} 
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="purchases" stroke={colors.purchases} strokeWidth={2} fillOpacity={1} fill="url(#purchasesGradient)" name="Purchases" />
            <Area type="monotone" dataKey="sales" stroke={colors.sales} strokeWidth={2} fillOpacity={1} fill="url(#salesGradient)" name="Sales" />
          </AreaChart>
        );
    }
  };

  return (
    <div className={className}>
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 items-center">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h3 className="text-xl font-black tracking-tight">Recent Stock Flow</h3>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Chart Type Selector */}
          <ButtonGroup size="sm" variant="flat">
            <Button 
              isIconOnly 
              color={chartType === 'area' ? 'primary' : 'default'}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <TrendingUp size={16} />
            </Button>
            <Button 
              isIconOnly 
              color={chartType === 'line' ? 'primary' : 'default'}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <LineChart size={16} />
            </Button>
            <Button 
              isIconOnly 
              color={chartType === 'bar' ? 'primary' : 'default'}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <BarChart3 size={16} />
            </Button>
          </ButtonGroup>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={timeRange === 'weekly' ? 'flat' : 'light'} 
              radius="full" 
              className="font-bold"
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </Button>
            <Button 
              size="sm" 
              variant={timeRange === 'monthly' ? 'flat' : 'light'}
              radius="full" 
              className={`font-bold ${timeRange !== 'monthly' ? 'opacity-40' : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
