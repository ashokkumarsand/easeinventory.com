'use client';

import React, { useEffect, useState } from 'react';
import { ValuationStatCards } from './ValuationStatCards';
import { ValuationByCategoryChart } from './ValuationByCategoryChart';
import { ValuationByLocationChart } from './ValuationByLocationChart';
import { CarryingCostBreakdown } from './CarryingCostBreakdown';
import { AgingChart } from './AgingChart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

export function ValuationDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = async (period: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/inventory-valuation?days=${period}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      console.error('Failed to fetch valuation data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(days); }, [days]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mb-3 text-destructive opacity-70" />
          <p className="font-medium text-foreground">Failed to load valuation data</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchData(days)}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1 bg-foreground/[0.06] rounded-lg p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              aria-label={`Select valuation period ${opt.label}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                days === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(days)} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <ValuationStatCards data={data} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ValuationByCategoryChart data={data?.byCategory || null} />
        <ValuationByLocationChart data={data?.byLocation || null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CarryingCostBreakdown data={data?.carryingCost || null} />
        <AgingChart data={data?.aging || null} />
      </div>
    </div>
  );
}
