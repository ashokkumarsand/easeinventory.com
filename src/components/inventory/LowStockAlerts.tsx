'use client';

import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from '@heroui/react';
import { AlertTriangle, Bell, BellOff, Package, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category: string;
}

interface LowStockAlertsProps {
  className?: string;
}

/**
 * Low Stock Alerts Component
 * Shows products that are below minimum stock threshold
 */
export default function LowStockAlerts({ className }: LowStockAlertsProps) {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/inventory/low-stock');
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
      // Use demo data when API fails
      setItems([
        { id: '1', name: 'iPhone 15 Pro', sku: 'IP15P-256', currentStock: 2, minStock: 5, category: 'Smartphones' },
        { id: '2', name: 'MacBook Pro M3', sku: 'MBP-M3-14', currentStock: 1, minStock: 3, category: 'Laptops' },
        { id: '3', name: 'AirPods Pro 2', sku: 'APP2-USB', currentStock: 4, minStock: 10, category: 'Audio' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStockLevel = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return { color: 'danger', label: 'Critical' };
    if (percentage <= 50) return { color: 'warning', label: 'Low' };
    return { color: 'primary', label: 'Moderate' };
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-danger rounded-full" />
          <div>
            <h3 className="text-lg font-black tracking-tight">Low Stock Alerts</h3>
            <p className="text-xs text-foreground/40 font-medium">{items.length} items need attention</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            isIconOnly 
            variant="flat" 
            size="sm" 
            onPress={() => setShowSettings(true)}
            className="rounded-xl"
          >
            <Settings size={16} />
          </Button>
          <Chip 
            color={alertsEnabled ? 'success' : 'default'}
            variant="flat"
            startContent={alertsEnabled ? <Bell size={12} /> : <BellOff size={12} />}
            className="font-bold"
          >
            {alertsEnabled ? 'Alerts On' : 'Alerts Off'}
          </Chip>
        </div>
      </div>

      {/* Low Stock Items */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-foreground/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="font-bold text-foreground/50">All products are well-stocked!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const level = getStockLevel(item.currentStock, item.minStock);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-foreground/5 rounded-xl hover:border-danger/20 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-${level.color}/10 flex items-center justify-center`}>
                    <AlertTriangle size={18} className={`text-${level.color}`} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm group-hover:text-danger transition-colors">{item.name}</h4>
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      {item.sku} • {item.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-lg">{item.currentStock}</p>
                    <p className="text-[10px] font-bold text-foreground/40">of {item.minStock} min</p>
                  </div>
                  <Chip 
                    color={level.color as 'danger' | 'warning' | 'primary'}
                    variant="flat"
                    size="sm"
                    className="font-black text-[10px] uppercase"
                  >
                    {level.label}
                  </Chip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Reorder Button */}
      {items.length > 0 && (
        <Button 
          color="danger" 
          variant="flat"
          className="w-full mt-4 font-black"
          startContent={<Package size={16} />}
        >
          Quick Reorder All ({items.length} items)
        </Button>
      )}

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onOpenChange={setShowSettings} radius="lg">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-primary" />
              <span className="font-black">Alert Settings</span>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Enable Alerts</p>
                <p className="text-xs text-foreground/50">Show low stock notifications</p>
              </div>
              <Switch isSelected={alertsEnabled} onValueChange={setAlertsEnabled} color="success" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">Email Notifications</p>
                <p className="text-xs text-foreground/50">Get daily email summaries</p>
              </div>
              <Switch isSelected={emailAlerts} onValueChange={setEmailAlerts} color="primary" />
            </div>
            <div>
              <p className="font-bold mb-2">Default Threshold</p>
              <p className="text-xs text-foreground/50 mb-3">
                Alert when stock falls below this percentage of minimum
              </p>
              <div className="flex items-center gap-4">
                {[5, 10, 15, 20].map((val) => (
                  <Button
                    key={val}
                    variant={threshold === val ? 'solid' : 'flat'}
                    color={threshold === val ? 'primary' : 'default'}
                    size="sm"
                    onPress={() => setThreshold(val)}
                    className="font-bold"
                  >
                    {val} units
                  </Button>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setShowSettings(false)} className="font-black">
              Save Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
