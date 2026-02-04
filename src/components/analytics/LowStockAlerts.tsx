'use client';

import { Button, Card, CardBody, CardHeader, Chip, Skeleton } from '@heroui/react';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
}

// Mock data
const lowStockItems: LowStockItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    sku: 'APL-IP15PM-256',
    currentStock: 3,
    minStock: 10,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAM-S24U-256',
    currentStock: 5,
    minStock: 15,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'USB-C Charging Cable',
    sku: 'ACC-USBC-1M',
    currentStock: 12,
    minStock: 50,
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Screen Protector - Universal',
    sku: 'ACC-SP-UNI',
    currentStock: 8,
    minStock: 30,
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Laptop Battery - Dell',
    sku: 'PRT-BAT-DELL',
    currentStock: 2,
    minStock: 8,
    category: 'Parts',
  },
];

interface LowStockAlertsProps {
  isLoading?: boolean;
  limit?: number;
}

export function LowStockAlerts({ isLoading, limit = 5 }: LowStockAlertsProps) {
  const items = lowStockItems.slice(0, limit);

  if (isLoading) {
    return (
      <Card className="border border-foreground/5">
        <CardHeader>
          <Skeleton className="h-6 w-32 rounded-lg" />
        </CardHeader>
        <CardBody className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Low Stock Alerts</h3>
              <p className="text-sm text-foreground/50">{lowStockItems.length} items need attention</p>
            </div>
          </div>
          <Button
            as={Link}
            href="/dashboard/inventory?filter=low_stock"
            size="sm"
            variant="flat"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="divide-y divide-foreground/5">
          {items.map((item) => {
            const stockPercent = (item.currentStock / item.minStock) * 100;
            const severity = stockPercent <= 30 ? 'danger' : 'warning';

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 hover:bg-foreground/5 -mx-3 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Package className="w-5 h-5 text-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-foreground/40">{item.sku}</p>
                </div>
                <div className="text-right">
                  <Chip size="sm" color={severity} variant="flat" className="font-bold">
                    {item.currentStock} left
                  </Chip>
                  <p className="text-[10px] text-foreground/40 mt-1">Min: {item.minStock}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
