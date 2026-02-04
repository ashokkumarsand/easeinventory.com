'use client';

import { Card, CardBody, CardHeader, Chip, Skeleton } from '@heroui/react';
import { TrendingUp } from 'lucide-react';

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  trend: number;
}

// Mock data
const topProducts: TopProduct[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    sku: 'APL-IP15PM-256',
    unitsSold: 45,
    revenue: 5625000,
    trend: 12.5,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-256',
    unitsSold: 38,
    revenue: 4750000,
    trend: 8.3,
  },
  {
    id: '3',
    name: 'OnePlus 12',
    sku: 'OP-12-256',
    unitsSold: 32,
    revenue: 2240000,
    trend: 15.2,
  },
  {
    id: '4',
    name: 'MacBook Air M3',
    sku: 'APL-MBA-M3',
    unitsSold: 18,
    revenue: 2178000,
    trend: -2.1,
  },
  {
    id: '5',
    name: 'AirPods Pro 2',
    sku: 'APL-APP2',
    unitsSold: 67,
    revenue: 1675000,
    trend: 22.4,
  },
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

interface TopProductsProps {
  isLoading?: boolean;
}

export function TopProducts({ isLoading }: TopProductsProps) {
  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader>
          <Skeleton className="h-6 w-32 rounded-lg" />
        </CardHeader>
        <CardBody className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Top Products</h3>
            <p className="text-sm text-foreground/50">Best sellers this month</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{product.name}</p>
                <p className="text-xs text-foreground/40">
                  {product.unitsSold} units • {formatCurrency(product.revenue)}
                </p>
              </div>
              <Chip
                size="sm"
                variant="flat"
                color={product.trend >= 0 ? 'success' : 'danger'}
                className="font-bold"
              >
                {product.trend >= 0 ? '+' : ''}{product.trend}%
              </Chip>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
