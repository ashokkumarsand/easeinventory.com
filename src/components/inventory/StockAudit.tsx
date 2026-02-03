'use client';

import { Button, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Textarea } from '@heroui/react';
import { AlertCircle, Check, CheckCircle, ClipboardList, Edit3, Package, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuditItem {
  id: string;
  name: string;
  sku: string;
  expectedStock: number;
  actualStock: number | null;
  variance: number | null;
  status: 'pending' | 'counted' | 'discrepancy';
  location: string;
}

interface StockAuditProps {
  locationId?: string;
  onComplete?: (auditId: string) => void;
}

/**
 * Stock Audit Component
 * Allows physical stock counting and variance tracking
 */
export default function StockAudit({ locationId, onComplete }: StockAuditProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [countInput, setCountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [auditInProgress, setAuditInProgress] = useState(false);

  useEffect(() => {
    fetchAuditItems();
  }, [locationId]);

  const fetchAuditItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/audit?locationId=${locationId || ''}`);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch audit items:', error);
      // Demo data
      setItems([
        { id: '1', name: 'iPhone 15 Pro', sku: 'IP15P-256', expectedStock: 12, actualStock: null, variance: null, status: 'pending', location: 'Main Store' },
        { id: '2', name: 'MacBook Pro M3', sku: 'MBP-M3-14', expectedStock: 5, actualStock: null, variance: null, status: 'pending', location: 'Main Store' },
        { id: '3', name: 'AirPods Pro 2', sku: 'APP2-USB', expectedStock: 24, actualStock: 22, variance: -2, status: 'discrepancy', location: 'Main Store' },
        { id: '4', name: 'Samsung S24 Ultra', sku: 'SS24U-256', expectedStock: 8, actualStock: 8, variance: 0, status: 'counted', location: 'Main Store' },
        { id: '5', name: 'iPad Air M2', sku: 'IPA-M2', expectedStock: 10, actualStock: null, variance: null, status: 'pending', location: 'Warehouse' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startAudit = () => {
    setAuditInProgress(true);
    setIsModalOpen(true);
  };

  const handleCountSubmit = () => {
    if (!selectedItem || countInput === '') return;

    const actualCount = parseInt(countInput);
    const variance = actualCount - selectedItem.expectedStock;
    
    setItems(items.map(item => 
      item.id === selectedItem.id 
        ? {
            ...item,
            actualStock: actualCount,
            variance,
            status: variance === 0 ? 'counted' : 'discrepancy',
          }
        : item
    ));

    setSelectedItem(null);
    setCountInput('');
    setNotes('');
  };

  const completeAudit = async () => {
    const uncounted = items.filter(i => i.status === 'pending').length;
    if (uncounted > 0) {
      if (!confirm(`${uncounted} items are still uncounted. Complete anyway?`)) return;
    }

    try {
      await fetch('/api/inventory/audit/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, notes }),
      });
      
      setAuditInProgress(false);
      setIsModalOpen(false);
      onComplete?.('audit-' + Date.now());
    } catch (error) {
      console.error('Failed to complete audit:', error);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const progress = {
    total: items.length,
    counted: items.filter(i => i.status !== 'pending').length,
    discrepancies: items.filter(i => i.status === 'discrepancy').length,
  };

  const getStatusColor = (status: AuditItem['status']) => {
    switch (status) {
      case 'counted': return 'success';
      case 'discrepancy': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-secondary rounded-full" />
          <div>
            <h3 className="text-lg font-black tracking-tight">Stock Audit</h3>
            <p className="text-xs text-foreground/40 font-medium">Physical count verification</p>
          </div>
        </div>
        <Button 
          color="secondary" 
          className="font-black"
          onPress={startAudit}
          startContent={<ClipboardList size={16} />}
        >
          {auditInProgress ? 'Continue Audit' : 'Start Audit'}
        </Button>
      </div>

      {/* Progress Summary */}
      {auditInProgress && (
        <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">Audit Progress</span>
            <span className="text-sm font-black">{progress.counted}/{progress.total} counted</span>
          </div>
          <Progress 
            value={(progress.counted / progress.total) * 100} 
            color="secondary" 
            size="md" 
            className="mb-2"
          />
          {progress.discrepancies > 0 && (
            <div className="flex items-center gap-2 text-danger text-xs font-bold mt-2">
              <AlertCircle size={14} />
              {progress.discrepancies} discrepancies found
            </div>
          )}
        </div>
      )}

      {/* Recent Audit Items */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-foreground/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-foreground/5 rounded-xl hover:border-secondary/20 transition-colors cursor-pointer"
              onClick={() => {
                if (auditInProgress) {
                  setSelectedItem(item);
                  setCountInput(item.actualStock?.toString() || '');
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.status === 'counted' ? 'bg-success/10' : 
                  item.status === 'discrepancy' ? 'bg-danger/10' : 'bg-foreground/5'
                }`}>
                  {item.status === 'counted' ? <Check size={18} className="text-success" /> :
                   item.status === 'discrepancy' ? <AlertCircle size={18} className="text-danger" /> :
                   <Package size={18} className="text-foreground/40" />}
                </div>
                <div>
                  <h4 className="font-black text-sm">{item.name}</h4>
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                    {item.sku} • {item.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-black text-lg">{item.actualStock ?? '—'}</p>
                  <p className="text-[10px] font-bold text-foreground/40">of {item.expectedStock} expected</p>
                </div>
                <Chip 
                  color={getStatusColor(item.status)}
                  variant="flat"
                  size="sm"
                  className="font-black text-[10px] uppercase"
                >
                  {item.status === 'discrepancy' && item.variance !== null ? 
                    (item.variance > 0 ? `+${item.variance}` : item.variance) : 
                    item.status
                  }
                </Chip>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen}
        size="3xl"
        scrollBehavior="inside"
        radius="lg"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <ClipboardList size={20} className="text-secondary" />
              <div>
                <h3 className="font-black text-lg">Physical Stock Count</h3>
                <p className="text-xs text-foreground/50 font-medium">{progress.counted}/{progress.total} items counted</p>
              </div>
            </div>
          </ModalHeader>
          
          <ModalBody className="space-y-6">
            {/* Search */}
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={16} className="text-foreground/40" />}
              classNames={{
                inputWrapper: 'bg-foreground/5 h-12',
              }}
            />

            {/* Item List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                    selectedItem?.id === item.id 
                      ? 'border-secondary bg-secondary/5' 
                      : 'border-foreground/5 hover:border-secondary/20'
                  }`}
                  onClick={() => {
                    setSelectedItem(item);
                    setCountInput(item.actualStock?.toString() || '');
                  }}
                >
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-[10px] text-foreground/40">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-foreground/40">Expected: {item.expectedStock}</span>
                    <Chip color={getStatusColor(item.status)} variant="flat" size="sm" className="font-bold">
                      {item.actualStock ?? 'Not counted'}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>

            {/* Count Input */}
            {selectedItem && (
              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                <h4 className="font-black text-sm mb-3">Count: {selectedItem.name}</h4>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Enter count"
                    value={countInput}
                    onValueChange={setCountInput}
                    size="lg"
                    className="flex-1"
                    classNames={{ inputWrapper: 'h-14' }}
                    autoFocus
                  />
                  <Button 
                    color="secondary" 
                    size="lg"
                    onPress={handleCountSubmit}
                    className="font-black h-14 px-8"
                    startContent={<CheckCircle size={18} />}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {/* Notes */}
            <Textarea
              label="Audit Notes"
              placeholder="Any observations or discrepancy explanations..."
              value={notes}
              onValueChange={setNotes}
              minRows={2}
            />
          </ModalBody>
          
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              Save & Close
            </Button>
            <Button 
              color="secondary" 
              className="font-black"
              onPress={completeAudit}
              startContent={<Edit3 size={16} />}
            >
              Complete Audit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
