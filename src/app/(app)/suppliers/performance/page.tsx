'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SupplierPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [days, setDays] = useState('90');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPerformance();
  }, [days]);

  const fetchPerformance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/supplier-performance?days=${days}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch supplier performance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/analytics/supplier-performance', { method: 'POST' });
      await fetchPerformance();
    } catch (err) {
      console.error('Failed to refresh metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{score.toFixed(1)}</Badge>;
    if (score >= 60) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{score.toFixed(1)}</Badge>;
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{score.toFixed(1)}</Badge>;
  };

  const formatRate = (rate: number | null) => {
    if (rate === null || rate === undefined) return '—';
    return `${rate.toFixed(1)}%`;
  };

  const filteredSuppliers = data?.suppliers?.filter((s: any) =>
    s.supplierName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Supplier Performance</h1>
          </div>
          <p className="text-foreground/40 font-bold ml-1">Track lead times, quality, on-time delivery, and reliability scores</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="font-bold rounded-full gap-2" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="modern-card p-6">
          <CardContent className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Avg Lead Time</p>
              <h2 className="text-2xl font-black">{data?.avgLeadTime ? `${data.avgLeadTime}d` : '—'}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card p-6">
          <CardContent className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Avg Quality</p>
              <h2 className="text-2xl font-black">{data?.avgQuality ? `${data.avgQuality}%` : '—'}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card p-6">
          <CardContent className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">On-Time Rate</p>
              <h2 className="text-2xl font-black">{data?.avgOnTimeRate ? `${data.avgOnTimeRate}%` : '—'}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="modern-card p-6">
          <CardContent className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground">Avg Reliability</p>
              <h2 className="text-2xl font-black">{data?.avgReliability ? `${data.avgReliability}` : '—'}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Ranking Table */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 max-w-md">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
            <Input
              placeholder="Search suppliers..."
              className="pl-10 h-12 rounded-xl border border-foreground/10 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Supplier Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-foreground/10">
                      <th className="text-left py-3 px-2 font-semibold text-foreground/60">#</th>
                      <th className="text-left py-3 px-2 font-semibold text-foreground/60">Supplier</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Total POs</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Completed</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Avg Lead Time</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">On-Time %</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Quality %</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Fill Rate %</th>
                      <th className="text-right py-3 px-2 font-semibold text-foreground/60">Reliability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((s: any, idx: number) => (
                      <tr key={s.supplierId} className="border-b border-foreground/5 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-2 font-bold text-foreground/30">{idx + 1}</td>
                        <td className="py-3 px-2">
                          <Link href={`/suppliers/${s.supplierId}`} className="font-semibold hover:text-primary transition-colors">
                            {s.supplierName}
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-right">{s.totalPOs}</td>
                        <td className="py-3 px-2 text-right">{s.completedPOs}</td>
                        <td className="py-3 px-2 text-right">
                          {s.avgLeadTimeDays !== null ? `${s.avgLeadTimeDays}d` : '—'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={
                            s.onTimeRate !== null && s.onTimeRate >= 80 ? 'text-green-600' :
                            s.onTimeRate !== null && s.onTimeRate >= 60 ? 'text-amber-600' :
                            s.onTimeRate !== null ? 'text-red-600' : ''
                          }>
                            {formatRate(s.onTimeRate)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={
                            s.qualityScore !== null && s.qualityScore >= 95 ? 'text-green-600' :
                            s.qualityScore !== null && s.qualityScore >= 80 ? 'text-amber-600' :
                            s.qualityScore !== null ? 'text-red-600' : ''
                          }>
                            {formatRate(s.qualityScore)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={
                            s.fillRate !== null && s.fillRate >= 95 ? 'text-green-600' :
                            s.fillRate !== null && s.fillRate >= 80 ? 'text-amber-600' :
                            s.fillRate !== null ? 'text-red-600' : ''
                          }>
                            {formatRate(s.fillRate)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">{getScoreBadge(s.reliabilityScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-foreground/30">
                {data?.suppliers?.length === 0 ? 'No supplier data available' : 'No matching suppliers'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
