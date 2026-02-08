'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Layers,
  Building2,
  AlertTriangle,
  ArrowUpDown,
  TrendingUp,
  Package,
  Loader2,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  Info,
  Save,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================
// Types
// ============================================================

interface LocationBreakdown {
  locationId: string;
  locationName: string;
  currentStock: number;
  demandRate: number;
  daysOfSupply: number;
  optimalStock: number;
  delta: number;
  serviceLevel: number;
}

interface SkuAnalysis {
  productId: string;
  productName: string;
  sku: string | null;
  totalStock: number;
  totalDemand: number;
  locations: LocationBreakdown[];
  networkImbalance: number;
  recommendation: string;
}

interface NetworkHealthEntry {
  locationId: string;
  locationName: string;
  type: string;
  overStocked: number;
  underStocked: number;
  balanced: number;
  utilizationPct: number;
}

interface EchelonDashboard {
  summary: {
    totalLocations: number;
    totalSkusAnalyzed: number;
    imbalancedSkus: number;
    avgNetworkImbalance: number;
    totalRecommendedMoves: number;
    potentialSavings: number;
  };
  skuAnalysis: SkuAnalysis[];
  networkHealth: NetworkHealthEntry[];
}

interface EchelonAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'imbalance';
  severity: 'critical' | 'warning' | 'info';
  productId: string;
  productName: string;
  sku: string | null;
  locationId?: string;
  locationName?: string;
  currentValue: number;
  optimalValue: number;
  message: string;
}

interface RebalanceRecommendation {
  productId: string;
  productName: string;
  sku: string | null;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
  reason: string;
}

interface EchelonAlerts {
  summary: { critical: number; warning: number; info: number };
  alerts: EchelonAlert[];
  recommendations: RebalanceRecommendation[];
}

interface ScheduleConfig {
  enabled: boolean;
  frequency: string;
  minServiceLevel: number;
  maxImbalancePct: number;
}

// ============================================================
// Helpers
// ============================================================

const LOOKBACK_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
];

function getImbalanceColor(score: number) {
  if (score > 30) return 'text-red-500';
  if (score >= 15) return 'text-amber-500';
  return 'text-green-500';
}

function getImbalanceBg(score: number) {
  if (score > 30) return 'bg-red-500/10 border-red-500/20';
  if (score >= 15) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-green-500/10 border-green-500/20';
}

function getUtilizationColor(pct: number) {
  if (pct >= 90) return 'text-red-500';
  if (pct >= 70) return 'text-amber-500';
  return 'text-green-500';
}

function formatCurrency(value: number) {
  return `\u20B9${value.toLocaleString()}`;
}

function getAlertIcon(type: EchelonAlert['type']) {
  switch (type) {
    case 'low_stock': return AlertTriangle;
    case 'overstock': return Package;
    case 'imbalance': return ArrowUpDown;
  }
}

