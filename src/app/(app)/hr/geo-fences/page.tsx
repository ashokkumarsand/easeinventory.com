'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDisclosure } from '@/hooks/useDisclosure';
import {
  Edit,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface GeoFence {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export default function GeoFencesPage() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    radius: '100',
    isActive: true,
    isDefault: false,
  });

  const fetchGeoFences = async () => {
    try {
      const response = await fetch('/api/hr/geo-fences');
      if (response.ok) {
        const data = await response.json();
        setGeoFences(data.geoFences || []);
      }
    } catch (error) {
      console.error('Failed to fetch geo-fences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGeoFences();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      radius: '100',
      isActive: true,
      isDefault: false,
    });
    setEditingId(null);
  };

  const handleEdit = (geoFence: GeoFence) => {
    setEditingId(geoFence.id);
    setFormData({
      name: geoFence.name,
      description: geoFence.description || '',
      latitude: geoFence.latitude.toString(),
      longitude: geoFence.longitude.toString(),
      radius: geoFence.radius.toString(),
      isActive: geoFence.isActive,
      isDefault: geoFence.isDefault,
    });
    onOpen();
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location. Please enter coordinates manually.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(editingId && { id: editingId }),
        name: formData.name,
        description: formData.description || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius) || 100,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
      };

      const method = editingId ? 'PATCH' : 'POST';
      const response = await fetch('/api/hr/geo-fences', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchGeoFences();
        resetForm();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save geo-fence');
      }
    } catch (error) {
      console.error('Save geo-fence error:', error);
      alert('Failed to save geo-fence');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this geo-fence?')) return;

    try {
      const response = await fetch(`/api/hr/geo-fences?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchGeoFences();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete geo-fence');
      }
    } catch (error) {
      console.error('Delete geo-fence error:', error);
      alert('Failed to delete geo-fence');
    }
  };

  const handleToggleActive = async (geoFence: GeoFence) => {
    try {
      const response = await fetch('/api/hr/geo-fences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: geoFence.id, isActive: !geoFence.isActive }),
      });

      if (response.ok) {
        fetchGeoFences();
      }
    } catch (error) {
      console.error('Toggle geo-fence error:', error);
    }
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Target size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-heading">Geo-Fences</h1>
          </div>
          <p className="text-foreground/50 font-bold ml-1">
            Define allowed locations for employee attendance
          </p>
        </div>
        <Button
          className="font-black rounded-2xl"
          onClick={() => {
            resetForm();
            onOpen();
          }}
        >
          <Plus size={18} />
          Add Location
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border border-primary/10 rounded-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold mb-1">How Geo-Fencing Works</h3>
              <p className="text-sm opacity-60">
                Employees can only punch in/out when they are within the defined radius of an active geo-fence location.
                If no geo-fences are defined, attendance can be marked from anywhere.
                Set a location as "Default" to highlight it as the primary work location.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geo-Fences Table */}
      <Card className="modern-card rounded-lg">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">LOCATION</th>
                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">COORDINATES</th>
                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">RADIUS</th>
                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">STATUS</th>
                <th className="h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : geoFences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 opacity-60">
                    No geo-fences defined. Attendance can be marked from anywhere.
                  </td>
                </tr>
              ) : (
                geoFences.map((geoFence) => (
                  <tr key={geoFence.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${geoFence.isDefault ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5'}`}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-2">
                            {geoFence.name}
                            {geoFence.isDefault && (
                              <Badge variant="secondary" className="text-[8px]">DEFAULT</Badge>
                            )}
                          </p>
                          {geoFence.description && (
                            <p className="text-xs opacity-50 truncate max-w-[200px]">{geoFence.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="font-mono text-xs"
                        onClick={() => openInMaps(geoFence.latitude, geoFence.longitude)}
                      >
                        <Navigation size={12} />
                        {geoFence.latitude.toFixed(4)}, {geoFence.longitude.toFixed(4)}
                      </Button>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold">{geoFence.radius}m</span>
                    </td>
                    <td className="py-4 px-6">
                      <Switch
                        checked={geoFence.isActive}
                        onCheckedChange={() => handleToggleActive(geoFence)}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(geoFence)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(geoFence.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-black">
              {editingId ? 'Edit Geo-Fence' : 'Add Attendance Location'}
            </DialogTitle>
            <DialogDescription>
              Configure geo-fence location settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location Name *</label>
              <Input
                placeholder="e.g., Main Office, Warehouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                placeholder="Additional details about this location..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude *</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 28.6139"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude *</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 77.2090"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Navigation size={18} />
              Use My Current Location
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Radius (meters)</label>
              <Input
                type="number"
                placeholder="100"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">How far from the center point attendance is allowed</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                />
                <span className="text-sm font-bold">Active</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(v) => setFormData({ ...formData, isDefault: v })}
                />
                <span className="text-sm font-bold">Set as Default</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Add'} Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
