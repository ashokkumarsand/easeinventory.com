'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  ArrowRightLeft,
  ArrowRight,
  Zap,
  Package,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface Suggestion {
  productId: string;
  productName: string;
  sku: string | null;
  sourceLocationId: string;
  sourceLocationName: string;
  sourceQty: number;
  destLocationId: string;
  destLocationName: string;
  destQty: number;
  suggestedQty: number;
  reason: string;
}

interface TransferItem {
  id: string;
  product: { name: string; sku: string | null };
  quantity: number;
}

interface Transfer {
  id: string;
  transferNumber: string;
  sourceLocation: { name: string };
  destLocation: { name: string };
  status: string;
  isEmergency: boolean;
  priority: string;
  reason: string | null;
  notes: string | null;
  items: TransferItem[];
  createdAt: string;
}

// ============================================================
// Helpers
// ============================================================

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  APPROVED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  IN_TRANSIT: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-500',
  NORMAL: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
};

// ============================================================
// Main Page
// ============================================================

export default function TransshipmentsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sugRes, listRes] = await Promise.all([
        fetch('/api/transshipments?mode=suggestions'),
        fetch('/api/transshipments'),
      ]);
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        setSuggestions(sugData.suggestions);
      }
      if (listRes.ok) {
        const listData = await listRes.json();
        setTransfers(listData.transfers);
        setTotal(listData.total);
      }
    } catch (err) {
      console.error('Failed to fetch transshipment data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateFromSuggestion = async (s: Suggestion) => {
    setCreating(s.productId + s.sourceLocationId);
    try {
      const res = await fetch('/api/transshipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLocationId: s.sourceLocationId,
          destLocationId: s.destLocationId,
          items: [{ productId: s.productId, quantity: s.suggestedQty }],
          reason: s.reason,
          isEmergency: true,
          priority: 'HIGH',
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create transshipment:', err);
    } finally {
      setCreating(null);
    }
  };

  const handleAction = async (transferId: string, action: 'approve' | 'reject') => {
    setActing(transferId);
    try {
      const res = await fetch(`/api/transshipments/${transferId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setActing(null);
    }
  };

  const pendingCount = transfers.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10">
            <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">
              Lateral Transshipment
            </h1>
            <p className="text-sm text-muted-foreground">
              Emergency stock transfers between locations
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suggestions</p>
                <p className="text-2xl font-bold mt-1">
                  {isLoading ? '...' : suggestions.length}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold mt-1">
                  {isLoading ? '...' : pendingCount}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-500/10">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
                <p className="text-2xl font-bold mt-1">
                  {isLoading ? '...' : total}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold mt-1">
                  {isLoading
                    ? '...'
                    : new Set([
                        ...suggestions.map((s) => s.sourceLocationId),
                        ...suggestions.map((s) => s.destLocationId),
                      ]).size}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suggestions">
        <TabsList>
          <TabsTrigger value="suggestions">
            Suggestions ({suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="transfers">
            Transfers ({total})
          </TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recommended Transshipments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  Loading...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <ArrowRightLeft className="w-8 h-8 opacity-50" />
                  <p>No transshipment suggestions.</p>
                  <p className="text-xs">
                    Suggestions appear when stock is imbalanced across locations.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead />
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suggestions.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{s.productName}</p>
                              {s.sku && (
                                <p className="text-xs text-muted-foreground">
                                  {s.sku}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {s.sourceLocationName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {s.sourceQty} units
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {s.destLocationName}
                              </p>
                              <p className="text-xs text-red-500">
                                {s.destQty} units
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {s.suggestedQty}
                          </TableCell>
                          <TableCell>
                            <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {s.reason}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleCreateFromSuggestion(s)}
                              disabled={creating === s.productId + s.sourceLocationId}
                            >
                              {creating === s.productId + s.sourceLocationId
                                ? 'Creating...'
                                : 'Create Transfer'}
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
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transfer History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  Loading...
                </div>
              ) : transfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <ArrowRightLeft className="w-8 h-8 opacity-50" />
                  <p>No transfers yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transfer #</TableHead>
                        <TableHead>From → To</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t.transferNumber}</span>
                              {t.isEmergency && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-red-500 border-red-500/20"
                                >
                                  Emergency
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {t.sourceLocation.name}
                              {' → '}
                              {t.destLocation.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {t.items.map((item) => (
                                <div key={item.id}>
                                  {item.product.name} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs font-medium ${PRIORITY_COLORS[t.priority] ?? ''}`}
                            >
                              {t.priority}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${STATUS_COLORS[t.status] ?? ''}`}
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {t.status === 'PENDING' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-green-600"
                                  onClick={() => handleAction(t.id, 'approve')}
                                  disabled={acting === t.id}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-red-500"
                                  onClick={() => handleAction(t.id, 'reject')}
                                  disabled={acting === t.id}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
