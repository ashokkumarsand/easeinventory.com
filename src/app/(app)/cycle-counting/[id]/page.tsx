'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Package,
  Play,
  Save,
  ShieldCheck,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  VERIFIED: 'default',
  CANCELLED: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  VERIFIED: 'Verified',
  CANCELLED: 'Cancelled',
};

export default function CycleCountDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [cc, setCc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  // Local state for editable count quantities
  const [countValues, setCountValues] = useState<Record<string, string>>({});
  const [countNotes, setCountNotes] = useState<Record<string, string>>({});

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cycle-counts/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setCc(data);

      // Initialize count values from existing data
      const values: Record<string, string> = {};
      const notes: Record<string, string> = {};
      data.items?.forEach((item: any) => {
        if (item.countedQuantity !== null) {
          values[item.id] = String(item.countedQuantity);
        }
        if (item.notes) {
          notes[item.id] = item.notes;
        }
      });
      setCountValues(values);
      setCountNotes(notes);
    } catch (err) {
      setError('Failed to load cycle count');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const doAction = async (action: string, body?: any) => {
    setActionLoading(action);
    setError('');
    try {
      const res = await fetch(`/api/cycle-counts/${id}/${action}`, {
        method: action === 'items' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || `Failed to ${action}`);
        return;
      }
      await fetchDetail();
    } catch {
      setError(`Failed to ${action}`);
    } finally {
      setActionLoading('');
    }
  };

  const handleSaveCounts = () => {
    const items = Object.entries(countValues)
      .filter(([, val]) => val !== '')
      .map(([itemId, qty]) => ({
        itemId,
        countedQuantity: parseInt(qty, 10),
        notes: countNotes[itemId] || undefined,
      }));

    if (items.length === 0) {
      setError('Enter at least one count quantity');
      return;
    }

    doAction('items', { items });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!cc) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error || 'Cycle count not found'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const countedCount = cc.items?.filter((i: any) => i.countedQuantity !== null).length || 0;
  const totalCount = cc.items?.length || 0;
  const progress = totalCount > 0 ? Math.round((countedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cycle-counting')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{cc.ccNumber}</h1>
              <Badge variant={(STATUS_COLORS[cc.status] || 'outline') as any}>
                {STATUS_LABELS[cc.status] || cc.status}
              </Badge>
            </div>
            <p className="text-foreground/50 text-sm mt-0.5">
              {cc.location?.name} &middot; {cc.type?.replace(/_/g, ' ')}
              {cc.abcFilter && ` (Class ${cc.abcFilter})`}
              {cc.blindCount && ' &middot; Blind Count'}
            </p>
          </div>
        </div>

        {/* Action Buttons (contextual by status) */}
        <div className="flex gap-2 flex-wrap">
          {cc.status === 'DRAFT' && (
            <>
              <Button
                onClick={() => doAction('start')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'start' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Start Count
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Cancel this cycle count?')) doAction('cancel');
                }}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
            </>
          )}
          {cc.status === 'IN_PROGRESS' && (
            <>
              <Button onClick={handleSaveCounts} disabled={!!actionLoading}>
                {actionLoading === 'items' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Counts
              </Button>
              <Button
                variant="outline"
                onClick={() => doAction('complete')}
                disabled={!!actionLoading}
              >
                {actionLoading === 'complete' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Complete
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Cancel this cycle count?')) doAction('cancel');
                }}
                disabled={!!actionLoading}
              >
                Cancel
              </Button>
            </>
          )}
          {cc.status === 'COMPLETED' && (
            <Button onClick={() => doAction('verify')} disabled={!!actionLoading}>
              {actionLoading === 'verify' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Verify & Approve
            </Button>
          )}
          {cc.status === 'VERIFIED' && (
            <Button
              onClick={() => {
                if (confirm('Apply inventory adjustments? This will update stock levels.')) {
                  doAction('adjust');
                }
              }}
              disabled={!!actionLoading}
            >
              {actionLoading === 'adjust' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
              Apply Adjustments
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-sm text-foreground/50">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{countedCount}</div>
            <p className="text-sm text-foreground/50">Counted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${cc.varianceCount > 0 ? 'text-destructive' : ''}`}>
              {cc.varianceCount}
            </div>
            <p className="text-sm text-foreground/50">Variances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${Number(cc.varianceValue) > 0 ? 'text-destructive' : ''}`}>
              ₹{Number(cc.varianceValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-foreground/50">Variance Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar for in-progress */}
      {cc.status === 'IN_PROGRESS' && totalCount > 0 && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground/60">Count Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-foreground/10 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Location</span>
              <span className="font-medium">{cc.location?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Type</span>
              <span className="font-medium">{cc.type?.replace(/_/g, ' ')}</span>
            </div>
            {cc.abcFilter && (
              <div className="flex justify-between">
                <span className="text-foreground/60">ABC Filter</span>
                <span className="font-medium">Class {cc.abcFilter}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-foreground/60">Blind Count</span>
              <span className="font-medium">{cc.blindCount ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Created By</span>
              <span className="font-medium">{cc.createdBy?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Assigned To</span>
              <span className="font-medium">{cc.assignedTo?.name || 'Unassigned'}</span>
            </div>
            {cc.verifiedBy && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Verified By</span>
                <span className="font-medium">{cc.verifiedBy.name}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/60">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {cc.scheduledDate && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Scheduled</span>
                <span className="font-medium">{new Date(cc.scheduledDate).toLocaleDateString('en-IN')}</span>
              </div>
            )}
            {cc.startedAt && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Started</span>
                <span className="font-medium">{new Date(cc.startedAt).toLocaleString('en-IN')}</span>
              </div>
            )}
            {cc.completedAt && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Completed</span>
                <span className="font-medium">{new Date(cc.completedAt).toLocaleString('en-IN')}</span>
              </div>
            )}
            {cc.verifiedAt && (
              <div className="flex justify-between">
                <span className="text-foreground/60">Verified</span>
                <span className="font-medium">{new Date(cc.verifiedAt).toLocaleString('en-IN')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {cc.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-foreground/60">{cc.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Items Table */}
      {cc.items && cc.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Count Items ({cc.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left py-3 px-2 font-medium text-foreground/60">Product</th>
                    <th className="text-left py-3 px-2 font-medium text-foreground/60">SKU</th>
                    {cc.status !== 'IN_PROGRESS' || !cc.blindCount ? (
                      <th className="text-right py-3 px-2 font-medium text-foreground/60">Expected</th>
                    ) : null}
                    <th className="text-right py-3 px-2 font-medium text-foreground/60">
                      {cc.status === 'IN_PROGRESS' ? 'Count' : 'Counted'}
                    </th>
                    {(cc.status === 'COMPLETED' || cc.status === 'VERIFIED') && (
                      <>
                        <th className="text-right py-3 px-2 font-medium text-foreground/60">Variance</th>
                        <th className="text-right py-3 px-2 font-medium text-foreground/60">Variance %</th>
                        <th className="text-right py-3 px-2 font-medium text-foreground/60">Value Impact</th>
                      </>
                    )}
                    <th className="text-center py-3 px-2 font-medium text-foreground/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cc.items.map((item: any) => {
                    const hasVariance = item.variance !== null && item.variance !== 0;

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-foreground/5 ${
                          hasVariance && (cc.status === 'COMPLETED' || cc.status === 'VERIFIED')
                            ? 'bg-destructive/5'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-2 font-medium">{item.product?.name}</td>
                        <td className="py-3 px-2 text-foreground/60">{item.product?.sku || '—'}</td>

                        {cc.status !== 'IN_PROGRESS' || !cc.blindCount ? (
                          <td className="py-3 px-2 text-right">{item.expectedQuantity}</td>
                        ) : null}

                        <td className="py-3 px-2 text-right">
                          {cc.status === 'IN_PROGRESS' ? (
                            <Input
                              type="number"
                              min="0"
                              className="w-24 ml-auto text-right h-8"
                              value={countValues[item.id] ?? ''}
                              onChange={(e) =>
                                setCountValues((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              placeholder="—"
                            />
                          ) : (
                            <span>{item.countedQuantity ?? '—'}</span>
                          )}
                        </td>

                        {(cc.status === 'COMPLETED' || cc.status === 'VERIFIED') && (
                          <>
                            <td className={`py-3 px-2 text-right font-medium ${
                              hasVariance ? 'text-destructive' : 'text-success'
                            }`}>
                              {item.variance > 0 ? '+' : ''}{item.variance ?? 0}
                            </td>
                            <td className={`py-3 px-2 text-right ${hasVariance ? 'text-destructive' : ''}`}>
                              {item.variancePercent !== null
                                ? `${Number(item.variancePercent).toFixed(1)}%`
                                : '—'}
                            </td>
                            <td className={`py-3 px-2 text-right ${hasVariance ? 'text-destructive' : ''}`}>
                              {item.varianceValue !== null
                                ? `₹${Math.abs(Number(item.varianceValue)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                          </>
                        )}

                        <td className="py-3 px-2 text-center">
                          {item.status === 'COUNTED' && (
                            <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                          )}
                          {item.status === 'ADJUSTED' && (
                            <Wrench className="w-4 h-4 text-success mx-auto" />
                          )}
                          {item.status === 'PENDING' && (
                            <span className="text-foreground/30 text-xs">Pending</span>
                          )}
                          {item.status === 'VERIFIED' && (
                            <ShieldCheck className="w-4 h-4 text-success mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for DRAFT (items populated on start) */}
      {cc.status === 'DRAFT' && (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/50 text-lg font-medium">Ready to Start</p>
            <p className="text-foreground/30 text-sm mt-1">
              Click "Start Count" to populate items from the selected location and begin counting.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
