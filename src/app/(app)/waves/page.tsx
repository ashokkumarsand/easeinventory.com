'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

export default function WavesPage() {
  const router = useRouter();
  const [waves, setWaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchWaves();
  }, [statusFilter]);

  const fetchWaves = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/waves?${params.toString()}`);
      const data = await res.json();
      setWaves(data.waves || []);
    } catch (err) {
      console.error('Failed to fetch waves:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchWaves();
  };

  const computeTotalValue = (wave: any): number => {
    if (!wave.orders || wave.orders.length === 0) return 0;
    return wave.orders.reduce(
      (sum: number, wo: any) => sum + Number(wo.order?.total || 0),
      0
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="w-8 h-8" />
            Wave Planning
          </h1>
          <p className="text-foreground/50 mt-1">
            Plan and manage fulfillment waves for batch processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWaves}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/waves/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Wave
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
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by wave number, name, or carrier zone..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* Wave Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : waves.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Layers className="w-12 h-12 text-foreground/20 mb-4" />
          <p className="text-foreground/50 text-lg">No waves found</p>
          <p className="text-foreground/30 text-sm mt-1">
            Create a new wave to start batch processing orders
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {waves.map((wave: any) => {
            const orderCount = wave.orders?.length || wave._count?.orders || 0;
            const totalValue = computeTotalValue(wave);

            return (
              <Link key={wave.id} href={`/waves/${wave.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {wave.waveNumber}
                        </CardTitle>
                        {wave.name && (
                          <p className="text-sm text-foreground/60 mt-0.5">
                            {wave.name}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          (STATUS_COLORS[wave.status] || 'outline') as any
                        }
                      >
                        {wave.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {wave.carrierZone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">Carrier Zone</span>
                        <span className="font-medium">{wave.carrierZone}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Orders</span>
                      <span className="font-medium">{orderCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Total Value</span>
                      <span className="font-medium">
                        {totalValue > 0
                          ? `\u20B9${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '\u2014'}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/40 pt-1">
                      Created{' '}
                      {new Date(wave.createdAt).toLocaleDateString('en-IN', {
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