function getAlertColors(severity: EchelonAlert['severity']) {
  switch (severity) {
    case 'critical': return { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-500' };
    case 'warning': return { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-500' };
    case 'info': return { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-500' };
  }
}

// ============================================================
// Main Page
// ============================================================

export default function MultiEchelonPage() {
  const [data, setData] = useState<EchelonDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lookbackDays, setLookbackDays] = useState('90');
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  // Alerts state
  const [alertsData, setAlertsData] = useState<EchelonAlerts | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    enabled: false,
    frequency: 'weekly',
    minServiceLevel: 50,
    maxImbalancePct: 30,
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const fetchData = useCallback(async (days: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/multi-echelon?lookbackDays=${days}`);
      if (!res.ok) throw new Error('Failed to fetch multi-echelon data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch multi-echelon data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await fetch('/api/analytics/multi-echelon?mode=alerts');
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const json = await res.json();
      setAlertsData(json);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const res = await fetch('/api/analytics/multi-echelon/schedule');
      if (!res.ok) throw new Error('Failed to fetch schedule');
      const json = await res.json();
      setSchedule(json);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  const saveSchedule = async () => {
    setScheduleSaving(true);
    setScheduleSaved(false);
    try {
      const res = await fetch('/api/analytics/multi-echelon/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error('Failed to save schedule');
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save schedule:', err);
    } finally {
      setScheduleSaving(false);
    }
  };

  useEffect(() => {
    fetchData(lookbackDays);
  }, [lookbackDays, fetchData]);

  const handleTabChange = (tab: string) => {
    if (tab === 'alerts' && !alertsData) fetchAlerts();
    if (tab === 'schedule' && !scheduleLoading) fetchSchedule();
  };

  const summary = data?.summary;

  const statCards = [
    {
      label: 'Total Locations',
      value: summary?.totalLocations ?? 0,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'SKUs Analyzed',
      value: summary?.totalSkusAnalyzed ?? 0,
      icon: Package,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Imbalanced SKUs',
      value: summary?.imbalancedSkus ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Avg Network Imbalance',
      value: summary?.avgNetworkImbalance ?? 0,
      icon: ArrowUpDown,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      format: (v: number) => `${v}%`,
    },
    {
      label: 'Recommended Moves',
      value: summary?.totalRecommendedMoves ?? 0,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Potential Savings',
      value: summary?.potentialSavings ?? 0,
      icon: IndianRupee,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      format: (v: number) => formatCurrency(v),
    },
  ];

  // Error state
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchData(lookbackDays)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10">
            <Layers className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Multi-Echelon Optimization
            </h1>
            <p className="text-sm text-muted-foreground">
              Optimize inventory distribution across your warehouse network
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={lookbackDays} onValueChange={setLookbackDays}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Lookback" />
            </SelectTrigger>
            <SelectContent>
              {LOOKBACK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(lookbackDays)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Layers className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading multi-echelon analysis...</p>
        </div>
      ) : (
        <Tabs defaultValue="dashboard" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* ============ DASHBOARD TAB ============ */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {statCards.map((card) => (
                <Card key={card.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                          {card.label}
                        </p>
                        <p
                          className={`text-2xl font-black mt-1 ${loading ? 'animate-pulse' : ''}`}
                        >
                          {loading ? '...' : card.format(card.value)}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Network Health Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Network Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {(data?.networkHealth.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Building2 className="w-8 h-8 opacity-50" />
                    <p>No locations to analyze.</p>
                    <p className="text-xs">
                      Network health requires at least 2 active locations.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Over-stocked</TableHead>
                          <TableHead className="text-right">Under-stocked</TableHead>
                          <TableHead className="text-right">Balanced</TableHead>
                          <TableHead className="text-right">Utilization %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.networkHealth.map((loc) => (
                          <TableRow key={loc.locationId}>
                            <TableCell className="font-medium">{loc.locationName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">
                                {loc.type.toLowerCase().replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {loc.overStocked > 0 ? (
                                <span className="text-red-500 font-medium">
                                  {loc.overStocked}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {loc.underStocked > 0 ? (
                                <span className="text-amber-500 font-medium">
                                  {loc.underStocked}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-green-500 font-medium">
                                {loc.balanced}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-medium ${getUtilizationColor(loc.utilizationPct)}`}
                              >
                                {loc.utilizationPct}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SKU Analysis Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  SKU Analysis
                  {data && data.skuAnalysis.length > 0 && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      (Top {data.skuAnalysis.length} imbalanced)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {(data?.skuAnalysis.length ?? 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Package className="w-8 h-8 opacity-50" />
                    <p>No SKU data available.</p>
                    <p className="text-xs">
                      SKU analysis requires products stocked across multiple locations.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8" />
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Total Stock</TableHead>
                          <TableHead className="text-right">Total Demand</TableHead>
                          <TableHead className="text-right">Network Imbalance</TableHead>
                          <TableHead>Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.skuAnalysis.map((sku) => (
                          <React.Fragment key={sku.productId}>
                            <TableRow
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() =>
                                setExpandedSku(
                                  expandedSku === sku.productId ? null : sku.productId
                                )
                              }
                            >
                              <TableCell className="w-8">
                                {expandedSku === sku.productId ? (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{sku.productName}</p>
                                  {sku.sku && (
                                    <p className="text-xs text-muted-foreground">
                                      {sku.sku}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {sku.totalStock.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {sku.totalDemand.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant="outline"
                                  className={`${getImbalanceBg(sku.networkImbalance)} ${getImbalanceColor(sku.networkImbalance)}`}
                                >
                                  {sku.networkImbalance}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <p className="text-xs text-muted-foreground max-w-[300px] truncate">
                                  {sku.recommendation}
                                </p>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Per-Location Breakdown */}
                            {expandedSku === sku.productId && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/30 p-4">
                                  <div className="space-y-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                      Per-Location Breakdown
                                    </p>
                                    <div className="grid gap-2">
                                      {sku.locations.map((loc) => (
                                        <div
                                          key={loc.locationId}
                                          className="flex items-center gap-4 p-3 rounded-lg bg-background"
                                        >
                                          <div className="flex-1 min-w-[120px]">
                                            <p className="text-sm font-medium">
                                              {loc.locationName}
                                            </p>
                                          </div>
                                          <div className="text-right min-w-[80px]">
                                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                              Current
                                            </p>
                                            <p className="text-sm font-medium">
                                              {loc.currentStock.toLocaleString()}
                                            </p>
                                          </div>
                                          <div className="text-right min-w-[80px]">
                                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                              Optimal
                                            </p>
                                            <p className="text-sm font-medium">
                                              {loc.optimalStock.toLocaleString()}
                                            </p>
                                          </div>
                                          <div className="text-right min-w-[70px]">
                                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                              Delta
                                            </p>
                                            <div className="flex items-center justify-end gap-1">
                                              {loc.delta > 0 ? (
                                                <span className="text-amber-500 text-sm font-medium flex items-center gap-0.5">
                                                  <ArrowUp className="w-3 h-3" />
                                                  +{loc.delta.toLocaleString()}
                                                </span>
                                              ) : loc.delta < 0 ? (
                                                <span className="text-red-500 text-sm font-medium flex items-center gap-0.5">
                                                  <ArrowDown className="w-3 h-3" />
                                                  {loc.delta.toLocaleString()}
                                                </span>
                                              ) : (
                                                <span className="text-muted-foreground text-sm flex items-center gap-0.5">
                                                  <Minus className="w-3 h-3" />0
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right min-w-[80px]">
                                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                              Days of Supply
                                            </p>
                                            <p className="text-sm font-medium">
                                              {loc.daysOfSupply === 999
                                                ? 'N/A'
                                                : `${loc.daysOfSupply}d`}
                                            </p>
                                          </div>
                                          <div className="text-right min-w-[80px]">
                                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                              Service Level
                                            </p>
                                            <p
                                              className={`text-sm font-medium ${
                                                loc.serviceLevel >= 95
                                                  ? 'text-green-500'
                                                  : loc.serviceLevel >= 80
                                                    ? 'text-amber-500'
                                                    : 'text-red-500'
                                              }`}
                                            >
                                              {loc.serviceLevel}%
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ ALERTS TAB ============ */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            {alertsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Analyzing inventory alerts...</p>
              </div>
            ) : alertsData ? (
              <>
                {/* Alert Summary Bar */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-red-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                            Critical
                          </p>
                          <p className="text-2xl font-black mt-1 text-red-500">
                            {alertsData.summary.critical}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-red-500/10">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                            Warning
                          </p>
                          <p className="text-2xl font-black mt-1 text-amber-500">
                            {alertsData.summary.warning}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-500/10">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-500/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                            Info
                          </p>
                          <p className="text-2xl font-black mt-1 text-blue-500">
                            {alertsData.summary.info}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                          <Info className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alerts List */}
                {alertsData.alerts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Bell className="w-8 h-8 opacity-50" />
                        <p className="font-medium">No alerts</p>
                        <p className="text-xs">All inventory levels are within optimal range.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {alertsData.alerts.map((alert) => {
                      const AlertIcon = getAlertIcon(alert.type);
                      const colors = getAlertColors(alert.severity);
                      return (
                        <Card key={alert.id} className={`${colors.border}`}>
                          <CardContent className="py-4">
                            <div className="flex items-start gap-4">
                              <div className={`p-2 rounded-xl ${colors.bg} shrink-0 mt-0.5`}>
                                <AlertIcon className={`w-4 h-4 ${colors.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] uppercase ${colors.bg} ${colors.text} border-0`}
                                  >
                                    {alert.severity}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {alert.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium">{alert.productName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {alert.message}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                                  Current / Optimal
                                </p>
                                <p className="text-sm font-medium">
                                  {alert.currentValue.toLocaleString()} / {alert.optimalValue.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Rebalancing Recommendations */}
                {alertsData.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                        Rebalancing Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>From</TableHead>
                              <TableHead>To</TableHead>
                              <TableHead className="text-right">Quantity</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead className="w-[100px]" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alertsData.recommendations.map((rec, idx) => (
                              <TableRow key={`rec-${idx}`}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{rec.productName}</p>
                                    {rec.sku && (
                                      <p className="text-xs text-muted-foreground">{rec.sku}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-red-500 font-medium">
                                  {rec.fromLocationName}
                                </TableCell>
                                <TableCell className="text-green-500 font-medium">
                                  {rec.toLocationName}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {rec.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <p className="text-xs text-muted-foreground max-w-[250px] truncate">
                                    {rec.reason}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      window.open('/transshipments', '_blank')
                                    }
                                  >
                                    Create Transfer
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </TabsContent>

          {/* ============ SCHEDULE TAB ============ */}
          <TabsContent value="schedule" className="space-y-6 mt-6">
            {scheduleLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Loading schedule configuration...</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Rebalancing Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Enable Scheduled Alerts</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Automatically analyze network imbalance and send alerts
                      </p>
                    </div>
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) =>
                        setSchedule((s) => ({ ...s, enabled: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label className="font-medium">Frequency</Label>
                    <Select
                      value={schedule.frequency}
                      onValueChange={(v) =>
                        setSchedule((s) => ({ ...s, frequency: v }))
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How often to run the echelon analysis and generate alerts
                    </p>
                  </div>

                  <Separator />

                  {/* Thresholds */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-medium">
                        Min Service Level to Trigger Alert (%)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={schedule.minServiceLevel}
                        onChange={(e) =>
                          setSchedule((s) => ({
                            ...s,
                            minServiceLevel: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Locations with service level below this threshold will trigger alerts
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">
                        Max Imbalance Before Alert (%)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={schedule.maxImbalancePct}
                        onChange={(e) =>
                          setSchedule((s) => ({
                            ...s,
                            maxImbalancePct: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        SKUs with network imbalance above this will trigger alerts
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Save */}
                  <div className="flex items-center gap-3">
                    <Button onClick={saveSchedule} disabled={scheduleSaving}>
                      {scheduleSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {scheduleSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                    {scheduleSaved && (
                      <span className="text-sm text-green-500 font-medium">
                        Saved successfully
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
