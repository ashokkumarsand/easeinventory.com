'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Fingerprint,
  Package,
  AlertTriangle,
  ArrowRight,
  Search,
  Loader2,
  RotateCcw,
  Users,
  MapPin,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
  Calendar,
  Truck,
  ClipboardList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// Types
// ============================================================

interface LotSummary {
  totalActiveLots: number;
  lotsWithExpiry: number;
  nearExpiryLots: number;
  avgTraceDepth: number;
}

interface LotRow {
  id: string;
  lotNumber: string;
  productName: string;
  sku: string | null;
  initialQuantity: number;
  quantity: number;
  expiryDate: string | null;
  createdAt: string;
}

interface InboundSource {
  supplierName: string | null;
  grnNumber: string | null;
  receivedDate: string | null;
  poNumber: string | null;
  quantity: number;
}

interface OutboundDestination {
  customerName: string | null;
  orderNumber: string | null;
  quantity: number;
  date: string;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
  locationName: string | null;
}

interface TraceData {
  lot: LotRow;
  inbound: InboundSource | null;
  outbound: OutboundDestination[];
  movements: StockMovement[];
}

interface RecallData {
  lot: LotRow;
  affectedCustomersCount: number;
  affectedCustomers: { name: string; orderNumber: string; quantity: number; date: string }[];
  remainingStock: { locationName: string; quantity: number }[];
  totalShipped: number;
  totalInStock: number;
}

