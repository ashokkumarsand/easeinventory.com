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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  IndianRupee,
  Loader2,
  Search,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PayablesSummary {
  totalOutstanding: number;
  totalOverdue: number;
  paidLast30Days: number;
  avgDaysToPay: number;
  aging: { label: string; amount: number; count: number }[];
}

interface CreditStatus {
  supplierId: string;
  supplierName: string;
  creditLimit: number;
  outstanding: number;
  utilization: number;
}

interface Payable {
  id: string;
  poNumber: string;
  total: number;
  paidAmount: number;
  outstanding: number;
  paymentStatus: string;
  dueDate: string | null;
  createdAt: string;
  supplier: { id: string; name: string };
}

const AGING_COLORS = [
  'bg-green-500/20 text-green-400 border-green-500/30',
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-red-700/20 text-red-300 border-red-700/30',
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PARTIAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
  OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SupplierPayablesPage() {
  const [summary, setSummary] = useState<PayablesSummary | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditStatus[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [totalPayables, setTotalPayables] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);

  // Filters
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<Payable | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMode: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchPayables();
  }, [filterSupplier, filterStatus, search, page]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, creditRes, suppliersRes] = await Promise.all([
        fetch('/api/supplier-payments/summary'),
        fetch('/api/supplier-payments/credit-status'),
        fetch('/api/suppliers'),
      ]);
      const [summaryData, creditData, suppliersData] = await Promise.all([
        summaryRes.json(),
        creditRes.json(),
        suppliersRes.json(),
      ]);
      setSummary(summaryData);
      setCreditStatus(creditData);
      setSuppliers(
        (suppliersData.data || suppliersData || []).map((s: any) => ({ id: s.id, name: s.name })),
      );
    } catch (err) {
      console.error('Failed to fetch payables data:', err);
    } finally {
      setIsLoading(false);
    }
    fetchPayables();
  };

  const fetchPayables = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSupplier !== 'all') params.set('supplierId', filterSupplier);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (search) params.set('search', search);
      params.set('page', String(page));

      const res = await fetch(`/api/supplier-payments?${params}`);
      const json = await res.json();
      setPayables(json.data || []);
      setTotalPayables(json.total || 0);
    } catch (err) {
      console.error('Failed to fetch payables list:', err);
    }
  };

  const openPaymentDialog = (po: Payable) => {
    setSelectedPO(po);
    setPaymentForm({
      amount: String(po.outstanding),
      paymentMode: 'BANK_TRANSFER',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      notes: '',
    });
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedPO) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/supplier-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId: selectedPO.id,
          amount: Number(paymentForm.amount),
          paymentMode: paymentForm.paymentMode,
          paymentDate: paymentForm.paymentDate,
          referenceNumber: paymentForm.referenceNumber || undefined,
          notes: paymentForm.notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Failed to record payment');
        return;
      }

      setPaymentDialogOpen(false);
      fetchAll();
    } catch (err) {
      console.error('Payment recording failed:', err);
      alert('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalPages = Math.ceil(totalPayables / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/suppliers">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Supplier Payables</h1>
          </div>
          <p className="text-foreground/40 font-bold ml-12">
            Track outstanding payments, aging analysis, and credit utilization.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <IndianRupee className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50 font-medium">Total Outstanding</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalOutstanding)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50 font-medium">Overdue Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalOverdue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50 font-medium">Paid Last 30 Days</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.paidLast30Days)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50 font-medium">Avg Days to Pay</p>
                  <p className="text-2xl font-bold">{summary.avgDaysToPay} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging Analysis */}
      {summary && summary.aging.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {summary.aging.map((bucket, idx) => (
                <div
                  key={bucket.label}
                  className={`flex-1 min-w-[140px] rounded-lg border p-4 text-center ${AGING_COLORS[idx]}`}
                >
                  <p className="text-xs font-medium opacity-80">{bucket.label}</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(bucket.amount)}</p>
                  <p className="text-xs opacity-60 mt-1">{bucket.count} PO{bucket.count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit Utilization */}
      {creditStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credit Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-foreground/50">
                    <th className="text-left py-3 px-4 font-medium">SUPPLIER</th>
                    <th className="text-right py-3 px-4 font-medium">CREDIT LIMIT</th>
                    <th className="text-right py-3 px-4 font-medium">OUTSTANDING</th>
                    <th className="text-right py-3 px-4 font-medium">UTILIZATION</th>
                    <th className="py-3 px-4 font-medium w-40"></th>
                  </tr>
                </thead>
                <tbody>
                  {creditStatus.map((cs) => (
                    <tr key={cs.supplierId} className="border-b border-border/20">
                      <td className="py-3 px-4 font-medium">{cs.supplierName}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(cs.creditLimit)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(cs.outstanding)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={cs.utilization > 80 ? 'text-red-400' : cs.utilization > 50 ? 'text-amber-400' : 'text-green-400'}>
                          {cs.utilization}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Progress
                          value={Math.min(cs.utilization, 100)}
                          className="h-2"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payables List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Outstanding Payables</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <Input
                  placeholder="Search PO..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 w-48"
                />
              </div>
              <Select value={filterSupplier} onValueChange={(v) => { setFilterSupplier(v); setPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-foreground/50">
                  <th className="text-left py-3 px-4 font-medium">PO NUMBER</th>
                  <th className="text-left py-3 px-4 font-medium">SUPPLIER</th>
                  <th className="text-right py-3 px-4 font-medium">TOTAL</th>
                  <th className="text-right py-3 px-4 font-medium">PAID</th>
                  <th className="text-right py-3 px-4 font-medium">OUTSTANDING</th>
                  <th className="text-left py-3 px-4 font-medium">DUE DATE</th>
                  <th className="text-left py-3 px-4 font-medium">STATUS</th>
                  <th className="text-right py-3 px-4 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {payables.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-foreground/40">
                      No outstanding payables found.
                    </td>
                  </tr>
                ) : (
                  payables.map((po) => (
                    <tr key={po.id} className="border-b border-border/20 hover:bg-foreground/5">
                      <td className="py-3 px-4">
                        <Link href={`/purchase-orders/${po.id}`} className="text-primary hover:underline font-medium">
                          {po.poNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{po.supplier.name}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(po.total)}</td>
                      <td className="py-3 px-4 text-right text-green-400">{formatCurrency(po.paidAmount)}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatCurrency(po.outstanding)}</td>
                      <td className="py-3 px-4">
                        {po.dueDate
                          ? new Date(po.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={STATUS_BADGE[po.paymentStatus] || ''}>
                          {po.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {po.paymentStatus !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPaymentDialog(po)}
                          >
                            Record Payment
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-foreground/50">
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, totalPayables)} of {totalPayables}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment against {selectedPO?.poNumber} — {selectedPO?.supplier.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-foreground/50">PO Total</span>
                <p className="font-bold">{formatCurrency(selectedPO?.total || 0)}</p>
              </div>
              <div>
                <span className="text-foreground/50">Outstanding</span>
                <p className="font-bold text-red-400">{formatCurrency(selectedPO?.outstanding || 0)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={selectedPO?.outstanding || 0}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select
                value={paymentForm.paymentMode}
                onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMode: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Reference Number (UTR / Cheque No.)</Label>
              <Input
                placeholder="Optional"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={isSubmitting || !paymentForm.amount || Number(paymentForm.amount) <= 0}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
