'use client';

import { Card, CardBody, CardHeader, Progress, Skeleton } from '@heroui/react';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface StockCategory {
  name: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  total: number;
}

// Mock data
const categories: StockCategory[] = [
  { name: 'Electronics', inStock: 245, lowStock: 18, outOfStock: 5, total: 268 },
  { name: 'Accessories', inStock: 412, lowStock: 24, outOfStock: 12, total: 448 },
  { name: 'Parts & Components', inStock: 189, lowStock: 32, outOfStock: 8, total: 229 },
  { name: 'Services', inStock: 56, lowStock: 4, outOfStock: 0, total: 60 },
];

interface StockLevelsProps {
  isLoading?: boolean;
}

export function StockLevels({ isLoading }: StockLevelsProps) {
  const totalInStock = categories.reduce((sum, c) => sum + c.inStock, 0);
  const totalLowStock = categories.reduce((sum, c) => sum + c.lowStock, 0);
  const totalOutOfStock = categories.reduce((sum, c) => sum + c.outOfStock, 0);
  const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader>
          <Skeleton className="h-6 w-32 rounded-lg" />
        </CardHeader>
        <CardBody className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-bold">Stock Levels</h3>
            <p className="text-sm text-foreground/50">Inventory health by category</p>
          </div>
          <div className="flex items-center gap-1 text-foreground/50">
            <Package className="w-4 h-4" />
            <span className="text-sm font-semibold">{grandTotal} items</span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-success/10 border border-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs font-semibold text-success">In Stock</span>
            </div>
            <p className="text-xl font-black mt-1">{totalInStock}</p>
          </div>
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs font-semibold text-warning">Low Stock</span>
            </div>
            <p className="text-xl font-black mt-1">{totalLowStock}</p>
          </div>
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-danger" />
              <span className="text-xs font-semibold text-danger">Out of Stock</span>
            </div>
            <p className="text-xl font-black mt-1">{totalOutOfStock}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          {categories.map((category) => {
            const healthPercent = (category.inStock / category.total) * 100;
            const healthColor =
              healthPercent > 80 ? 'success' : healthPercent > 50 ? 'warning' : 'danger';

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-foreground/50">
                    {category.inStock}/{category.total} in stock
                  </span>
                </div>
                <Progress
                  value={healthPercent}
                  color={healthColor}
                  size="sm"
                  classNames={{
                    base: 'h-2',
                    track: 'bg-foreground/10',
                  }}
                />
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
