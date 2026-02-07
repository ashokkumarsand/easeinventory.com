'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  TrendingDown,
  Package,
  AlertTriangle,
  ListChecks,
  Lightbulb,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface PricingRule {
  id: string;
  number: string;
  name: string;
  description: string | null;
  triggerType: string;
  thresholdValue: number;
  thresholdOperator: string;
  scope: string;
  scopeId: string | null;
  adjustmentType: string;
  adjustmentValue: number;
  isProgressive: boolean;
  progressiveSteps: any;
  startDate: string;
  endDate: string | null;
  priority: number;
  isActive: boolean;
  status: string;
  createdAt: string;
}

interface Recommendation {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  currentPrice: number;
  costPrice: number;
  triggerType: string;
  triggerMetric: number;
  thresholdValue: number;
  adjustmentType: string;
  adjustmentValue: number;
  recommendedPrice: number;
  discountPct: number;
  margin: number;
  ruleId: string;
  ruleName: string;
}

interface RecSummary {
  totalRecommendations: number;
  totalPotentialRevenueSaved: number;
  avgDiscountPct: number;
  byTrigger: Record<string, number>;
}

// ============================================================
// Helpers
// ============================================================

const TRIGGER_LABELS: Record<string, string> = {
  STOCK_LEVEL: 'Stock Level',
  DAYS_OF_SUPPLY: 'Days of Supply',
  INVENTORY_AGE: 'Inventory Age',
  SLOW_MOVER: 'Slow Mover',
  SCHEDULED: 'Scheduled',
};