// ============================================================
// Helpers
// ============================================================

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isNearExpiry(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const now = new Date();
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= 30;
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const MOVEMENT_COLORS: Record<string, string> = {
  IN: 'bg-green-500/10 text-green-500 border-green-500/20',
  OUT: 'bg-red-500/10 text-red-500 border-red-500/20',
  ADJUSTMENT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  TRANSFER: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  RETURN: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

// ============================================================
// Main Page
// ============================================================

export default function LotGenealogyPage() {
  const [summary, setSummary] = useState<LotSummary | null>(null);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Trace mode
  const [traceData, setTraceData] = useState<TraceData | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [tracedLotId, setTracedLotId] = useState<string | null>(null);

  // Recall mode
  const [recallData, setRecallData] = useState<RecallData | null>(null);
  const [isRecalling, setIsRecalling] = useState(false);

  // View state
  const [view, setView] = useState<'dashboard' | 'trace' | 'recall'>('dashboard');

  // ---- Fetch dashboard ----
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/lot-genealogy');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary ?? null);
        setLots(data.lots ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch lot genealogy dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ---- Trace a lot ----
  const handleTrace = async (lotId: string) => {
    setIsTracing(true);
    setTracedLotId(lotId);
    setView('trace');
    setRecallData(null);
    try {
      const res = await fetch(
        `/api/analytics/lot-genealogy?mode=trace&lotId=${lotId}`,
      );
      if (res.ok) {
        setTraceData(await res.json());
      }
    } catch (err) {
      console.error('Failed to trace lot:', err);
    } finally {
      setIsTracing(false);
    }
  };

  // ---- Recall simulation ----
  const handleRecall = async (lotId: string) => {
    setIsRecalling(true);
    setView('recall');
    try {
      const res = await fetch(
        `/api/analytics/lot-genealogy?mode=recall&lotId=${lotId}`,
      );
      if (res.ok) {
        setRecallData(await res.json());
      }
    } catch (err) {
      console.error('Failed to simulate recall:', err);
    } finally {
      setIsRecalling(false);
    }
  };

  // ---- Back to dashboard ----
  const backToDashboard = () => {
    setView('dashboard');
    setTraceData(null);
    setRecallData(null);
    setTracedLotId(null);
  };

  // ---- Stat cards ----
  const statCards = [
    {
      label: 'Total Active Lots',
      value: summary?.totalActiveLots ?? 0,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Lots with Expiry',
      value: summary?.lotsWithExpiry ?? 0,
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Near-Expiry (30d)',
      value: summary?.nearExpiryLots ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Avg Trace Depth',
      value: summary?.avgTraceDepth ?? 0,
      icon: Fingerprint,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  // ===========================================================
  // RENDER
  // ===========================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'dashboard' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={backToDashboard}
              className="mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="p-2.5 rounded-xl bg-purple-500/10">
            <Fingerprint className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Lot Genealogy & Traceability
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'dashboard' &&
                'Track lots from source to destination with full traceability'}
              {view === 'trace' &&
                `Tracing lot ${traceData?.lot.lotNumber ?? tracedLotId ?? '...'}`}
              {view === 'recall' &&
                `Recall simulation for lot ${recallData?.lot.lotNumber ?? tracedLotId ?? '...'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === 'dashboard' && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ===== DASHBOARD VIEW ===== */}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            {card.label}
                          </p>
                          <p
                            className={`text-2xl font-bold mt-1 ${isLoading ? 'animate-pulse' : ''}`}
                          >
                            {isLoading ? '...' : card.value}
                          </p>
                        </div>
                        <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
                          <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Lots Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Recent Lots
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading lots...
                  </div>
                ) : lots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                    <Package className="w-8 h-8 opacity-50" />
                    <p>No lots found.</p>
                    <p className="text-xs">
                      Lots are created when goods are received or manufactured.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lot Number</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-right">Initial Qty</TableHead>
                          <TableHead className="text-right">Current Qty</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lots.map((lot) => (
                          <TableRow
                            key={lot.id}
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handleTrace(lot.id)}
                          >
                            <TableCell>
                              <span className="font-medium text-primary">
                                {lot.lotNumber}
                              </span>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{lot.productName}</p>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {lot.sku || '--'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {lot.initialQuantity}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {lot.quantity}
                            </TableCell>
                            <TableCell>
                              {lot.expiryDate ? (
                                <Badge
                                  variant="outline"
                                  className={
                                    isExpired(lot.expiryDate)
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                      : isNearExpiry(lot.expiryDate)
                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                                  }
                                >
                                  {formatDate(lot.expiryDate)}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  --
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(lot.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ===== TRACE VIEW ===== */}
        {view === 'trace' && (
          <motion.div
            key="trace"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {isTracing ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Tracing lot...
              </div>
            ) : traceData ? (
              <>
                {/* Lot Info Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Lot Number
                        </p>
                        <p className="text-2xl font-bold">
                          {traceData.lot.lotNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {traceData.lot.productName}
                          {traceData.lot.sku && ` (${traceData.lot.sku})`}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Initial Qty
                          </p>
                          <p className="text-xl font-bold mt-1">
                            {traceData.lot.initialQuantity}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Current Qty
                          </p>
                          <p className="text-xl font-bold mt-1">
                            {traceData.lot.quantity}
                          </p>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="h-10 mx-2"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRecall(traceData.lot.id)}
                          disabled={isRecalling}
                        >
                          <ShieldAlert className="w-4 h-4 mr-2" />
                          Simulate Recall
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Inbound Source */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-500" />
                        Inbound Source
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {traceData.inbound ? (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Supplier
                            </span>
                            <span className="font-medium">
                              {traceData.inbound.supplierName || '--'}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              GRN Number
                            </span>
                            <span className="font-medium">
                              {traceData.inbound.grnNumber || '--'}
                            </span>
                          </div>
                          <Separator />
                          {traceData.inbound.poNumber && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  PO Number
                                </span>
                                <span className="font-medium">
                                  {traceData.inbound.poNumber}
                                </span>
                              </div>
                              <Separator />
                            </>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Received Date
                            </span>
                            <span className="font-medium">
                              {formatDate(traceData.inbound.receivedDate)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Quantity
                            </span>
                            <span className="font-medium">
                              {traceData.inbound.quantity}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                          <Truck className="w-6 h-6 opacity-50" />
                          <p className="text-sm">
                            No inbound source linked to this lot.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Outbound Destinations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Outbound Destinations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {traceData.outbound.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 px-6">
                          <Users className="w-6 h-6 opacity-50" />
                          <p className="text-sm">
                            No outbound shipments from this lot yet.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Order #</TableHead>
                                <TableHead className="text-right">
                                  Qty
                                </TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {traceData.outbound.map((dest, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">
                                    {dest.customerName || '--'}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-primary">
                                      {dest.orderNumber || '--'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {dest.quantity}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {formatDate(dest.date)}
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

                {/* Stock Movements Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-500" />
                      Stock Movements Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {traceData.movements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                        <ClipboardList className="w-6 h-6 opacity-50" />
                        <p className="text-sm">
                          No stock movements recorded for this lot.
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
                        <div className="space-y-4">
                          {traceData.movements.map((mv, i) => (
                            <motion.div
                              key={mv.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex gap-4 items-start relative"
                            >
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 z-10">
                                <Package className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 p-3 rounded-lg bg-muted/40 border">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${MOVEMENT_COLORS[mv.type] ?? ''}`}
                                    >
                                      {mv.type}
                                    </Badge>
                                    <span className="font-medium text-sm">
                                      {mv.quantity > 0 ? '+' : ''}
                                      {mv.quantity} units
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(mv.createdAt)}
                                  </span>
                                </div>
                                {(mv.locationName || mv.notes) && (
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    {mv.locationName && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {mv.locationName}
                                      </span>
                                    )}
                                    {mv.notes && (
                                      <span className="truncate max-w-[300px]">
                                        {mv.notes}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
                <AlertTriangle className="w-8 h-8 opacity-50" />
                <p>Failed to load trace data. Please try again.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== RECALL VIEW ===== */}
        {view === 'recall' && (
          <motion.div
            key="recall"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {isRecalling ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Running recall simulation...
              </div>
            ) : recallData ? (
              <>
                {/* Recall Alert Banner */}
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-red-500/10">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-red-500">
                          Recall Simulation
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Lot{' '}
                          <span className="font-medium text-foreground">
                            {recallData.lot.lotNumber}
                          </span>{' '}
                          - {recallData.lot.productName}
                          {recallData.lot.sku && ` (${recallData.lot.sku})`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setView('trace');
                          setRecallData(null);
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Back to Trace
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recall Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Affected Customers
                            </p>
                            <p className="text-2xl font-bold mt-1">
                              {recallData.affectedCustomersCount}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-red-500/10">
                            <Users className="w-5 h-5 text-red-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Units Shipped
                            </p>
                            <p className="text-2xl font-bold mt-1">
                              {recallData.totalShipped}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-500/10">
                            <Truck className="w-5 h-5 text-amber-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Still In Stock
                            </p>
                            <p className="text-2xl font-bold mt-1">
                              {recallData.totalInStock}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-blue-500/10">
                            <Package className="w-5 h-5 text-blue-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Locations
                            </p>
                            <p className="text-2xl font-bold mt-1">
                              {recallData.remainingStock.length}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-green-500/10">
                            <MapPin className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Affected Customers List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        Affected Customers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {recallData.affectedCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 px-6">
                          <Users className="w-6 h-6 opacity-50" />
                          <p className="text-sm">
                            No customers received units from this lot.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Order #</TableHead>
                                <TableHead className="text-right">
                                  Qty
                                </TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {recallData.affectedCustomers.map((cust, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">
                                    {cust.name}
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-primary">
                                      {cust.orderNumber}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {cust.quantity}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {formatDate(cust.date)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Remaining Stock at Locations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Remaining Stock at Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recallData.remainingStock.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                          <MapPin className="w-6 h-6 opacity-50" />
                          <p className="text-sm">
                            No remaining stock at any location.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recallData.remainingStock.map((loc, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  {loc.locationName}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                              >
                                {loc.quantity} units
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
                <AlertTriangle className="w-8 h-8 opacity-50" />
                <p>Failed to load recall data. Please try again.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
