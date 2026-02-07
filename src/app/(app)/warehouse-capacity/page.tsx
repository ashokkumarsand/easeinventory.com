'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Warehouse,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowDown,
  Settings2,
  Package,
  MapPin,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

// ============================================================
// Types
// ============================================================

interface LocationCapacity {
  id: string;
  name: string;
  code: string | null;
  type: string;
  city: string | null;
  capacity: number | null;
  currentLoad: number;
  unitUtilization: number;
  maxWeightKg: number | null;
  maxVolumeCbm: number | null;
  uniqueSkus: number;
  totalUnits: number;
  stockValue: number;
  alertLevel: string;
}

interface CapacitySummary {
  totalLocations: number;
  totalCapacity: number;
  totalCurrentLoad: number;
  overallUtilization: number;
  criticalCount: number;
  warningCount: number;
  underutilizedCount: number;
  totalStockValue: number;
}

// ============================================================
// Helpers
// ============================================================

function alertColor(level: string) {
  switch (level) {
    case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'LOW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default: return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
}

function progressColor(util: number) {
  if (util >= 95) return 'bg-red-500';
  if (util >= 80) return 'bg-amber-500';
  if (util <= 20) return 'bg-blue-400';
  return 'bg-green-500';
}

function barColor(util: number) {
  if (util >= 95) return '#ef4444';
  if (util >= 80) return '#f59e0b';
  if (util <= 20) return '#60a5fa';
  return '#22c55e';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// ============================================================
// Configure Dialog
// ============================================================

function ConfigDialog({
  location,
  open,
  onClose,
  onSave,
}: {
  location: LocationCapacity | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [capacity, setCapacity] = useState<string>('');
  const [maxWeight, setMaxWeight] = useState<string>('');
  const [maxVolume, setMaxVolume] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location) {
      setCapacity(location.capacity?.toString() ?? '');
      setMaxWeight(location.maxWeightKg?.toString() ?? '');
      setMaxVolume(location.maxVolumeCbm?.toString() ?? '');
    }
  }, [location]);

  const handleSave = async () => {
    if (!location) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/warehouse-capacity/${location.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capacity: capacity ? parseInt(capacity) : null,
          maxWeightKg: maxWeight ? parseFloat(maxWeight) : null,
          maxVolumeCbm: maxVolume ? parseFloat(maxVolume) : null,
        }),
      });
      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (err) {
      console.error('Failed to update capacity:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Capacity — {location?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Max Units</Label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 10000" />
          </div>
          <div className="space-y-2">
            <Label>Max Weight (kg)</Label>
            <Input type="number" step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} placeholder="e.g. 5000" />
          </div>
          <div className="space-y-2">
            <Label>Max Volume (m³)</Label>
            <Input type="number" step="0.01" value={maxVolume} onChange={(e) => setMaxVolume(e.target.value)} placeholder="e.g. 250" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function WarehouseCapacityPage() {
  const [summary, setSummary] = useState<CapacitySummary | null>(null);
  const [locations, setLocations] = useState<LocationCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configLoc, setConfigLoc] = useState<LocationCapacity | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/warehouse-capacity');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setLocations(data.locations);
      }
    } catch (err) {
      console.error('Failed to fetch capacity data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = locations
    .filter((l) => l.capacity && l.capacity > 0)
    .map((l) => ({
      name: l.name.length > 15 ? l.name.slice(0, 15) + '...' : l.name,
      utilization: l.unitUtilization,
      fill: barColor(l.unitUtilization),
    }));

  const statCards = [
    { label: 'Overall Utilization', value: summary ? `${summary.overallUtilization}%` : '—', icon: Warehouse, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Critical', value: summary?.criticalCount?.toString() ?? '—', icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { label: 'Warnings', value: summary?.warningCount?.toString() ?? '—', icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { label: 'Underutilized', value: summary?.underutilizedCount?.toString() ?? '—', icon: ArrowDown, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Warehouse className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Warehouse Capacity</h1>
            <p className="text-sm text-muted-foreground">Monitor utilization across all locations</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : card.value}
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

      {/* Utilization Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilization by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${Number(value)}%`, 'Utilization']}
                />
                <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <MapPin className="w-8 h-8 opacity-50" />
              <p>No locations found. Create locations in inventory settings.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">SKUs</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="w-40">Utilization</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{loc.name}</p>
                          {loc.code && <p className="text-xs text-muted-foreground">{loc.code}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{loc.type}</TableCell>
                      <TableCell className="text-right">{loc.uniqueSkus}</TableCell>
                      <TableCell className="text-right">{loc.totalUnits.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {loc.capacity ? loc.capacity.toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        {loc.capacity ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${progressColor(loc.unitUtilization)}`}
                                style={{ width: `${Math.min(loc.unitUtilization, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs w-10 text-right">{loc.unitUtilization}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={alertColor(loc.alertLevel)}>
                          {loc.alertLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(loc.stockValue)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => setConfigLoc(loc)}>
                          <Settings2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfigDialog
        location={configLoc}
        open={configLoc !== null}
        onClose={() => setConfigLoc(null)}
        onSave={fetchData}
      />
    </div>
  );
}