const SCOPE_LABELS: Record<string, string> = {
  ALL: 'All Products',
  PRODUCT: 'Single Product',
  CATEGORY: 'Category',
  ABC_CLASS: 'ABC Class',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
  PAUSED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  EXPIRED: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const OPERATOR_LABELS: Record<string, string> = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================
// Rule Form Dialog
// ============================================================

function RuleFormDialog({
  rule,
  open,
  onClose,
  onSave,
}: {
  rule: PricingRule | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    triggerType: 'STOCK_LEVEL',
    thresholdValue: 100,
    thresholdOperator: 'gt',
    scope: 'ALL',
    scopeId: '',
    adjustmentType: 'PERCENTAGE',
    adjustmentValue: 10,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    priority: 0,
    status: 'DRAFT',
  });

  useEffect(() => {
    if (rule) {
      setForm({
        name: rule.name,
        description: rule.description ?? '',
        triggerType: rule.triggerType,
        thresholdValue: rule.thresholdValue,
        thresholdOperator: rule.thresholdOperator,
        scope: rule.scope,
        scopeId: rule.scopeId ?? '',
        adjustmentType: rule.adjustmentType,
        adjustmentValue: Number(rule.adjustmentValue),
        startDate: rule.startDate.slice(0, 10),
        endDate: rule.endDate?.slice(0, 10) ?? '',
        priority: rule.priority,
        status: rule.status,
      });
    } else {
      setForm({
        name: '',
        description: '',
        triggerType: 'STOCK_LEVEL',
        thresholdValue: 100,
        thresholdOperator: 'gt',
        scope: 'ALL',
        scopeId: '',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 10,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        priority: 0,
        status: 'DRAFT',
      });
    }
  }, [rule, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = rule ? `/api/pricing-rules/${rule.id}` : '/api/pricing-rules';
      const method = rule ? 'PUT' : 'POST';
      const body = {
        ...form,
        thresholdValue: Number(form.thresholdValue),
        adjustmentValue: Number(form.adjustmentValue),
        priority: Number(form.priority),
        scopeId: form.scopeId || undefined,
        endDate: form.endDate || undefined,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (err) {
      console.error('Failed to save rule:', err);
    } finally {
      setSaving(false);
    }
  };

  const triggerHelp: Record<string, string> = {
    STOCK_LEVEL: 'Units in stock (e.g. > 100 units)',
    DAYS_OF_SUPPLY: 'Days until stockout at current velocity (e.g. > 60 days)',
    INVENTORY_AGE: 'Days since last receipt (e.g. > 90 days)',
    SLOW_MOVER: 'Average daily sales velocity (e.g. < 0.5 units/day)',
    SCHEDULED: 'Time-based discount (threshold ignored)',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Pricing Rule' : 'New Pricing Rule'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Rule Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="High stock clearance" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>

            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={form.triggerType} onValueChange={(v) => setForm({ ...form, triggerType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{triggerHelp[form.triggerType]}</p>
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SCOPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.scope !== 'ALL' && (
              <div className="col-span-2 space-y-2">
                <Label>Scope ID {form.scope === 'ABC_CLASS' ? '(A, B, or C)' : '(Product or Category ID)'}</Label>
                <Input value={form.scopeId} onChange={(e) => setForm({ ...form, scopeId: e.target.value })} placeholder={form.scope === 'ABC_CLASS' ? 'A' : 'ID'} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Operator</Label>
              <Select value={form.thresholdOperator} onValueChange={(v) => setForm({ ...form, thresholdOperator: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(OPERATOR_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Threshold Value</Label>
              <Input type="number" value={form.thresholdValue} onChange={(e) => setForm({ ...form, thresholdValue: parseFloat(e.target.value) || 0 })} />
            </div>

            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={form.adjustmentType} onValueChange={(v) => setForm({ ...form, adjustmentType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Adjustment Value</Label>
              <Input type="number" value={form.adjustmentValue} onChange={(e) => setForm({ ...form, adjustmentValue: parseFloat(e.target.value) || 0 })} />
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>End Date (optional)</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Priority (higher = checked first)</Label>
              <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Saving...' : rule ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Rules Tab
// ============================================================

function RulesTab() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editRule, setEditRule] = useState<PricingRule | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pricing-rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing rule?')) return;
    try {
      const res = await fetch(`/api/pricing-rules/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{total} rule{total !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <DollarSign className="w-8 h-8 opacity-50" />
              <p>No pricing rules yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead className="text-center">Condition</TableHead>
                    <TableHead className="text-center">Adjustment</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">{rule.number}</p>
                        </div>
                      </TableCell>
                      <TableCell>{TRIGGER_LABELS[rule.triggerType] ?? rule.triggerType}</TableCell>
                      <TableCell>
                        {SCOPE_LABELS[rule.scope] ?? rule.scope}
                        {rule.scopeId && <span className="text-xs text-muted-foreground ml-1">({rule.scopeId})</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {OPERATOR_LABELS[rule.thresholdOperator] ?? rule.thresholdOperator} {rule.thresholdValue}
                      </TableCell>
                      <TableCell className="text-center">
                        {rule.adjustmentType === 'PERCENTAGE'
                          ? `${Number(rule.adjustmentValue)}%`
                          : formatCurrency(Number(rule.adjustmentValue))}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={STATUS_COLORS[rule.status] ?? ''}>
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditRule(rule)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
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

      <RuleFormDialog
        rule={editRule}
        open={editRule !== null || showCreate}
        onClose={() => { setEditRule(null); setShowCreate(false); }}
        onSave={fetchRules}
      />
    </div>
  );
}

// ============================================================
// Recommendations Tab
// ============================================================

function RecommendationsTab() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState<RecSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pricing-rules/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecs(data.recommendations);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  const statCards = [
    {
      label: 'Recommendations',
      value: summary?.totalRecommendations?.toString() ?? '—',
      icon: Lightbulb,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Potential Savings',
      value: summary ? formatCurrency(summary.totalPotentialRevenueSaved) : '—',
      icon: TrendingDown,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Avg Discount',
      value: summary ? `${summary.avgDiscountPct}%` : '—',
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Products Affected',
      value: summary?.totalRecommendations?.toString() ?? '—',
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={fetchRecs} disabled={isLoading}>
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

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
          ) : recs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <AlertTriangle className="w-8 h-8 opacity-50" />
              <p>No recommendations. Create and activate pricing rules first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Recommended</TableHead>
                    <TableHead className="text-center">Discount</TableHead>
                    <TableHead className="text-center">Margin</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Rule</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recs.map((rec) => (
                    <TableRow key={rec.productId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rec.productName}</p>
                          {rec.sku && <p className="text-xs text-muted-foreground">{rec.sku}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{rec.currentStock}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rec.currentPrice)}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(rec.recommendedPrice)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          -{rec.discountPct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={rec.margin < 10 ? 'text-red-500' : rec.margin < 20 ? 'text-amber-500' : 'text-green-500'}>
                          {rec.margin}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {TRIGGER_LABELS[rec.triggerType]} {rec.triggerMetric}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{rec.ruleName}</span>
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
  );
}

// ============================================================
// Main Page
// ============================================================

export default function PricingRulesPage() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight font-heading">Dynamic Pricing</h1>
          <p className="text-sm text-muted-foreground">Inventory-level pricing rules and markdown recommendations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules" className="gap-1.5">
            <ListChecks className="w-4 h-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1.5">
            <Lightbulb className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <RulesTab />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <RecommendationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
