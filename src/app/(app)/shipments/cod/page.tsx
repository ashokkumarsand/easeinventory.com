'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, TextCell } from '@/components/ui/DataTable';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColDef } from 'ag-grid-community';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  RefreshCw,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CODManagementPage() {
  const [pending, setPending] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, analyticsRes] = await Promise.all([
        fetch('/api/cod/pending'),
        fetch('/api/analytics/cod-analytics'),
      ]);
      const [pendingData, analyticsData] = await Promise.all([
        pendingRes.json(),
        analyticsRes.json(),
      ]);
      setPending(pendingData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch COD data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingColumns: ColDef<any>[] = [
    {
      field: 'shipmentNumber',
      headerName: 'Shipment #',
      width: 160,
      cellRenderer: (props: any) => (
        <Link href={`/shipments/${props.data.id}`} className="text-primary font-medium hover:underline">
          {props.value}
        </Link>
      ),
    },
    {
      field: 'awbNumber',
      headerName: 'AWB',
      width: 150,
      cellRenderer: (props: any) => <TextCell value={props.value || '—'} />,
    },
    {
      field: 'order',
      headerName: 'Order',
      width: 150,
      cellRenderer: (props: any) => <TextCell value={props.data.order?.orderNumber || '—'} />,
    },
    {
      field: 'order.shippingName',
      headerName: 'Customer',
      flex: 1,
      cellRenderer: (props: any) => <TextCell value={props.data.order?.shippingName || '—'} />,
    },
    {
      field: 'codAmount',
      headerName: 'COD Amount',
      width: 140,
      cellRenderer: (props: any) => (
        <span className="font-bold text-primary">
          ₹{Number(props.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      field: 'deliveredAt',
      headerName: 'Delivered On',
      width: 140,
      cellRenderer: (props: any) => (
        <TextCell value={props.value ? new Date(props.value).toLocaleDateString('en-IN') : '—'} />
      ),
    },
    {
      field: 'codCollected',
      headerName: 'Collected',
      width: 110,
      cellRenderer: (props: any) => (
        <Badge variant={props.value ? 'default' : 'outline'}>
          {props.value ? 'Yes' : 'Pending'}
        </Badge>
      ),
    },
  ];

  const fmt = (v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IndianRupee className="w-8 h-8" />
            COD Management
          </h1>
          <p className="text-foreground/50 mt-1">
            Track Cash on Delivery collections, analytics, and carrier remittances
          </p>
        </div>
        <Button variant="outline" onClick={fetchAll} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending COD</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ============ PENDING TAB ============ */}
      {activeTab === 'pending' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-foreground/60">Total Pending COD</div>
                <div className="text-3xl font-bold text-primary mt-1">
                  {fmt(pending?.totalPending || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-foreground/60">Pending Shipments</div>
                <div className="text-3xl font-bold mt-1">
                  {pending?.count || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-foreground/60">Average COD Value</div>
                <div className="text-3xl font-bold mt-1">
                  ₹{pending?.count > 0
                    ? ((pending?.totalPending || 0) / pending.count).toLocaleString('en-IN', { minimumFractionDigits: 0 })
                    : '0'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending COD Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending COD Remittance</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={pending?.shipments || []}
                columns={pendingColumns}
                isLoading={isLoading}
                height={500}
                rowHeight={56}
                headerHeight={52}
                emptyMessage="No pending COD remittances"
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* ============ ANALYTICS TAB ============ */}
      {activeTab === 'analytics' && (
        <>
          {isLoading && !analytics ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Analytics KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <IndianRupee className="w-4 h-4" /> Total COD Value
                    </div>
                    <div className="text-2xl font-bold mt-1">{fmt(analytics?.totalCodValue || 0)}</div>
                    <div className="text-xs text-foreground/40 mt-1">
                      {analytics?.totalCodShipments || 0} shipments
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <CheckCircle2 className="w-4 h-4" /> Collected
                    </div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{fmt(analytics?.collectedValue || 0)}</div>
                    <div className="text-xs text-foreground/40 mt-1">
                      {analytics?.collectedCount || 0} shipments
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Clock className="w-4 h-4" /> Pending
                    </div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">{fmt(analytics?.pendingValue || 0)}</div>
                    <div className="text-xs text-foreground/40 mt-1">
                      {analytics?.pendingCount || 0} shipments
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <BarChart3 className="w-4 h-4" /> Collection Rate
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${
                      (analytics?.collectionRate || 0) >= 80 ? 'text-green-600' :
                      (analytics?.collectionRate || 0) >= 50 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {(analytics?.collectionRate || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-foreground/40 mt-1">
                      Avg: {fmt(analytics?.avgCodValue || 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Carrier Breakdown + Aging */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Carrier Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" /> COD by Carrier
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.carrierBreakdown?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-foreground/10">
                              <th className="text-left py-2 px-2 font-medium text-foreground/60">Carrier</th>
                              <th className="text-right py-2 px-2 font-medium text-foreground/60">Total</th>
                              <th className="text-right py-2 px-2 font-medium text-foreground/60">Collected</th>
                              <th className="text-right py-2 px-2 font-medium text-foreground/60">Pending</th>
                              <th className="text-right py-2 px-2 font-medium text-foreground/60">Pending ₹</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.carrierBreakdown.map((c: any) => (
                              <tr key={c.carrier} className="border-b border-foreground/5">
                                <td className="py-2 px-2 font-medium">{c.carrier}</td>
                                <td className="py-2 px-2 text-right">{c.total}</td>
                                <td className="py-2 px-2 text-right text-green-600">{c.collected}</td>
                                <td className="py-2 px-2 text-right text-amber-600">{c.pending}</td>
                                <td className="py-2 px-2 text-right font-medium text-red-600">
                                  {fmt(c.pendingValue)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-foreground/30">
                        No carrier data
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Aging Buckets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Pending COD Aging
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.agingBuckets?.some((b: any) => b.count > 0) ? (
                      <div className="space-y-4">
                        {analytics.agingBuckets.map((bucket: any) => {
                          const maxValue = Math.max(...analytics.agingBuckets.map((b: any) => b.value));
                          const pct = maxValue > 0 ? (bucket.value / maxValue) * 100 : 0;
                          const isOld = bucket.bucket.includes('15') || bucket.bucket.includes('30+');

                          return (
                            <div key={bucket.bucket}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className={`font-medium ${isOld ? 'text-red-600' : 'text-foreground/70'}`}>
                                  {bucket.bucket}
                                </span>
                                <span className="text-foreground/60">
                                  {bucket.count} shipments &middot; {fmt(bucket.value)}
                                </span>
                              </div>
                              <div className="w-full bg-foreground/5 rounded-full h-2">
                                <div
                                  className={`rounded-full h-2 transition-all ${isOld ? 'bg-red-500' : 'bg-amber-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-foreground/30">
                        No pending COD
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {/* ============ RECONCILIATION TAB ============ */}
      {activeTab === 'reconciliation' && (
        <>
          {isLoading && !analytics ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Remittance Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground/60">Total Remittances</div>
                    <div className="text-2xl font-bold mt-1">
                      {analytics?.remittanceSummary?.totalRemittances || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground/60">Total Remitted</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {fmt(analytics?.remittanceSummary?.paidAmount || 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground/60">Pending Remittances</div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">
                      {analytics?.remittanceSummary?.pendingRemittances || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-foreground/60">Pending Amount</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">
                      {fmt(analytics?.remittanceSummary?.pendingAmount || 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reconciliation Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Reconciliation Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* COD Collected vs Remitted */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-foreground/[0.02] rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-foreground/60 mb-1">COD Collected</div>
                        <div className="text-xl font-bold">{fmt(analytics?.collectedValue || 0)}</div>
                        <div className="text-xs text-foreground/40">{analytics?.collectedCount || 0} shipments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-foreground/60 mb-1">Remitted to You</div>
                        <div className="text-xl font-bold text-green-600">{fmt(analytics?.remittanceSummary?.paidAmount || 0)}</div>
                        <div className="text-xs text-foreground/40">{analytics?.remittanceSummary?.totalRemittances || 0} batches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-foreground/60 mb-1">Unreconciled</div>
                        <div className="text-xl font-bold text-amber-600">
                          {fmt(Math.max(0, (analytics?.collectedValue || 0) - (analytics?.remittanceSummary?.paidAmount || 0)))}
                        </div>
                        <div className="text-xs text-foreground/40">Collected but not yet remitted</div>
                      </div>
                    </div>

                    {/* Collection Rate Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Overall Collection Rate</span>
                        <span className={`font-bold ${
                          (analytics?.collectionRate || 0) >= 80 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {(analytics?.collectionRate || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-foreground/10 rounded-full h-3">
                        <div
                          className={`rounded-full h-3 transition-all ${
                            (analytics?.collectionRate || 0) >= 80 ? 'bg-green-500' :
                            (analytics?.collectionRate || 0) >= 50 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${analytics?.collectionRate || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-foreground/40 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Pending COD by Age */}
                    {analytics?.agingBuckets?.some((b: any) => b.count > 0) && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-3">Overdue Collections by Age</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {analytics.agingBuckets.map((bucket: any) => (
                            <div
                              key={bucket.bucket}
                              className={`rounded-lg p-3 text-center ${
                                bucket.bucket.includes('30+') ? 'bg-red-50 dark:bg-red-900/20' :
                                bucket.bucket.includes('15') ? 'bg-amber-50 dark:bg-amber-900/20' :
                                'bg-foreground/[0.03]'
                              }`}
                            >
                              <div className="text-lg font-bold">{bucket.count}</div>
                              <div className="text-xs text-foreground/50">{bucket.bucket}</div>
                              <div className="text-xs font-medium mt-1">{fmt(bucket.value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
