'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Search, Loader2, Info, AlertCircle, RefreshCw } from 'lucide-react';

interface AssortmentScore {
  productId: string;
  productName: string;
  sku: string | null;
  categoryName: string | null;
  abcClass: string | null;
  xyzClass: string | null;
  compositeScore: number;
  components: {
    revenue: number;
    stability: number;
    margin: number;
    turnover: number;
    customerReach: number;
    trend: number;
  };
  lifecycle: string;
  recommendation: string;
  currentStock: number;
}

interface ScoresData {
  data: AssortmentScore[];
  total: number;
  page: number;
  pageSize: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-green-500/10 text-green-600 border-green-500/20'
    : score >= 50 ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    : score >= 25 ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    : 'bg-red-500/10 text-red-600 border-red-500/20';
  return <Badge variant="outline" className={color}>{score}</Badge>;
}

function LifecycleBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    INTRODUCTION: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    GROWTH: 'bg-green-500/10 text-green-600 border-green-500/20',
    MATURITY: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    DECLINE: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    END_OF_LIFE: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return <Badge variant="outline" className={colors[stage] || ''}>{stage.replace(/_/g, ' ')}</Badge>;
}

export function AssortmentScoresTable() {
  const [data, setData] = useState<ScoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [abcFilter, setAbcFilter] = useState('all');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '25' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (abcFilter !== 'all') params.set('abcClass', abcFilter);
      const res = await fetch(`/api/analytics/assortment/scores?${params}`);
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.error('Failed to fetch assortment scores:', e);
      setError(e.message || 'Failed to load scores');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, abcFilter]);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            aria-label="Search products by name or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={abcFilter} onValueChange={(v) => { setAbcFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32" aria-label="Filter by ABC class">
            <SelectValue placeholder="ABC Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="A">Class A</SelectItem>
            <SelectItem value="B">Class B</SelectItem>
            <SelectItem value="C">Class C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mb-3 text-destructive opacity-70" />
            <p className="font-medium text-foreground">Failed to load scores</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchScores}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading scores...
        </div>
      ) : data && data.data.length > 0 ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center hidden md:table-cell">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 mx-auto">
                          Components <Info className="w-3 h-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">R=Revenue S=Stability M=Margin T=Turnover C=Customers Tr=Trend</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center">ABC/XYZ</TableHead>
                  <TableHead className="text-center">Lifecycle</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map(s => (
                  <TableRow key={s.productId}>
                    <TableCell>
                      <div className="font-medium text-sm">{s.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.sku && <span>{s.sku}</span>}
                        {s.categoryName && <span className="ml-1">/ {s.categoryName}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={s.compositeScore} />
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <div className="flex gap-0.5 justify-center text-[10px] font-mono">
                        <span title="Revenue" className="px-1 rounded bg-muted">{s.components.revenue}</span>
                        <span title="Stability" className="px-1 rounded bg-muted">{s.components.stability}</span>
                        <span title="Margin" className="px-1 rounded bg-muted">{s.components.margin}</span>
                        <span title="Turnover" className="px-1 rounded bg-muted">{s.components.turnover}</span>
                        <span title="Customers" className="px-1 rounded bg-muted">{s.components.customerReach}</span>
                        <span title="Trend" className="px-1 rounded bg-muted">{s.components.trend}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-mono">
                        {s.abcClass || '?'}/{s.xyzClass || '?'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <LifecycleBadge stage={s.lifecycle} />
                    </TableCell>
                    <TableCell className="text-right">{s.currentStock}</TableCell>
                    <TableCell>
                      <span className="text-sm">{s.recommendation}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="font-medium">No scored products</p>
            <p className="text-sm mt-1">Run ABC/XYZ classification first for more accurate scoring</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.total > data.pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / data.pageSize)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
