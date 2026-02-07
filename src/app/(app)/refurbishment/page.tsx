'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Clock,
  Trash2,
  Hammer,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface RefurbishmentItem {
  id: string;
  returnNumber: string;
  productId: string | null;
  productName: string;
  quantity: number;
  conditionGrade: string | null;
  refurbishmentStatus: string | null;
  refurbishmentNotes: string | null;
  refurbishmentCost: number | null;
  conditionPrice: number | null;
  refurbishedAt: string | null;
  restocked: boolean;
}

interface Summary {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  scrappedCount: number;
  totalRefurbCost: number;
  totalConditionValue: number;
  gradeBreakdown: Record<string, number>;
}

// ============================================================
// Helpers
// ============================================================

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-500/10 text-green-500 border-green-500/20',
  B: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  C: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  SCRAP: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
  SCRAPPED: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const GRADE_LABELS: Record<string, string> = {
  A: 'Grade A — Resell',
  B: 'Grade B — Refurbish',
  C: 'Grade C — Heavy Refurb',
  SCRAP: 'Scrap',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// ============================================================
// Main Page
// ============================================================

export default function RefurbishmentPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<RefurbishmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/refurbishment');
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch refurbishment data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (itemId: string, status: string) => {
    try {
      const res = await fetch(`/api/refurbishment/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = filter === 'all'
    ? items
    : items.filter((i) => i.refurbishmentStatus === filter || i.conditionGrade === filter);

  const statCards = [
    { label: 'Pending', value: summary?.pendingCount?.toString() ?? '—', icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { label: 'In Progress', value: summary?.inProgressCount?.toString() ?? '—', icon: Hammer, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Completed', value: summary?.completedCount?.toString() ?? '—', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { label: 'Scrapped', value: summary?.scrappedCount?.toString() ?? '—', icon: Trash2, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <RotateCcw className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading">Refurbishment Queue</h1>
            <p className="text-sm text-muted-foreground">Grade returned items and manage refurbishment workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="SCRAPPED">Scrapped</SelectItem>
              <SelectItem value="A">Grade A</SelectItem>
              <SelectItem value="B">Grade B</SelectItem>
              <SelectItem value="C">Grade C</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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

      {/* Grade Breakdown */}
      {summary && Object.keys(summary.gradeBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(summary.gradeBreakdown).map(([grade, count]) => (
                <div key={grade} className="flex items-center gap-2">
                  <Badge variant="outline" className={GRADE_COLORS[grade] ?? ''}>
                    {GRADE_LABELS[grade] ?? grade}
                  </Badge>
                  <span className="text-sm font-medium">{count} units</span>
                </div>
              ))}
              <div className="ml-auto flex gap-4 text-sm">
                <span className="text-muted-foreground">Refurb Cost: <strong>{formatCurrency(summary.totalRefurbCost)}</strong></span>
                <span className="text-muted-foreground">Condition Value: <strong>{formatCurrency(summary.totalConditionValue)}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <RotateCcw className="w-8 h-8 opacity-50" />
              <p>No graded return items. Grade items during return inspection.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Return #</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Condition Price</TableHead>
                    <TableHead className="text-right">Refurb Cost</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.returnNumber}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={GRADE_COLORS[item.conditionGrade ?? ''] ?? ''}>
                          {item.conditionGrade ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.refurbishmentStatus ? (
                          <Badge variant="outline" className={STATUS_COLORS[item.refurbishmentStatus] ?? ''}>
                            {item.refurbishmentStatus.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.conditionPrice ? formatCurrency(item.conditionPrice) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.refurbishmentCost ? formatCurrency(item.refurbishmentCost) : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.refurbishmentStatus === 'PENDING' && (
                            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}>
                              Start
                            </Button>
                          )}
                          {item.refurbishmentStatus === 'IN_PROGRESS' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusChange(item.id, 'COMPLETED')}>
                                Complete
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusChange(item.id, 'SCRAPPED')}>
                                Scrap
                              </Button>
                            </>
                          )}
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
  );
}
