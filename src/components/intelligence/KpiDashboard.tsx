'use client';

import React, { useEffect, useState } from 'react';
import { KpiStatCards } from './KpiStatCards';
import { KpiTrendChart } from './KpiTrendChart';
import { AgingChart } from './AgingChart';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

export function KpiDashboard() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchKpis = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, historyRes] = await Promise.all([
        fetch('/api/analytics/kpis'),
        fetch('/api/analytics/kpis/history?limit=30'),
      ]);
      if (kpiRes.ok) setKpiData(await kpiRes.json());
      if (historyRes.ok) {
        const json = await historyRes.json();
        setHistoryData(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchKpis(); }, []);

  const handleSaveSnapshot = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/analytics/kpis', { method: 'POST' });
      await fetchKpis();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={fetchKpis} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button onClick={handleSaveSnapshot} disabled={isSaving}>
          <Save className={`w-4 h-4 mr-2`} />
          {isSaving ? 'Saving...' : 'Save Snapshot'}
        </Button>
      </div>

      <KpiStatCards data={kpiData} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KpiTrendChart data={historyData} />
        <AgingChart data={kpiData?.aging || null} />
      </div>
    </div>
  );
}
