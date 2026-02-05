'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar, ChevronDown, Clock, Package, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BatchItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  daysToExpiry: number;
  location: string;
}

interface BatchExpiryTrackerProps {
  className?: string;
}

/**
 * Batch/Expiry Tracking Component
 * Tracks batch numbers and expiry dates for FIFO/FEFO inventory management
 */
export default function BatchExpiryTracker({ className }: BatchExpiryTrackerProps) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpiry, setFilterExpiry] = useState<'all' | 'expiring' | 'expired'>('all');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/inventory/batches');
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      // Demo data
      const today = new Date();
      setBatches([
        { id: '1', productId: 'p1', productName: 'Vitamin D3 1000IU', sku: 'VIT-D3', batchNumber: 'BD-2024-001', quantity: 120, manufacturingDate: '2024-06-15', expiryDate: '2026-06-15', daysToExpiry: Math.ceil((new Date('2026-06-15').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), location: 'Main Store' },
        { id: '2', productId: 'p2', productName: 'Omega 3 Fish Oil', sku: 'OMG-3', batchNumber: 'OF-2024-042', quantity: 45, manufacturingDate: '2024-01-10', expiryDate: '2025-01-10', daysToExpiry: Math.ceil((new Date('2025-01-10').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), location: 'Main Store' },
        { id: '3', productId: 'p3', productName: 'Protein Powder Whey', sku: 'PPW-1KG', batchNumber: 'PP-2024-089', quantity: 28, manufacturingDate: '2024-09-01', expiryDate: '2025-09-01', daysToExpiry: Math.ceil((new Date('2025-09-01').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), location: 'Warehouse' },
        { id: '4', productId: 'p4', productName: 'Energy Drink Mix', sku: 'EDM-500', batchNumber: 'ED-2024-015', quantity: 200, manufacturingDate: '2024-11-20', expiryDate: '2025-02-20', daysToExpiry: Math.ceil((new Date('2025-02-20').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), location: 'Main Store' },
        { id: '5', productId: 'p5', productName: 'Probiotic Capsules', sku: 'PRO-60', batchNumber: 'PB-2023-155', quantity: 15, manufacturingDate: '2023-08-01', expiryDate: '2024-08-01', daysToExpiry: -180, location: 'Main Store' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getExpiryStatus = (daysToExpiry: number) => {
    if (daysToExpiry < 0) return { color: 'destructive' as const, label: 'Expired', urgency: 'critical' };
    if (daysToExpiry <= 30) return { color: 'destructive' as const, label: 'Expiring Soon', urgency: 'high' };
    if (daysToExpiry <= 90) return { color: 'secondary' as const, label: 'Monitor', urgency: 'medium' };
    return { color: 'default' as const, label: 'Good', urgency: 'low' };
  };

  const filteredBatches = batches
    .filter(batch => {
      const matchesSearch = batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterExpiry === 'expiring') return matchesSearch && batch.daysToExpiry > 0 && batch.daysToExpiry <= 90;
      if (filterExpiry === 'expired') return matchesSearch && batch.daysToExpiry < 0;
      return matchesSearch;
    })
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  const stats = {
    total: batches.length,
    expiring: batches.filter(b => b.daysToExpiry > 0 && b.daysToExpiry <= 90).length,
    expired: batches.filter(b => b.daysToExpiry < 0).length,
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-warning rounded-full" />
          <div>
            <h3 className="text-lg font-black tracking-tight">Batch & Expiry Tracking</h3>
            <p className="text-xs text-foreground/40 font-medium">FIFO/FEFO inventory management</p>
          </div>
        </div>
        <Button
          className="font-black bg-warning text-warning-foreground hover:bg-warning/90"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} className="mr-2" />
          Add Batch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-foreground/[0.02] border border-foreground/5 rounded-xl text-center">
          <p className="text-2xl font-black">{stats.total}</p>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Total Batches</p>
        </div>
        <div className="p-4 bg-warning/5 border border-warning/10 rounded-xl text-center cursor-pointer hover:border-warning/30 transition-colors"
             onClick={() => setFilterExpiry(filterExpiry === 'expiring' ? 'all' : 'expiring')}>
          <p className="text-2xl font-black text-warning">{stats.expiring}</p>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Expiring Soon</p>
        </div>
        <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl text-center cursor-pointer hover:border-destructive/30 transition-colors"
             onClick={() => setFilterExpiry(filterExpiry === 'expired' ? 'all' : 'expired')}>
          <p className="text-2xl font-black text-destructive">{stats.expired}</p>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Expired</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <Input
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground/5 h-10 pl-10"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="font-bold"
        >
          {filterExpiry === 'all' ? 'All Batches' : filterExpiry === 'expiring' ? 'Expiring' : 'Expired'}
          <ChevronDown size={14} className="ml-2" />
        </Button>
      </div>

      {/* Batch List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-foreground/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="font-bold text-foreground/50">No batches found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBatches.map((batch) => {
            const status = getExpiryStatus(batch.daysToExpiry);
            return (
              <div
                key={batch.id}
                className={`p-4 rounded-xl border transition-colors ${
                  batch.daysToExpiry < 0
                    ? 'bg-destructive/5 border-destructive/20'
                    : batch.daysToExpiry <= 30
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-foreground/[0.02] border-foreground/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-black text-sm">{batch.productName}</h4>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      {batch.sku} - Batch: {batch.batchNumber}
                    </p>
                  </div>
                  <Badge
                    variant={status.color}
                    className="font-black text-[10px] uppercase"
                  >
                    {batch.daysToExpiry <= 30 && <AlertTriangle size={10} className="mr-1" />}
                    {status.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Package size={12} className="text-foreground/40" />
                    <span className="font-bold">{batch.quantity} units</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-foreground/40" />
                    <span className="font-medium text-foreground/60">Exp: {batch.expiryDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className={batch.daysToExpiry < 0 ? 'text-destructive' : 'text-foreground/40'} />
                    <span className={`font-bold ${batch.daysToExpiry < 0 ? 'text-destructive' : ''}`}>
                      {batch.daysToExpiry < 0 ? `${Math.abs(batch.daysToExpiry)} days ago` : `${batch.daysToExpiry} days left`}
                    </span>
                  </div>
                </div>

                {batch.daysToExpiry > 0 && batch.daysToExpiry <= 90 && (
                  <Progress
                    value={Math.max(0, 100 - (batch.daysToExpiry / 90) * 100)}
                    className={`mt-3 h-1.5 ${batch.daysToExpiry <= 30 ? '[&>div]:bg-destructive' : '[&>div]:bg-warning'}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Batch Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Package size={20} className="text-warning" />
              <span className="font-black">Add New Batch</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Input placeholder="Search for product..." />
            </div>
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input placeholder="e.g., BD-2024-001" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Main Store" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacturing Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="font-black bg-warning text-warning-foreground hover:bg-warning/90">Add Batch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
