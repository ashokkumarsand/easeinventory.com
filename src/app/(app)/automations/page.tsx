'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Plus,
  RefreshCw,
  Play,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Sparkles,
  Package,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface AutomationRule {
  id: string;
  name: string;
  triggerType: string;
  conditionJson: Record<string, unknown> | null;
  cronExpression: string | null;
  actionType: string;
  actionConfigJson: Record<string, unknown> | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  triggerCount: number;
  createdAt: string;
  _count: { logs: number };
}

interface AutomationLog {
  id: string;
  ruleId: string;
  triggeredAt: string;
  actionTaken: string;
  resultJson: Record<string, unknown> | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

interface AutomationPreset {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  actionType: string;
}

interface EvaluationResult {
  rulesEvaluated: number;
  rulesTriggered: number;
  totalActionsExecuted: number;
  details: {
    ruleId: string;
    ruleName: string;
    triggerType: string;
    matchedProducts: number;
    actionType: string;
    success: boolean;
    error?: string;
  }[];
}

// ============================================================
// Constants
// ============================================================

const TRIGGER_TYPES = [
  { value: 'STOCK_BELOW_REORDER', label: 'Stock Below Reorder' },
  { value: 'STOCK_BELOW_SAFETY', label: 'Stock Below Safety' },
  { value: 'EXPIRY_APPROACHING', label: 'Expiry Approaching' },
  { value: 'DEMAND_SPIKE', label: 'Demand Spike' },
  { value: 'SLOW_MOVER_DETECTED', label: 'Slow Mover Detected' },
  { value: 'SCHEDULE', label: 'Scheduled' },
];

const ACTION_TYPES = [
  { value: 'CREATE_PO_SUGGESTION', label: 'Create PO Suggestion' },
  { value: 'SEND_NOTIFICATION', label: 'Send Notification' },
  { value: 'ADJUST_PRICE', label: 'Adjust Price' },
  { value: 'FLAG_FOR_REVIEW', label: 'Flag for Review' },
  { value: 'SEND_WEBHOOK', label: 'Send Webhook' },
];

const TRIGGER_COLORS: Record<string, string> = {
  STOCK_BELOW_REORDER: 'bg-red-500/10 text-red-500 border-red-500/20',
  STOCK_BELOW_SAFETY: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  EXPIRY_APPROACHING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  DEMAND_SPIKE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  SLOW_MOVER_DETECTED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  SCHEDULE: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_PO_SUGGESTION: 'bg-green-500/10 text-green-500 border-green-500/20',
  SEND_NOTIFICATION: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ADJUST_PRICE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  FLAG_FOR_REVIEW: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  SEND_WEBHOOK: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};

// ============================================================
// Helpers
// ============================================================

function formatTrigger(type: string): string {
  return TRIGGER_TYPES.find((t) => t.value === type)?.label || type;
}

function formatAction(type: string): string {
  return ACTION_TYPES.find((a) => a.value === type)?.label || type;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// Presets Section
// ============================================================

const PRESET_ICONS: Record<string, string> = {
  reorder_basic: '📦',
  reorder_safety: '🚨',
  reorder_a_class: '⭐',
  notify_slow_movers: '🐌',
  notify_demand_spike: '📈',
  markdown_expiry: '⏰',
};

function PresetsSection({ onCreated }: { onCreated: () => void }) {
  const [presets, setPresets] = useState<AutomationPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/automations/presets')
      .then((r) => r.json())
      .then(setPresets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (presetId: string) => {
    setCreating(presetId);
    try {
      const res = await fetch('/api/automations/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId }),
      });
      if (!res.ok) throw new Error('Failed to create');
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">Quick Start Templates</h3>
        <span className="text-sm text-foreground/50">One-click to activate a pre-configured rule</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <Card key={preset.id} className="hover:border-foreground/20 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{PRESET_ICONS[preset.id] || '⚡'}</span>
                <CardTitle className="text-sm leading-tight">{preset.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/60 mb-3">{preset.description}</p>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={TRIGGER_COLORS[preset.triggerType] || ''}>
                  {formatTrigger(preset.triggerType)}
                </Badge>
                <span className="text-foreground/30">→</span>
                <Badge variant="outline" className={ACTION_COLORS[preset.actionType] || ''}>
                  {formatAction(preset.actionType)}
                </Badge>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleCreate(preset.id)}
                disabled={creating === preset.id}
              >
                {creating === preset.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Package className="w-4 h-4 mr-2" />
                )}
                Activate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Create Rule Dialog
// ============================================================

function CreateRuleDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [actionType, setActionType] = useState('');
  const [thresholdDays, setThresholdDays] = useState('30');
  const [spikeThresholdPct, setSpikeThresholdPct] = useState('50');
  const [velocityThreshold, setVelocityThreshold] = useState('0.1');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [abcClassFilter, setAbcClassFilter] = useState('');
  const [cronExpression, setCronExpression] = useState('');
  const [discountPct, setDiscountPct] = useState('10');
  const [leadTimeDays, setLeadTimeDays] = useState('7');

  const resetForm = () => {
    setName('');
    setTriggerType('');
    setActionType('');
    setThresholdDays('30');
    setSpikeThresholdPct('50');
    setVelocityThreshold('0.1');
    setCategoryFilter('');
    setAbcClassFilter('');
    setCronExpression('');
    setDiscountPct('10');
    setLeadTimeDays('7');
  };

  const handleSubmit = async () => {
    if (!name || !triggerType || !actionType) return;

    setSaving(true);
    try {
      const conditionJson: Record<string, unknown> = {};
      if (triggerType === 'EXPIRY_APPROACHING') {
        conditionJson.thresholdDays = parseInt(thresholdDays) || 30;
      }
      if (triggerType === 'DEMAND_SPIKE') {
        conditionJson.spikeThresholdPct = parseInt(spikeThresholdPct) || 50;
      }
      if (triggerType === 'SLOW_MOVER_DETECTED') {
        conditionJson.velocityThreshold = parseFloat(velocityThreshold) || 0.1;
      }
      if (categoryFilter) conditionJson.category = categoryFilter;
      if (abcClassFilter) conditionJson.abcClass = abcClassFilter;

      const actionConfigJson: Record<string, unknown> = {};
      if (actionType === 'ADJUST_PRICE') {
        actionConfigJson.discountPct = parseFloat(discountPct) || 10;
      }
      if (actionType === 'CREATE_PO_SUGGESTION') {
        actionConfigJson.leadTimeDays = parseInt(leadTimeDays) || 7;
      }

      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          triggerType,
          actionType,
          conditionJson: Object.keys(conditionJson).length > 0 ? conditionJson : undefined,
          actionConfigJson: Object.keys(actionConfigJson).length > 0 ? actionConfigJson : undefined,
          cronExpression: cronExpression || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create rule');
      }

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      console.error('Failed to create automation rule:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Automation Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Rule Name</Label>
            <Input
              placeholder="e.g., Low stock auto-reorder"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger..." />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trigger-specific fields */}
          {triggerType === 'EXPIRY_APPROACHING' && (
            <div className="space-y-2">
              <Label>Days Before Expiry</Label>
              <Input
                type="number"
                value={thresholdDays}
                onChange={(e) => setThresholdDays(e.target.value)}
                min={1}
              />
            </div>
          )}

          {triggerType === 'DEMAND_SPIKE' && (
            <div className="space-y-2">
              <Label>Spike Threshold (%)</Label>
              <Input
                type="number"
                value={spikeThresholdPct}
                onChange={(e) => setSpikeThresholdPct(e.target.value)}
                min={1}
              />
              <p className="text-xs text-foreground/50">
                Trigger when recent demand exceeds moving average by this percentage
              </p>
            </div>
          )}

          {triggerType === 'SLOW_MOVER_DETECTED' && (
            <div className="space-y-2">
              <Label>Daily Velocity Threshold (units/day)</Label>
              <Input
                type="number"
                step="0.01"
                value={velocityThreshold}
                onChange={(e) => setVelocityThreshold(e.target.value)}
                min={0}
              />
            </div>
          )}

          {triggerType === 'SCHEDULE' && (
            <div className="space-y-2">
              <Label>Cron Expression (optional)</Label>
              <Input
                placeholder="e.g., 0 9 * * 1 (every Monday at 9am)"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
              />
            </div>
          )}

          {/* Condition filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category Filter (ID)</Label>
              <Input
                placeholder="Optional"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ABC Class Filter</Label>
              <Select value={abcClassFilter} onValueChange={setAbcClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Action Type</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action-specific fields */}
          {actionType === 'ADJUST_PRICE' && (
            <div className="space-y-2">
              <Label>Discount Percentage</Label>
              <Input
                type="number"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                min={1}
                max={100}
              />
            </div>
          )}

          {actionType === 'CREATE_PO_SUGGESTION' && (
            <div className="space-y-2">
              <Label>Lead Time (days)</Label>
              <Input
                type="number"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                min={1}
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={saving || !name || !triggerType || !actionType}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [lastEvalResult, setLastEvalResult] = useState<EvaluationResult | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/automations');
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error('Failed to fetch automation rules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (ruleId: string) => {
    try {
      const res = await fetch(`/api/automations/${ruleId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch automation logs:', err);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  useEffect(() => {
    if (selectedRuleId) {
      fetchLogs(selectedRuleId);
    }
  }, [selectedRuleId, fetchLogs]);

  const handleToggle = async (ruleId: string) => {
    setToggling(ruleId);
    try {
      const res = await fetch(`/api/automations/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleActive: true }),
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    setDeleting(ruleId);
    try {
      const res = await fetch(`/api/automations/${ruleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchRules();
        if (selectedRuleId === ruleId) {
          setSelectedRuleId(null);
          setLogs([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete rule:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    setLastEvalResult(null);
    try {
      const res = await fetch('/api/automations/evaluate', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setLastEvalResult(data);
        fetchRules(); // Refresh rules to update trigger counts
        if (selectedRuleId) {
          fetchLogs(selectedRuleId);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate automations:', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Automation Rules
          </h1>
          <p className="text-foreground/50 mt-1">
            Define rules to automate inventory actions based on triggers and conditions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRules} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            onClick={handleEvaluate}
            disabled={evaluating}
            className="gap-2"
          >
            {evaluating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Now
          </Button>
          <Button onClick={() => setCreateOpen(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Evaluation Result Banner */}
      {lastEvalResult && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Evaluation Complete</span>
              </div>
              <Badge variant="secondary">
                {lastEvalResult.rulesEvaluated} rules evaluated
              </Badge>
              <Badge variant="secondary">
                {lastEvalResult.rulesTriggered} triggered
              </Badge>
              <Badge variant="secondary">
                {lastEvalResult.totalActionsExecuted} actions executed
              </Badge>
              {lastEvalResult.details.some((d) => !d.success) && (
                <Badge variant="destructive">
                  {lastEvalResult.details.filter((d) => !d.success).length} errors
                </Badge>
              )}
            </div>
            {lastEvalResult.details.length > 0 && (
              <div className="mt-3 space-y-1">
                {lastEvalResult.details.map((d) => (
                  <div
                    key={d.ruleId}
                    className="text-sm flex items-center gap-2 text-foreground/70"
                  >
                    {d.success ? (
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    )}
                    <span className="font-medium">{d.ruleName}</span>
                    <span>-</span>
                    <span>
                      {d.matchedProducts} products matched, action: {formatAction(d.actionType)}
                    </span>
                    {d.error && <span className="text-red-500">({d.error})</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-foreground/50">Total Rules</div>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-foreground/50">Active Rules</div>
            <div className="text-2xl font-bold text-green-500">
              {rules.filter((r) => r.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-foreground/50">Total Triggers</div>
            <div className="text-2xl font-bold">
              {rules.reduce((sum, r) => sum + r.triggerCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-sm text-foreground/50">Total Logs</div>
            <div className="text-2xl font-bold">
              {rules.reduce((sum, r) => sum + r._count.logs, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
            </div>
          ) : rules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">No automation rules yet</h3>
                <p className="text-foreground/50 mb-4">
                  Create your first rule to automate inventory actions based on triggers
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`transition-all ${
                    !rule.isActive ? 'opacity-60' : ''
                  } hover:border-foreground/20`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">
                        {rule.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggle(rule.id)}
                          disabled={toggling === rule.id}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(rule.id)}
                          disabled={deleting === rule.id}
                        >
                          {deleting === rule.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={TRIGGER_COLORS[rule.triggerType] || ''}
                      >
                        {formatTrigger(rule.triggerType)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={ACTION_COLORS[rule.actionType] || ''}
                      >
                        {formatAction(rule.actionType)}
                      </Badge>
                    </div>

                    {/* Condition summary */}
                    {rule.conditionJson && Object.keys(rule.conditionJson).length > 0 && (
                      <div className="text-xs text-foreground/50 space-x-2">
                        {(() => {
                          const cond = rule.conditionJson as Record<string, unknown>;
                          return (
                            <>
                              {cond.thresholdDays != null && (
                                <span>Expiry threshold: {String(cond.thresholdDays)}d</span>
                              )}
                              {cond.spikeThresholdPct != null && (
                                <span>Spike: {String(cond.spikeThresholdPct)}%</span>
                              )}
                              {cond.velocityThreshold != null && (
                                <span>Velocity &lt; {String(cond.velocityThreshold)}/day</span>
                              )}
                              {cond.abcClass != null && (
                                <span>Class: {String(cond.abcClass)}</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-foreground/50">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{rule.triggerCount} triggers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(rule.lastTriggeredAt)}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setSelectedRuleId(selectedRuleId === rule.id ? null : rule.id);
                      }}
                    >
                      {selectedRuleId === rule.id ? 'Hide Logs' : `View Logs (${rule._count.logs})`}
                    </Button>

                    {/* Inline logs for selected rule */}
                    {selectedRuleId === rule.id && logs.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-foreground/10">
                        {logs.slice(0, 5).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-2 text-xs"
                          >
                            {log.success ? (
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="text-foreground/70">{log.actionTaken}</span>
                              <div className="text-foreground/40">
                                {formatDate(log.triggeredAt)}
                              </div>
                              {log.errorMessage && (
                                <div className="text-red-400 mt-0.5">{log.errorMessage}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        {/* Presets Tab */}
        <TabsContent value="presets" className="mt-4">
          <PresetsSection onCreated={fetchRules} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <p className="text-foreground/50 text-center py-8">
                  No automation rules to show history for
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-foreground/50 mb-4">
                    Select a rule from the Rules tab to view its detailed execution logs, or click
                    &quot;Run Now&quot; to trigger an evaluation and see results above.
                  </p>

                  {/* Show all rules with their last triggered info */}
                  <div className="space-y-3">
                    {rules
                      .filter((r) => r.triggerCount > 0)
                      .sort(
                        (a, b) =>
                          new Date(b.lastTriggeredAt || 0).getTime() -
                          new Date(a.lastTriggeredAt || 0).getTime(),
                      )
                      .map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {rule.isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{rule.name}</div>
                              <div className="text-xs text-foreground/50">
                                {formatTrigger(rule.triggerType)} → {formatAction(rule.actionType)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-sm font-medium">{rule.triggerCount}x</div>
                            <div className="text-xs text-foreground/50">
                              {formatDate(rule.lastTriggeredAt)}
                            </div>
                          </div>
                        </div>
                      ))}

                    {rules.filter((r) => r.triggerCount > 0).length === 0 && (
                      <p className="text-foreground/50 text-center py-8">
                        No rules have been triggered yet. Click &quot;Run Now&quot; to evaluate all active rules.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <CreateRuleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchRules}
      />
    </div>
  );
}
