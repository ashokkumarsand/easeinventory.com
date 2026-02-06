'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Truck,
  TrendingUp,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ShipmentVolumeChart = dynamic(
  () => import('./ShipmentVolumeChart'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] rounded-xl" />,
  }
);

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-slate-100 text-slate-700',
  PICKUP_SCHEDULED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-amber-100 text-amber-700',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  RTO_INITIATED: 'bg-red-100 text-red-700',
  RTO_DELIVERED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
  LOST: 'bg-red-100 text-red-700',
};

export default function ShippingAnalyticsPage() {
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    fetchKpis();
  }, [days]);

  const fetchKpis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/shipment-kpis?days=${days}`);
      const data = await res.json();
      setKpis(data);
    } catch (err) {
      console.error('Failed to fetch shipping KPIs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const d = Math.floor(hours / 24);
    const h = Math.round(hours % 24);
    return `${d}d ${h}h`;
  };

  const formatRate = (rate: number | null) => {
    if (rate === null) return '—';
    return `${rate.toFixed(1)}%`;
  };

  if (isLoading && !kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Shipping Analytics
          </h1>
          <p className="text-foreground/50 mt-1">
            Delivery performance, carrier metrics, and shipment trends
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchKpis} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Package className="w-4 h-4" /> Total Shipments
            </div>
            <div className="text-3xl font-bold mt-1">{kpis?.totalShipments || 0}</div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-green-600">{kpis?.deliveredCount || 0} delivered</span>
              <span className="text-foreground/30">|</span>
              <span className="text-blue-600">{kpis?.inTransitCount || 0} in transit</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Clock className="w-4 h-4" /> Avg Delivery Time
            </div>
            <div className="text-3xl font-bold mt-1">{formatHours(kpis?.avgDeliveryHours)}</div>
            <div className="text-xs text-foreground/40 mt-2">From pickup to delivery</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <CheckCircle2 className="w-4 h-4" /> On-Time Delivery
            </div>
            <div className={`text-3xl font-bold mt-1 ${
              kpis?.onTimeDeliveryRate !== null && kpis?.onTimeDeliveryRate >= 90
                ? 'text-green-600'
                : kpis?.onTimeDeliveryRate !== null && kpis?.onTimeDeliveryRate < 70
                  ? 'text-red-600'
                  : ''
            }`}>
              {formatRate(kpis?.onTimeDeliveryRate)}
            </div>
            <div className="text-xs text-foreground/40 mt-2">Within 5-day SLA</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <ShieldAlert className="w-4 h-4" /> NDR Rate
            </div>
            <div className={`text-3xl font-bold mt-1 ${
              kpis?.ndrRate !== null && kpis?.ndrRate > 10 ? 'text-red-600' : ''
            }`}>
              {formatRate(kpis?.ndrRate)}
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-red-600">{kpis?.rtoCount || 0} RTO</span>
              <span className="text-foreground/30">|</span>
              <span className="text-foreground/50">{kpis?.cancelledCount || 0} cancelled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Shipment Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpis?.dailyVolume?.length > 0 ? (
              <ShipmentVolumeChart data={kpis.dailyVolume} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-foreground/30">
                No shipment data for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis?.statusDistribution && Object.keys(kpis.statusDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(kpis.statusDistribution as Record<string, number>)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const pct = kpis.totalShipments > 0
                      ? ((count as number) / kpis.totalShipments) * 100
                      : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
                            {status.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                        <div className="w-full bg-foreground/5 rounded-full h-1.5">
                          <div
                            className="bg-primary rounded-full h-1.5 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-foreground/30">
                No data
              </div>
            )}

            {/* COD vs Prepaid */}
            <div className="mt-6 pt-4 border-t border-foreground/5">
              <div className="text-xs font-medium text-foreground/50 mb-2">Payment Mode</div>
              <div className="flex gap-3">
                <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{kpis?.codShipments || 0}</div>
                  <div className="text-xs text-foreground/50">COD</div>
                </div>
                <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold">{kpis?.prepaidShipments || 0}</div>
                  <div className="text-xs text-foreground/50">Prepaid</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carrier Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" /> Carrier Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kpis?.carrierPerformance?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left py-3 px-2 font-medium text-foreground/60">Carrier</th>
                    <th className="text-right py-3 px-2 font-medium text-foreground/60">Shipments</th>
                    <th className="text-right py-3 px-2 font-medium text-foreground/60">Delivered</th>
                    <th className="text-right py-3 px-2 font-medium text-foreground/60">RTO</th>
                    <th className="text-right py-3 px-2 font-medium text-foreground/60">Avg Time</th>
                    <th className="text-right py-3 px-2 font-medium text-foreground/60">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.carrierPerformance.map((c: any) => (
                    <tr key={c.carrier} className="border-b border-foreground/5">
                      <td className="py-3 px-2 font-medium">{c.carrier}</td>
                      <td className="py-3 px-2 text-right">{c.total}</td>
                      <td className="py-3 px-2 text-right text-green-600">{c.delivered}</td>
                      <td className="py-3 px-2 text-right text-red-600">{c.rto}</td>
                      <td className="py-3 px-2 text-right">{formatHours(c.avgDeliveryHours)}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`font-medium ${
                          c.successRate >= 90 ? 'text-green-600' :
                          c.successRate >= 70 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {c.successRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-foreground/30">
              No carrier data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
