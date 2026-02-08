'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  Truck,
  Users,
  MapPin,
  Package,
  Clock,
  Star,
  Plus,
  Loader2,
  RefreshCw,
  Route,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================
// Types
// ============================================================

interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  capacity: number;
  status: string;
  assignedDriver: { id: string; name: string } | null;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: string;
  totalTrips: number;
  rating: number;
}

interface Trip {
  id: string;
  tripNumber: string;
  vehicle: { registrationNumber: string } | null;
  driver: { name: string } | null;
  status: string;
  stopsCount: number;
  createdAt: string;
}

interface FleetSummary {
  totalVehicles: number;
  availableVehicles: number;
  onTripVehicles: number;
  maintenanceVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  tripsToday: number;
  shipmentsThisMonth: number;
  avgDeliveryDays: number;
  onTimePercent: number;
}

// ============================================================
// Helpers
// ============================================================

const VEHICLE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-500/10 text-green-500 border-green-500/20',
  ON_TRIP: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  RETIRED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const DRIVER_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-500/10 text-green-500 border-green-500/20',
  ON_TRIP: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  OFF_DUTY: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  ON_LEAVE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

const TRIP_STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const VEHICLE_TYPES = ['BIKE', 'VAN', 'TRUCK', 'TEMPO'] as const;

const TABS = [
  { key: 'vehicles', label: 'Vehicles', icon: Truck },
  { key: 'drivers', label: 'Drivers', icon: Users },
  { key: 'trips', label: 'Trips', icon: Route },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
        />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star
          key={i}
          className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400"
        />
      );
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-muted-foreground/30" />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

// ============================================================
// Main Page
// ============================================================

