'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RotateCcw,
  Package,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  ChevronUp,
  Factory,
  TrendingUp,
  Boxes,
  Recycle,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface RemanufacturingOrder {
  id: string;
  orderNumber?: string;
  sourceProductId: string;
  sourceProductName?: string;
  outputProductId: string;
  outputProductName?: string;
  status: string;
  inputQuantity: number;
  outputQuantity: number;
  scrapQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrdersSummary {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  avgYield: number;
  totalInputUnits: number;
  totalOutputUnits: number;
  totalScrap: number;
}

interface YieldByProduct {
  productName: string;
  totalInput: number;
  totalOutput: number;
  yield: number;
  ordersCount: number;
}

// ============================================================
// Constants
// ============================================================

const STATUS_FLOW = ['PENDING', 'DISASSEMBLY', 'INSPECTION', 'REASSEMBLY', 'COMPLETED'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
  DISASSEMBLY: {
    label: 'Disassembly',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  INSPECTION: {
    label: 'Inspection',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  REASSEMBLY: {
    label: 'Reassembly',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getNextStatus(current: string): string | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

// ============================================================
// Main Page
// ============================================================

export default function RemanufacturingPage() {
  const [orders, setOrders] = useState<RemanufacturingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [formSourceProductId, setFormSourceProductId] = useState('');
  const [formOutputProductId, setFormOutputProductId] = useState('');
  const [formInputQuantity, setFormInputQuantity] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // ----------------------------------------------------------
  // Fetch orders
  // ----------------------------------------------------------
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/remanufacturing/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? data ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch remanufacturing orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ----------------------------------------------------------
  // Summary computation
  // ----------------------------------------------------------
  const summary: OrdersSummary = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(
      (o) => !['COMPLETED', 'CANCELLED'].includes(o.status)
    ).length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
    const totalInputUnits = orders.reduce((s, o) => s + (o.inputQuantity || 0), 0);
    const totalOutputUnits = orders.reduce((s, o) => s + (o.outputQuantity || 0), 0);
    const totalScrap = orders.reduce((s, o) => s + (o.scrapQuantity || 0), 0);
    const avgYield = totalInputUnits > 0 ? (totalOutputUnits / totalInputUnits) * 100 : 0;

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      avgYield,
      totalInputUnits,
      totalOutputUnits,
      totalScrap,
    };
  }, [orders]);

  // ----------------------------------------------------------
  // Yield by product
  // ----------------------------------------------------------
  const yieldByProduct: YieldByProduct[] = useMemo(() => {
    const map = new Map<
      string,
      { totalInput: number; totalOutput: number; count: number }
    >();

    for (const o of orders) {
      const name = o.outputProductName || o.outputProductId || 'Unknown';
      const entry = map.get(name) || { totalInput: 0, totalOutput: 0, count: 0 };
      entry.totalInput += o.inputQuantity || 0;
      entry.totalOutput += o.outputQuantity || 0;
      entry.count += 1;
      map.set(name, entry);
    }

    return Array.from(map.entries())
      .map(([productName, data]) => ({
        productName,
        totalInput: data.totalInput,
        totalOutput: data.totalOutput,
        yield: data.totalInput > 0 ? (data.totalOutput / data.totalInput) * 100 : 0,
        ordersCount: data.count,
      }))
      .sort((a, b) => b.ordersCount - a.ordersCount);
  }, [orders]);

  // ----------------------------------------------------------
  // Create order
  // ----------------------------------------------------------
  const handleCreate = async () => {
    if (!formSourceProductId || !formOutputProductId || !formInputQuantity) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/remanufacturing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceProductId: formSourceProductId,
          outputProductId: formOutputProductId,
          inputQuantity: Number(formInputQuantity),
          notes: formNotes || undefined,
        }),
      });
      if (res.ok) {
        setFormSourceProductId('');
        setFormOutputProductId('');
        setFormInputQuantity('');
        setFormNotes('');
        setShowCreateForm(false);
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to create remanufacturing order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // Advance status
  // ----------------------------------------------------------
  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/remanufacturing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          orderId,
          status: nextStatus,
        }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ----------------------------------------------------------
  // Summary stat cards config
  // ----------------------------------------------------------
  const statCards = [
    {
      label: 'TOTAL ORDERS',
      value: summary.totalOrders,
      icon: Package,
      color: 'text-foreground',
      bgColor: 'bg-foreground/5',
    },
    {
      label: 'ACTIVE',
      value: summary.activeOrders,
      icon: Factory,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'COMPLETED',
      value: summary.completedOrders,
      icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'AVG YIELD',
      value: `${summary.avgYield.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'INPUT UNITS',
      value: summary.totalInputUnits,
      icon: Boxes,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'OUTPUT UNITS',
      value: summary.totalOutputUnits,
      icon: Recycle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'TOTAL SCRAP',
      value: summary.totalScrap,
      icon: Trash2,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <RotateCcw className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Remanufacturing
            </h1>
            <p className="text-sm text-muted-foreground">
              Track disassembly, inspection, and reassembly of returned goods
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateForm((v) => !v)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  {card.label}
                </p>
                <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <p
                className={`text-xl font-black ${isLoading ? 'animate-pulse' : ''}`}
              >
                {isLoading ? '...' : card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Order Form (Collapsible) */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black">
                  Create Remanufacturing Order
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Source Product ID
                  </label>
                  <Input
                    placeholder="Source product ID..."
                    value={formSourceProductId}
                    onChange={(e) => setFormSourceProductId(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Output Product ID
                  </label>
                  <Input
                    placeholder="Output product ID..."
                    value={formOutputProductId}
                    onChange={(e) => setFormOutputProductId(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Input Quantity
                  </label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={formInputQuantity}
                    onChange={(e) => setFormInputQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Notes
                  </label>
                  <Textarea
                    placeholder="Optional notes..."
                    rows={1}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="min-h-[38px]"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleCreate}
                  disabled={
                    isSubmitting ||
                    !formSourceProductId ||
                    !formOutputProductId ||
                    !formInputQuantity
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Yield by Product */}
      {yieldByProduct.length > 0 && !isLoading && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black">
              Yield by Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {yieldByProduct.map((item) => {
              const yieldPct = Math.min(item.yield, 100);
              return (
                <div key={item.productName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[200px]">
                      {item.productName}
                    </span>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>In: {item.totalInput}</span>
                      <span>Out: {item.totalOutput}</span>
                      <span className="font-semibold text-foreground">
                        {item.yield.toFixed(1)}%
                      </span>
                      <span>{item.ordersCount} orders</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${yieldPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black">
            Remanufacturing Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <RotateCcw className="w-10 h-10 opacity-30" />
              <p className="text-sm">No remanufacturing orders yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Source Product</TableHead>
                    <TableHead>
                      <ArrowRight className="w-3 h-3 inline mr-1" />
                      Output Product
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Input Qty</TableHead>
                    <TableHead className="text-right">Output Qty</TableHead>
                    <TableHead className="text-right">Yield %</TableHead>
                    <TableHead className="text-right">Scrap</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const yieldPct =
                      order.inputQuantity > 0
                        ? ((order.outputQuantity / order.inputQuantity) * 100).toFixed(
                            1
                          )
                        : '0.0';
                    const nextStatus = getNextStatus(order.status);
                    const statusConf = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                    const isUpdating = updatingId === order.id;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.orderNumber || order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.sourceProductName || order.sourceProductId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.outputProductName || order.outputProductId}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={statusConf.bgColor}
                          >
                            {statusConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {order.inputQuantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {order.outputQuantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {yieldPct}%
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {order.scrapQuantity}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {nextStatus ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() =>
                                handleAdvanceStatus(order.id, nextStatus)
                              }
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5 mr-1" />
                                  {STATUS_CONFIG[nextStatus]?.label ?? nextStatus}
                                </>
                              )}
                            </Button>
                          ) : order.status === 'COMPLETED' ? (
                            <span className="text-xs text-green-500 font-medium flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Done
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              --
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
