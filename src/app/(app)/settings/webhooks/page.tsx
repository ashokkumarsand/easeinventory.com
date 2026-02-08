'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  Link2,
  Plus,
  Trash2,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  failCount: number;
  lastDeliveredAt: string | null;
  createdAt: string;
  _count?: { deliveries: number };
}

interface WebhookDelivery {
  id: string;
  event: string;
  statusCode: number | null;
  success: boolean;
  responseBody: string | null;
  deliveredAt: string;
}

interface EndpointDetail extends WebhookEndpoint {
  deliveries: WebhookDelivery[];
}

// ============================================================
// Constants
// ============================================================

const AVAILABLE_EVENTS = [
  { value: 'order.created', label: 'Order Created' },
  { value: 'order.shipped', label: 'Order Shipped' },
  { value: 'shipment.delivered', label: 'Shipment Delivered' },
  { value: 'stock.low', label: 'Stock Low' },
  { value: 'payment.received', label: 'Payment Received' },
  { value: 'return.created', label: 'Return Created' },
  { value: 'po.received', label: 'PO Received' },
];

// ============================================================
// Page
// ============================================================

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addEvents, setAddEvents] = useState<string[]>([]);
  const [addSaving, setAddSaving] = useState(false);

  // Secret display
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Test state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; statusCode: number | null } | null>(null);

  // ---- Fetch endpoints ----
  const fetchEndpoints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/webhooks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEndpoints(data.endpoints || []);
    } catch {
      console.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  // ---- Expand / collapse deliveries ----
  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDeliveries([]);
      return;
    }

    setExpandedId(id);
    setDeliveriesLoading(true);
    try {
      const res = await fetch(`/api/webhooks/${id}`);
      if (!res.ok) throw new Error('Failed to load');
      const data: EndpointDetail = await res.json();
      setDeliveries(data.deliveries || []);
    } catch {
      setDeliveries([]);
    } finally {
      setDeliveriesLoading(false);
    }
  };

  // ---- Add endpoint ----
  const handleAdd = async () => {
    if (!addUrl || addEvents.length === 0) return;
    setAddSaving(true);
    try {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: addUrl, events: addEvents }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const created = await res.json();
      setNewSecret(created.secret);
      setAddUrl('');
      setAddEvents([]);
      setShowAddDialog(false);
      fetchEndpoints();
    } catch {
      alert('Failed to create webhook endpoint');
    } finally {
      setAddSaving(false);
    }
  };

  // ---- Delete endpoint ----
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/webhooks/${deleteTarget}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteTarget(null);
      if (expandedId === deleteTarget) {
        setExpandedId(null);
        setDeliveries([]);
      }
      fetchEndpoints();
    } catch {
      alert('Failed to delete webhook endpoint');
    } finally {
      setDeleting(false);
    }
  };

  // ---- Test endpoint ----
  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/webhooks/${id}/test`, { method: 'POST' });
      if (!res.ok) throw new Error('Test failed');
      const data = await res.json();
      setTestResult({ id, success: data.success, statusCode: data.statusCode });
      // Refresh deliveries if expanded
      if (expandedId === id) {
        toggleExpand(id);
      }
    } catch {
      setTestResult({ id, success: false, statusCode: null });
    } finally {
      setTestingId(null);
    }
  };

  // ---- Toggle event ----
  const toggleEvent = (event: string) => {
    setAddEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  // ---- Copy secret ----
  const copySecret = () => {
    if (newSecret) {
      navigator.clipboard.writeText(newSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  // ---- Helpers ----
  const truncateUrl = (url: string, max = 50) =>
    url.length > max ? url.slice(0, max) + '...' : url;

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleString() : 'Never';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Webhook Endpoints</h1>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Secret display dialog (shown after creation) */}
      <Dialog open={!!newSecret} onOpenChange={() => setNewSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Secret Created</DialogTitle>
            <DialogDescription>
              Copy this secret now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border bg-muted p-3 font-mono text-sm">
            <span className="flex-1 break-all">{newSecret}</span>
            <Button variant="ghost" size="sm" onClick={copySecret}>
              {secretCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setNewSecret(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add endpoint dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
            <DialogDescription>
              Configure a URL to receive event notifications via HTTP POST.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-server.com/webhook"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>Events to subscribe</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map((evt) => (
                  <label
                    key={evt.value}
                    className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={addEvents.includes(evt.value)}
                      onCheckedChange={() => toggleEvent(evt.value)}
                    />
                    <span className="text-sm">{evt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!addUrl || addEvents.length === 0 || addSaving}
            >
              {addSaving ? 'Creating...' : 'Create Endpoint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook Endpoint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook endpoint? All delivery history will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Endpoints list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Loading webhooks...
        </div>
      ) : endpoints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Link2 className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No webhook endpoints</p>
            <p className="text-sm text-muted-foreground/70">
              Add an endpoint to start receiving event notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <Card key={ep.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <CardTitle className="text-base font-mono truncate">
                      {truncateUrl(ep.url)}
                    </CardTitle>
                    <Badge variant={ep.isActive ? 'default' : 'secondary'}>
                      {ep.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {ep.failCount > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {ep.failCount} fails
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(ep.id)}
                      disabled={testingId === ep.id}
                    >
                      {testingId === ep.id ? (
                        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <PlayCircle className="mr-1 h-3 w-3" />
                      )}
                      Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(ep.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(ep.id)}
                    >
                      {expandedId === ep.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{ep.events.length} event(s)</span>
                  <span className="text-muted-foreground/40">|</span>
                  <span>Last delivered: {formatDate(ep.lastDeliveredAt)}</span>
                  {ep._count && (
                    <>
                      <span className="text-muted-foreground/40">|</span>
                      <span>{ep._count.deliveries} total deliveries</span>
                    </>
                  )}
                </div>

                {/* Test result */}
                {testResult && testResult.id === ep.id && (
                  <div
                    className={`mt-2 rounded-md p-2 text-sm ${
                      testResult.success
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    Test {testResult.success ? 'succeeded' : 'failed'}
                    {testResult.statusCode && ` (HTTP ${testResult.statusCode})`}
                  </div>
                )}

                {/* Delivery log */}
                {expandedId === ep.id && (
                  <div className="mt-4">
                    {deliveriesLoading ? (
                      <p className="text-sm text-muted-foreground">Loading deliveries...</p>
                    ) : deliveries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No deliveries yet.</p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Status Code</TableHead>
                              <TableHead>Result</TableHead>
                              <TableHead>Delivered At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deliveries.map((d) => (
                              <TableRow key={d.id}>
                                <TableCell className="font-mono text-sm">{d.event}</TableCell>
                                <TableCell>{d.statusCode ?? 'N/A'}</TableCell>
                                <TableCell>
                                  <Badge variant={d.success ? 'default' : 'destructive'}>
                                    {d.success ? 'Success' : 'Failed'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(d.deliveredAt).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