export default function FleetManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('vehicles');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Add Vehicle form
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    type: 'VAN',
    capacity: '',
  });

  // Add Driver form
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fleet');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary ?? null);
        setVehicles(data.vehicles ?? []);
        setDrivers(data.drivers ?? []);
        setTrips(data.trips ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch fleet data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----------------------------------------------------------
  // Add Vehicle
  // ----------------------------------------------------------
  const handleAddVehicle = async () => {
    if (!vehicleForm.registrationNumber.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_vehicle',
          registrationNumber: vehicleForm.registrationNumber.trim(),
          type: vehicleForm.type,
          capacity: vehicleForm.capacity ? Number(vehicleForm.capacity) : 0,
        }),
      });
      if (res.ok) {
        setVehicleForm({ registrationNumber: '', type: 'VAN', capacity: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add vehicle:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // Add Driver
  // ----------------------------------------------------------
  const handleAddDriver = async () => {
    if (!driverForm.name.trim() || !driverForm.licenseNumber.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_driver',
          name: driverForm.name.trim(),
          phone: driverForm.phone.trim(),
          licenseNumber: driverForm.licenseNumber.trim(),
        }),
      });
      if (res.ok) {
        setDriverForm({ name: '', phone: '', licenseNumber: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add driver:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // Stat cards config
  // ----------------------------------------------------------
  const statCards = [
    {
      label: 'Total Vehicles',
      value: summary
        ? `${summary.totalVehicles}`
        : '--',
      sub: summary
        ? `${summary.availableVehicles} avail / ${summary.onTripVehicles} on-trip / ${summary.maintenanceVehicles} maint`
        : '',
      icon: Truck,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Drivers',
      value: summary
        ? `${summary.totalDrivers}`
        : '--',
      sub: summary ? `${summary.availableDrivers} available` : '',
      icon: Users,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Trips Today',
      value: summary?.tripsToday?.toString() ?? '--',
      sub: '',
      icon: MapPin,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Shipments This Month',
      value: summary?.shipmentsThisMonth?.toString() ?? '--',
      sub: '',
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Avg Delivery Days',
      value: summary ? `${summary.avgDeliveryDays}d` : '--',
      sub: '',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'On-Time %',
      value: summary ? `${summary.onTimePercent}%` : '--',
      sub: '',
      icon: CheckCircle2,
      color: summary && summary.onTimePercent >= 90 ? 'text-green-500' : 'text-amber-500',
      bgColor: summary && summary.onTimePercent >= 90 ? 'bg-green-500/10' : 'bg-amber-500/10',
    },
  ];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* ========== Header ========== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Fleet Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Vehicles, drivers, and delivery operations
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ========== Summary Cards ========== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                  <p className={`text-2xl font-black mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : card.value}
                  </p>
                  {card.sub && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {card.sub}
                    </p>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========== Tab Buttons ========== */}
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========== Vehicles Tab ========== */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          {/* Add Vehicle Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Registration Number
                  </label>
                  <Input
                    placeholder="e.g. DL01AB1234"
                    value={vehicleForm.registrationNumber}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })
                    }
                  />
                </div>
                <div className="w-full sm:w-40 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Type
                  </label>
                  <Select
                    value={vehicleForm.type}
                    onValueChange={(v) => setVehicleForm({ ...vehicleForm, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-32 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Capacity (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={vehicleForm.capacity}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, capacity: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={handleAddVehicle}
                  disabled={submitting || !vehicleForm.registrationNumber.trim()}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vehicles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Truck className="w-8 h-8 opacity-50" />
                  <p>No vehicles registered yet.</p>
                  <p className="text-xs">Use the form above to add your first vehicle.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Registration</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Capacity (kg)</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Assigned Driver</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">
                            {v.registrationNumber}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {v.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {v.capacity ? v.capacity.toLocaleString() : '--'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${VEHICLE_STATUS_COLORS[v.status] ?? ''}`}
                            >
                              {v.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {v.assignedDriver ? (
                              <span className="text-sm">{v.assignedDriver.name}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== Drivers Tab ========== */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          {/* Add Driver Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Name
                  </label>
                  <Input
                    placeholder="Full name"
                    value={driverForm.name}
                    onChange={(e) =>
                      setDriverForm({ ...driverForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Phone
                  </label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={driverForm.phone}
                    onChange={(e) =>
                      setDriverForm({ ...driverForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    License Number
                  </label>
                  <Input
                    placeholder="e.g. DL-0420110012345"
                    value={driverForm.licenseNumber}
                    onChange={(e) =>
                      setDriverForm({ ...driverForm, licenseNumber: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={handleAddDriver}
                  disabled={
                    submitting ||
                    !driverForm.name.trim() ||
                    !driverForm.licenseNumber.trim()
                  }
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Drivers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Drivers</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : drivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <Users className="w-8 h-8 opacity-50" />
                  <p>No drivers registered yet.</p>
                  <p className="text-xs">Use the form above to add your first driver.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Total Trips</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell className="text-sm">{d.phone || '--'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {d.licenseNumber}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${DRIVER_STATUS_COLORS[d.status] ?? ''}`}
                            >
                              {d.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {d.totalTrips}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1.5">
                              {renderStars(d.rating)}
                              <span className="text-xs text-muted-foreground ml-1">
                                {d.rating.toFixed(1)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== Trips Tab ========== */}
      {activeTab === 'trips' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Trips</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Route className="w-8 h-8 opacity-50" />
                <p>No trips recorded yet.</p>
                <p className="text-xs">
                  Trips are created when vehicles are dispatched for deliveries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trip ID</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Stops</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">
                          {trip.tripNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {trip.vehicle?.registrationNumber ?? '--'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {trip.driver?.name ?? '--'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs ${TRIP_STATUS_COLORS[trip.status] ?? ''}`}
                          >
                            {trip.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{trip.stopsCount}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== Delivery Stats (from real shipment data) ========== */}
      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-black tracking-tight">Delivery Stats</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Shipments This Month
                  </p>
                  <p className={`text-2xl font-black mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : summary?.shipmentsThisMonth ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Package className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Avg Delivery Days
                  </p>
                  <p className={`text-2xl font-black mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : summary ? `${summary.avgDeliveryDays}d` : '--'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    On-Time Delivery
                  </p>
                  <p className={`text-2xl font-black mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : summary ? `${summary.onTimePercent}%` : '--'}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-xl ${
                    summary && summary.onTimePercent >= 90
                      ? 'bg-green-500/10'
                      : 'bg-amber-500/10'
                  }`}
                >
                  {summary && summary.onTimePercent >= 90 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Trips Today
                  </p>
                  <p className={`text-2xl font-black mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                    {isLoading ? '...' : summary?.tripsToday ?? 0}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <MapPin className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
