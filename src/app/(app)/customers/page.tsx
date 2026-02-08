'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  Crown,
  TrendingUp,
  UserCheck,
  UserX,
  UserPlus,
  Star,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ============================================================
// Badge color helpers
// ============================================================

const SEGMENT_STYLES: Record<string, string> = {
  VIP: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  REGULAR: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  NEW: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30',
  AT_RISK: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  CHURNED: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
};

const TIER_STYLES: Record<string, string> = {
  BRONZE: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  SILVER: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30',
  GOLD: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  PLATINUM: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
};

const SEGMENT_ICONS: Record<string, React.ReactNode> = {
  VIP: <Crown className="w-3 h-3" />,
  REGULAR: <UserCheck className="w-3 h-3" />,
  NEW: <UserPlus className="w-3 h-3" />,
  AT_RISK: <AlertTriangle className="w-3 h-3" />,
  CHURNED: <UserX className="w-3 h-3" />,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================================
// Component
// ============================================================

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('customers');

  // Customer list state
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Detail panel
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Segmentation
  const [segmenting, setSegmenting] = useState(false);

  // --------------------------------------------------------
  // Fetch customers
  // --------------------------------------------------------
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (segmentFilter !== 'all') params.set('segment', segmentFilter);
      if (tierFilter !== 'all') params.set('tier', tierFilter);
      if (searchValue) params.set('search', searchValue);
      params.set('page', String(page));
      params.set('limit', '50');

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [segmentFilter, tierFilter, searchValue, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // --------------------------------------------------------
  // Fetch analytics
  // --------------------------------------------------------
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/customers/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  // --------------------------------------------------------
  // Fetch customer detail
  // --------------------------------------------------------
  const fetchCustomerDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      setSelectedCustomer(data);
    } catch (err) {
      console.error('Failed to fetch customer detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // --------------------------------------------------------
  // Create customer
  // --------------------------------------------------------
  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setCreateOpen(false);
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          companyName: '',
          address: '',
        });
        fetchCustomers();
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // --------------------------------------------------------
  // Run segmentation
  // --------------------------------------------------------
  const handleSegment = async () => {
    setSegmenting(true);
    try {
      await fetch('/api/customers/segment', { method: 'POST' });
      fetchCustomers();
      if (activeTab === 'analytics') fetchAnalytics();
    } catch (err) {
      console.error('Failed to run segmentation:', err);
    } finally {
      setSegmenting(false);
    }
  };

  // --------------------------------------------------------
  // Search on Enter
  // --------------------------------------------------------
  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Customers
          </h1>
          <p className="text-foreground/50 mt-1">
            Manage customers, segments, and analytics ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSegment}
            disabled={segmenting}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {segmenting ? 'Running...' : 'Run Segmentation'}
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer record.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    placeholder="Customer name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, phone: e.target.value })
                      }
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company</Label>
                  <Input
                    id="companyName"
                    value={createForm.companyName}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Company name (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={createForm.address}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, address: e.target.value })
                    }
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!createForm.name.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Customer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* ===== Customers Tab ===== */}
        <TabsContent value="customers">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select
              value={segmentFilter}
              onValueChange={(v) => {
                setSegmentFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="AT_RISK">At Risk</SelectItem>
                <SelectItem value="CHURNED">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={tierFilter}
              onValueChange={(v) => {
                setTierFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchCustomers}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Customer Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Lifetime Value</TableHead>
                  <TableHead>Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() => fetchCustomerDetail(customer.id)}
                    >
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone || '-'}
                      </TableCell>
                      <TableCell>
                        {customer.segment && (
                          <Badge
                            variant="outline"
                            className={SEGMENT_STYLES[customer.segment] || ''}
                          >
                            <span className="mr-1">
                              {SEGMENT_ICONS[customer.segment]}
                            </span>
                            {customer.segment.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.tier && (
                          <Badge
                            variant="outline"
                            className={TIER_STYLES[customer.tier] || ''}
                          >
                            {customer.tier}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.totalOrders}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(customer.lifetimeValue))}
                      </TableCell>
                      <TableCell>
                        {formatDate(customer.lastOrderDate)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {total > 50 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 50 + 1}-
                {Math.min(page * 50, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 50 >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Customer Detail Panel */}
          {selectedCustomer && (
            <Dialog
              open={!!selectedCustomer}
              onOpenChange={(open) => {
                if (!open) setSelectedCustomer(null);
              }}
            >
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedCustomer.name}
                    {selectedCustomer.segment && (
                      <Badge
                        variant="outline"
                        className={
                          SEGMENT_STYLES[selectedCustomer.segment] || ''
                        }
                      >
                        {selectedCustomer.segment.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {selectedCustomer.tier && (
                      <Badge
                        variant="outline"
                        className={TIER_STYLES[selectedCustomer.tier] || ''}
                      >
                        {selectedCustomer.tier}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Customer details and order history
                  </DialogDescription>
                </DialogHeader>

                {detailLoading ? (
                  <p className="text-muted-foreground py-4">Loading...</p>
                ) : (
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {selectedCustomer.email || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {selectedCustomer.phone || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">
                          {selectedCustomer.companyName || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">GST</p>
                        <p className="font-medium">
                          {selectedCustomer.gstNumber || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">
                            Lifetime Value
                          </p>
                          <p className="text-xl font-bold">
                            {formatCurrency(
                              Number(selectedCustomer.lifetimeValue),
                            )}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">
                            Total Orders
                          </p>
                          <p className="text-xl font-bold">
                            {selectedCustomer.totalOrders}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">
                            Last Order
                          </p>
                          <p className="text-xl font-bold">
                            {formatDate(selectedCustomer.lastOrderDate)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Address */}
                    {selectedCustomer.address && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Address
                        </p>
                        <p>
                          {selectedCustomer.address}
                          {selectedCustomer.city &&
                            `, ${selectedCustomer.city}`}
                          {selectedCustomer.state &&
                            `, ${selectedCustomer.state}`}
                          {selectedCustomer.pincode &&
                            ` - ${selectedCustomer.pincode}`}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedCustomer.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Notes
                        </p>
                        <p className="text-sm">{selectedCustomer.notes}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedCustomer.tags?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomer.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Orders */}
                    {selectedCustomer.salesOrders?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Recent Orders (last 10)
                        </p>
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedCustomer.salesOrders.map(
                                (order: any) => (
                                  <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                      {order.orderNumber}
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(order.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {order.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {order.items?.length || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(Number(order.total))}
                                    </TableCell>
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* ===== Analytics Tab ===== */}
        <TabsContent value="analytics">
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Customers
                        </p>
                        <p className="text-2xl font-bold">
                          {analytics.totalCustomers}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Average CLV
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(analytics.avgCLV)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          At Risk
                        </p>
                        <p className="text-2xl font-bold">
                          {analytics.atRiskCustomers?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Segment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Segment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {['VIP', 'REGULAR', 'NEW', 'AT_RISK', 'CHURNED'].map(
                      (seg) => {
                        const item = analytics.segmentDistribution?.find(
                          (s: any) => s.segment === seg,
                        );
                        return (
                          <div
                            key={seg}
                            className={`rounded-lg border p-4 text-center ${SEGMENT_STYLES[seg] || ''}`}
                          >
                            <div className="flex justify-center mb-2">
                              {SEGMENT_ICONS[seg]}
                            </div>
                            <p className="text-2xl font-bold">
                              {item?.count || 0}
                            </p>
                            <p className="text-xs mt-1">
                              {seg.replace(/_/g, ' ')}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => {
                      const item = analytics.tierDistribution?.find(
                        (t: any) => t.tier === tier,
                      );
                      return (
                        <div
                          key={tier}
                          className={`rounded-lg border p-4 text-center ${TIER_STYLES[tier] || ''}`}
                        >
                          <p className="text-2xl font-bold">
                            {item?.count || 0}
                          </p>
                          <p className="text-xs mt-1">{tier}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top 10 Customers by CLV */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Customers by Lifetime Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Segment</TableHead>
                          <TableHead>Tier</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">
                            Lifetime Value
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.topCustomers?.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-4 text-muted-foreground"
                            >
                              No customers yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          analytics.topCustomers?.map(
                            (c: any, idx: number) => (
                              <TableRow key={c.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell className="font-medium">
                                  {c.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {c.email || '-'}
                                </TableCell>
                                <TableCell>
                                  {c.segment && (
                                    <Badge
                                      variant="outline"
                                      className={
                                        SEGMENT_STYLES[c.segment] || ''
                                      }
                                    >
                                      {c.segment.replace(/_/g, ' ')}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {c.tier && (
                                    <Badge
                                      variant="outline"
                                      className={TIER_STYLES[c.tier] || ''}
                                    >
                                      {c.tier}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {c.totalOrders}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(c.lifetimeValue)}
                                </TableCell>
                              </TableRow>
                            ),
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* At-Risk Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    At-Risk Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Last Order</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">
                            Lifetime Value
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.atRiskCustomers?.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-4 text-muted-foreground"
                            >
                              No at-risk customers
                            </TableCell>
                          </TableRow>
                        ) : (
                          analytics.atRiskCustomers?.map((c: any) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium">
                                {c.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {c.email || '-'}
                              </TableCell>
                              <TableCell>
                                <span className="text-yellow-600 dark:text-yellow-400">
                                  {formatDate(c.lastOrderDate)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {c.totalOrders}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(c.lifetimeValue)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No analytics data available
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
