'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Package,
  Puzzle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  ACTIVE: 'default',
  ARCHIVED: 'destructive',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

export default function BOMDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bomId = params.id as string;

  const [bom, setBom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Availability check
  const [checkQty, setCheckQty] = useState(1);
  const [locationId, setLocationId] = useState('');
  const [availability, setAvailability] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Quick assembly
  const [assemblyQty, setAssemblyQty] = useState(1);
  const [assemblyType, setAssemblyType] = useState<'ASSEMBLY' | 'DISASSEMBLY'>('ASSEMBLY');
  const [assemblyNotes, setAssemblyNotes] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Locations
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetchBOM();
    fetchLocations();
  }, [bomId]);

  const fetchBOM = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bom/${bomId}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setBom(data);
    } catch (err) {
      console.error('Failed to fetch BOM:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/inventory/locations');
      const data = await res.json();
      setLocations(data.locations || []);
    } catch {}
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      if (newStatus === 'ARCHIVED') {
        const res = await fetch(`/api/bom/${bomId}`, { method: 'DELETE' });
        if (!res.ok) {
          const err = await res.json();
          alert(err.message || 'Failed to archive');
          return;
        }
      } else {
        const res = await fetch(`/api/bom/${bomId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.message || 'Failed to update');
          return;
        }
      }
      fetchBOM();
    } finally {
      setIsUpdating(false);
    }
  };

  const checkAvailability = async () => {
    setIsChecking(true);
    try {
      const params = new URLSearchParams({ quantity: checkQty.toString() });
      if (locationId) params.set('locationId', locationId);
      const res = await fetch(`/api/bom/${bomId}/availability?${params.toString()}`);
      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error('Availability check failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  const createAssemblyOrder = async () => {
    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/assembly-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bomId,
          type: assemblyType,
          quantity: assemblyQty,
          locationId: locationId || undefined,
          notes: assemblyNotes || undefined,
        }),
      });
      if (res.ok) {
        setAssemblyNotes('');
        fetchBOM();
        alert('Assembly order created successfully');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create order');
      }
    } catch {
      alert('Failed to create assembly order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getComponentCost = (): number => {
    if (!bom?.items) return 0;
    return bom.items.reduce((sum: number, item: any) => {
      return sum + Number(item.quantity) * Number(item.componentProduct?.costPrice || 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!bom) {
    return (
      <div className="p-6 text-center">
        <p className="text-foreground/50">BOM not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/bom')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Puzzle className="w-8 h-8" />
              {bom.bomNumber}
            </h1>
            <p className="text-foreground/50 mt-1">
              {bom.product?.name} &middot; Version {bom.version}
              {bom.name && ` \u2014 ${bom.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={(STATUS_COLORS[bom.status] || 'outline') as any}>
            {bom.status}
          </Badge>
          {bom.status === 'DRAFT' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={isUpdating}
            >
              Activate
            </Button>
          )}
          {bom.status === 'ACTIVE' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusChange('ARCHIVED')}
              disabled={isUpdating}
            >
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* BOM Details */}
      {bom.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-foreground/70">{bom.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Components Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Components ({bom.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-foreground/60">
                  <th className="text-left py-2 pr-4">Component</th>
                  <th className="text-left py-2 pr-4">SKU</th>
                  <th className="text-right py-2 pr-4">Qty per Kit</th>
                  <th className="text-right py-2 pr-4">Wastage %</th>
                  <th className="text-right py-2 pr-4">Unit Cost</th>
                  <th className="text-right py-2 pr-4">Line Cost</th>
                  <th className="text-right py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {bom.items?.map((item: any) => {
                  const lineCost =
                    Number(item.quantity) *
                    Number(item.componentProduct?.costPrice || 0) *
                    (1 + Number(item.wastagePercent) / 100);
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">
                        {item.componentProduct?.name}
                      </td>
                      <td className="py-2 pr-4 text-foreground/70">
                        {item.componentProduct?.sku || '\u2014'}
                      </td>
                      <td className="py-2 pr-4 text-right">{Number(item.quantity)}</td>
                      <td className="py-2 pr-4 text-right">{Number(item.wastagePercent)}%</td>
                      <td className="py-2 pr-4 text-right">
                        {'\u20B9'}{Number(item.componentProduct?.costPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 pr-4 text-right font-medium">
                        {'\u20B9'}{lineCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-right">
                        {item.componentProduct?.quantity ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={5} className="py-2 pr-4 text-right">
                    Total Kit Cost
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {'\u20B9'}{getComponentCost().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Availability Check */}
      {bom.status === 'ACTIVE' && (
        <Card>
          <CardHeader>
            <CardTitle>Check Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Quantity
                </label>
                <Input
                  type="number"
                  min={1}
                  value={checkQty}
                  onChange={(e) => setCheckQty(parseInt(e.target.value) || 1)}
                  className="w-28"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Location (optional)
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">All locations</option>
                  {locations.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.code ? `(${loc.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={checkAvailability} disabled={isChecking}>
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Check
              </Button>
            </div>

            {availability && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {availability.canAssemble ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Can Assemble
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Insufficient Stock
                    </Badge>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-foreground/60">
                        <th className="text-left py-2 pr-4">Component</th>
                        <th className="text-right py-2 pr-4">Required</th>
                        <th className="text-right py-2 pr-4">Available</th>
                        <th className="text-right py-2 pr-4">Shortfall</th>
                        <th className="text-right py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availability.components?.map((comp: any) => (
                        <tr key={comp.componentProductId} className="border-b">
                          <td className="py-2 pr-4">
                            {comp.productName}
                            {comp.sku && (
                              <span className="text-foreground/50 text-xs ml-1">
                                ({comp.sku})
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-4 text-right">{comp.requiredQty}</td>
                          <td className="py-2 pr-4 text-right">{comp.availableQty}</td>
                          <td className="py-2 pr-4 text-right text-destructive">
                            {comp.shortfall > 0 ? comp.shortfall : '\u2014'}
                          </td>
                          <td className="py-2 text-right">
                            {comp.sufficient ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 inline" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive inline" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Assembly Order */}
      {bom.status === 'ACTIVE' && (
        <Card>
          <CardHeader>
            <CardTitle>Create Assembly Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Type
                </label>
                <select
                  value={assemblyType}
                  onChange={(e) => setAssemblyType(e.target.value as any)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="ASSEMBLY">Assembly</option>
                  <option value="DISASSEMBLY">Disassembly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Quantity
                </label>
                <Input
                  type="number"
                  min={1}
                  value={assemblyQty}
                  onChange={(e) => setAssemblyQty(parseInt(e.target.value) || 1)}
                  className="w-28"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Location (optional)
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">No location</option>
                  {locations.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.code ? `(${loc.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">
                  Notes (optional)
                </label>
                <Input
                  placeholder="Assembly notes..."
                  value={assemblyNotes}
                  onChange={(e) => setAssemblyNotes(e.target.value)}
                />
              </div>
              <Button onClick={createAssemblyOrder} disabled={isCreatingOrder}>
                {isCreatingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Assembly Orders */}
      {bom.assemblyOrders && bom.assemblyOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Assembly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-foreground/60">
                    <th className="text-left py-2 pr-4">Order #</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-right py-2 pr-4">Qty</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.assemblyOrders.map((order: any) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2 pr-4">
                        <Link
                          href={`/bom/assembly`}
                          className="text-primary hover:underline"
                        >
                          {order.assemblyNumber}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={order.type === 'ASSEMBLY' ? 'default' : 'secondary'}>
                          {order.type}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-right">{order.quantity}</td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant={
                            (ORDER_STATUS_COLORS[order.status] || 'outline') as any
                          }
                        >
                          {order.status?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-2 text-foreground/60">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
