'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Puzzle, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'secondary',
  ACTIVE: 'default',
  ARCHIVED: 'destructive',
};

export default function BOMListPage() {
  const router = useRouter();
  const [boms, setBoms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBOMs();
  }, [statusFilter]);

  const fetchBOMs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchValue) params.set('search', searchValue);

      const res = await fetch(`/api/bom?${params.toString()}`);
      const data = await res.json();
      setBoms(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch BOMs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBOMs();
  };

  const getComponentCost = (bom: any): number => {
    if (!bom.items || bom.items.length === 0) return 0;
    return bom.items.reduce((sum: number, item: any) => {
      return sum + Number(item.quantity) * Number(item.componentProduct?.costPrice || 0);
    }, 0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Puzzle className="w-8 h-8" />
            Bill of Materials
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage kits, assemblies, and component relationships &middot; {total} BOMs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/bom/assembly')}>
            Assembly Orders
          </Button>
          <Button variant="outline" onClick={fetchBOMs}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => router.push('/bom/new')} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create BOM
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="ARCHIVED">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input
            placeholder="Search by BOM number, name, or product..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
      </div>

      {/* BOM Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : boms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Puzzle className="w-12 h-12 text-foreground/20 mb-4" />
          <p className="text-foreground/50 text-lg">No BOMs found</p>
          <p className="text-foreground/30 text-sm mt-1">
            Create a bill of materials to define kit components
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boms.map((bom: any) => {
            const componentCount = bom.items?.length || 0;
            const estimatedCost = getComponentCost(bom);

            return (
              <Link key={bom.id} href={`/bom/${bom.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {bom.bomNumber}
                        </CardTitle>
                        {bom.name && (
                          <p className="text-sm text-foreground/60 mt-0.5">
                            {bom.name}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          (STATUS_COLORS[bom.status] || 'outline') as any
                        }
                      >
                        {bom.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Product</span>
                      <span className="font-medium truncate ml-2">{bom.product?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Components</span>
                      <span className="font-medium">{componentCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Est. Cost</span>
                      <span className="font-medium">
                        {estimatedCost > 0
                          ? `\u20B9${estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '\u2014'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">Version</span>
                      <span className="font-medium">v{bom.version}</span>
                    </div>
                    <div className="text-xs text-foreground/40 pt-1">
                      Created{' '}
                      {new Date(bom.createdAt).toLocaleDateString('en-IN', {
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
