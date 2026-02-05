'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface CategorySales {
  name: string;
  value: number;
  color: string;
}

// Mock data
const categorySales: CategorySales[] = [
  { name: 'Electronics', value: 4520000, color: 'hsl(var(--primary))' },
  { name: 'Accessories', value: 1890000, color: 'hsl(var(--secondary))' },
  { name: 'Parts', value: 980000, color: '#22c55e' },
  { name: 'Services', value: 560000, color: '#eab308' },
  { name: 'Other', value: 340000, color: 'hsl(var(--muted-foreground))' },
];

const formatCurrency = (value: number) => {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return `₹${value}`;
};

interface SalesByCategoryProps {
  isLoading?: boolean;
}

export function SalesByCategory({ isLoading }: SalesByCategoryProps) {
  const total = categorySales.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader>
          <Skeleton className="h-6 w-40 rounded-lg" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <Skeleton className="w-48 h-48 rounded-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-0">
        <div>
          <h3 className="text-lg font-bold">Sales by Category</h3>
          <p className="text-sm text-foreground/50">Revenue distribution this month</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {categorySales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--foreground) / 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [formatCurrency(value as number), 'Revenue']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {categorySales.map((category) => (
            <div key={category.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-foreground/5">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{category.name}</p>
                <p className="text-[10px] text-foreground/50">
                  {formatCurrency(category.value)} ({((category.value / total) * 100).toFixed(0)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
