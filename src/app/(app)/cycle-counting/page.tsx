'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

const TYPE_LABELS: Record<string, string> = {
  FULL: 'Full Count',
  ABC_BASED: 'ABC Based',
  RANDOM_SAMPLE: 'Random Sample',
  SPOT_CHECK: 'Spot Check',
};

export default function CycleCountingPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCounts();
  }, [statusFilter]);

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/cycle-counts?${params.toString()}`);
      const data = await res.json();
      setCounts(data.counts || []);
    } catch (err) {
      console.error('Failed to fetch cycle counts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCounts();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8" />
            Cycle Counting
          </h1>
          <p className="text-foreground/50 mt-1">
            Physical inventory counts to verify stock accuracy
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCounts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/cycle-counting/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Count
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by CC number..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Count Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : counts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ClipboardCheck className="w-12 h-12 text-foreground/20 mb-4" />
          <p className="text-foreground/50 text-lg">No cycle counts found</p>
          <p className="text-foreground/30 text-sm mt-1">
            Create a new count to start verifying inventory accuracy
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counts.map((cc: any) => {
            const itemCount = cc._count?.items || 0;

            return (
              <Link key={cc.id} href={`/cycle-counting/${cc.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{cc.ccNumber}</CardTitle>
                        <p className="text-sm text-foreground/60 mt-0.5">
                          {TYPE_LABELS[cc.type] || cc.type}
                          {cc.abcFilter && ` (Class ${cc.abcFilter})`}
                        </p>
                      </div>
                      <Badge variant={(STATUS_COLORS[cc.status] || 'outline') as any}>
                        {STATUS_LABELS[cc.status] || cc.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Location</span>
                      <span className="font-medium">{cc.location?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Items</span>
                      <span className="font-medium">
                        {cc.countedItems}/{cc.totalItems || itemCount}
                      </span>
                    </div>
                    {cc.status !== 'DRAFT' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Variances</span>
                        <span className={`font-medium ${cc.varianceCount > 0 ? 'text-destructive' : 'text-success'}`}>
                          {cc.varianceCount}
                        </span>
                      </div>
                    )}
                    {cc.assignedTo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Assigned</span>
                        <span className="font-medium">{cc.assignedTo.name}</span>
                      </div>
                    )}
                    {/* Progress bar for in-progress counts */}
                    {cc.status === 'IN_PROGRESS' && cc.totalItems > 0 && (
                      <div className="pt-1">
                        <div className="w-full bg-foreground/10 rounded-full h-1.5">
                          <div
                            className="bg-primary rounded-full h-1.5 transition-all"
                            style={{ width: `${Math.round((cc.countedItems / cc.totalItems) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-foreground/40 mt-1">
                          {Math.round((cc.countedItems / cc.totalItems) * 100)}% counted
                        </p>
                      </div>
                    )}
                    <div className="text-xs text-foreground/40 pt-1">
                      Created{' '}
                      {new Date(cc.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
