'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormRow, StyledInput, StyledSelect } from '@/components/ui/FormField';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  Loader2,
  Plus,
  Settings,
  Truck,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CarrierSettingsPage() {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addDialog = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [provider, setProvider] = useState('SHIPROCKET');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [pickupLocationName, setPickupLocationName] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    fetchCarriers();
  }, []);

  const fetchCarriers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/carriers');
      const data = await res.json();
      setCarriers(data.carriers || []);
    } catch (err) {
      console.error('Failed to fetch carriers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name) {
      alert('Account name is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          name,
          apiKey,
          apiSecret,
          pickupLocationName,
          isDefault,
        }),
      });

      if (res.ok) {
        addDialog.onClose();
        resetForm();
        fetchCarriers();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add carrier');
      }
    } catch {
      alert('Failed to add carrier');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setProvider('SHIPROCKET');
    setName('');
    setApiKey('');
    setApiSecret('');
    setPickupLocationName('');
    setIsDefault(false);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Carrier Settings
          </h1>
          <p className="text-foreground/50 mt-1">
            Configure shipping carrier accounts for automated shipments
          </p>
        </div>
        <Button onClick={addDialog.onOpen} size="lg">
          <Plus className="w-4 h-4 mr-2" /> Add Carrier
        </Button>
      </div>

      {/* Carrier Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : carriers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Truck className="w-12 h-12 text-foreground/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">No carrier accounts</h3>
            <p className="text-foreground/50 mb-4">Add a carrier to start shipping orders via Shiprocket, Delhivery, etc.</p>
            <Button onClick={addDialog.onOpen}>
              <Plus className="w-4 h-4 mr-2" /> Add Carrier Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {carriers.map((carrier) => (
            <Card key={carrier.id}>
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-lg">{carrier.name}</div>
                    <div className="text-sm text-foreground/50 flex items-center gap-2">
                      <Badge variant="outline">{carrier.provider}</Badge>
                      {carrier.pickupLocationName && (
                        <span>Pickup: {carrier.pickupLocationName}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {carrier.isDefault && (
                    <Badge variant="default">Default</Badge>
                  )}
                  <Badge variant={carrier.isActive ? 'default' : 'destructive'}>
                    {carrier.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Carrier Dialog */}
      <Dialog open={addDialog.isOpen} onOpenChange={addDialog.onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Carrier Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <StyledSelect
              label="Carrier Provider"
              value={provider}
              onChange={setProvider}
              options={[
                { value: 'SHIPROCKET', label: 'Shiprocket' },
                { value: 'DELHIVERY', label: 'Delhivery' },
                { value: 'OWN_FLEET', label: 'Own Fleet' },
              ]}
            />
            <StyledInput
              label="Account Name"
              placeholder="e.g., Shiprocket - Main Account"
              value={name}
              onChange={setName}
              required
            />
            {provider !== 'OWN_FLEET' && (
              <>
                <StyledInput
                  label={provider === 'SHIPROCKET' ? 'Email' : 'API Key'}
                  placeholder={provider === 'SHIPROCKET' ? 'your@email.com' : 'API Key'}
                  value={apiKey}
                  onChange={setApiKey}
                />
                <StyledInput
                  label={provider === 'SHIPROCKET' ? 'Password' : 'API Secret'}
                  placeholder={provider === 'SHIPROCKET' ? 'Password' : 'API Secret'}
                  value={apiSecret}
                  onChange={setApiSecret}
                  type="password"
                />
              </>
            )}
            <StyledInput
              label="Pickup Location Name"
              placeholder="e.g., Primary"
              value={pickupLocationName}
              onChange={setPickupLocationName}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Set as default carrier</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { addDialog.onClose(); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Carrier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
