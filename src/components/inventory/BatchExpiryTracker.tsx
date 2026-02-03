'use client';

import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from '@heroui/react';
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
    if (daysToExpiry < 0) return { color: 'danger', label: 'Expired', urgency: 'critical' };
    if (daysToExpiry <= 30) return { color: 'danger', label: 'Expiring Soon', urgency: 'high' };
    if (daysToExpiry <= 90) return { color: 'warning', label: 'Monitor', urgency: 'medium' };
    return { color: 'success', label: 'Good', urgency: 'low' };
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
          color="warning" 
          className="font-black"
          onPress={() => setShowAddModal(true)}
          startContent={<Plus size={16} />}
        >
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
        <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl text-center cursor-pointer hover:border-danger/30 transition-colors"
             onClick={() => setFilterExpiry(filterExpiry === 'expired' ? 'all' : 'expired')}>
          <p className="text-2xl font-black text-danger">{stats.expired}</p>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Expired</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search batches..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<Search size={16} className="text-foreground/40" />}
          classNames={{ inputWrapper: 'bg-foreground/5 h-10' }}
          className="flex-1"
        />
        <Button
          variant="flat"
          size="sm"
          className="font-bold"
          endContent={<ChevronDown size={14} />}
        >
          {filterExpiry === 'all' ? 'All Batches' : filterExpiry === 'expiring' ? 'Expiring' : 'Expired'}
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
                    ? 'bg-danger/5 border-danger/20' 
                    : batch.daysToExpiry <= 30 
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-foreground/[0.02] border-foreground/5'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-black text-sm">{batch.productName}</h4>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      {batch.sku} • Batch: {batch.batchNumber}
                    </p>
                  </div>
                  <Chip 
                    color={status.color as 'danger' | 'warning' | 'success'}
                    variant="flat"
                    size="sm"
                    className="font-black text-[10px] uppercase"
                    startContent={batch.daysToExpiry <= 30 ? <AlertTriangle size={10} /> : null}
                  >
                    {status.label}
                  </Chip>
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
                    <Clock size={12} className={batch.daysToExpiry < 0 ? 'text-danger' : 'text-foreground/40'} />
                    <span className={`font-bold ${batch.daysToExpiry < 0 ? 'text-danger' : ''}`}>
                      {batch.daysToExpiry < 0 ? `${Math.abs(batch.daysToExpiry)} days ago` : `${batch.daysToExpiry} days left`}
                    </span>
                  </div>
                </div>

                {batch.daysToExpiry > 0 && batch.daysToExpiry <= 90 && (
                  <Progress 
                    value={Math.max(0, 100 - (batch.daysToExpiry / 90) * 100)} 
                    color={batch.daysToExpiry <= 30 ? 'danger' : 'warning'}
                    size="sm"
                    className="mt-3"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Batch Modal */}
      <Modal isOpen={showAddModal} onOpenChange={setShowAddModal} radius="lg">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Package size={20} className="text-warning" />
              <span className="font-black">Add New Batch</span>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input label="Product" placeholder="Search for product..." labelPlacement="outside" />
            <Input label="Batch Number" placeholder="e.g., BD-2024-001" labelPlacement="outside" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity" type="number" placeholder="0" labelPlacement="outside" />
              <Input label="Location" placeholder="Main Store" labelPlacement="outside" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Manufacturing Date" type="date" labelPlacement="outside" />
              <Input label="Expiry Date" type="date" labelPlacement="outside" />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setShowAddModal(false)}>Cancel</Button>
            <Button color="warning" className="font-black">Add Batch</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
