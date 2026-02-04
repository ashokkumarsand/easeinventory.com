'use client';

import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import {
  Edit,
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
            <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center text-success">
              <Target size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Geo-Fences</h1>
          </div>
          <p className="text-black/40 dark:text-white/40 font-bold ml-1">
            Define allowed locations for employee attendance
          </p>
        </div>
        <Button
          color="primary"
          className="font-black rounded-2xl"
          startContent={<Plus size={18} />}
          onClick={() => {
            resetForm();
            onOpen();
          }}
        >
          Add Location
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border border-primary/10" radius="lg">
        <CardBody className="p-6">
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
        </CardBody>
      </Card>

      {/* Geo-Fences Table */}
      <Card className="modern-card" radius="lg">
        <CardBody className="p-0">
          <Table
            aria-label="Geo-Fences"
            classNames={{
              wrapper: 'p-0 bg-transparent shadow-none',
              th: 'bg-black/[0.02] dark:bg-white/[0.02] h-14 font-black uppercase tracking-wider text-[10px] opacity-40 px-6',
              td: 'py-4 px-6',
            }}
          >
            <TableHeader>
              <TableColumn>LOCATION</TableColumn>
              <TableColumn>COORDINATES</TableColumn>
              <TableColumn>RADIUS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner color="primary" />}
              emptyContent="No geo-fences defined. Attendance can be marked from anywhere."
            >
              {geoFences.map((geoFence) => (
                <TableRow key={geoFence.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${geoFence.isDefault ? 'bg-primary/10 text-primary' : 'bg-black/5 dark:bg-white/5'}`}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="font-bold flex items-center gap-2">
                          {geoFence.name}
                          {geoFence.isDefault && (
                            <Chip size="sm" color="primary" variant="flat" className="text-[8px]">DEFAULT</Chip>
                          )}
                        </p>
                        {geoFence.description && (
                          <p className="text-xs opacity-50 truncate max-w-[200px]">{geoFence.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="light"
                      className="font-mono text-xs"
                      onClick={() => openInMaps(geoFence.latitude, geoFence.longitude)}
                      startContent={<Navigation size={12} />}
                    >
                      {geoFence.latitude.toFixed(4)}, {geoFence.longitude.toFixed(4)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">{geoFence.radius}m</span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      isSelected={geoFence.isActive}
                      onValueChange={() => handleToggleActive(geoFence)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleEdit(geoFence)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => handleDelete(geoFence.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-black">
                {editingId ? 'Edit Geo-Fence' : 'Add Attendance Location'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                <Input
                  label="Location Name"
                  placeholder="e.g., Main Office, Warehouse"
                  value={formData.name}
                  onValueChange={(v) => setFormData({ ...formData, name: v })}
                  isRequired
                />

                <Textarea
                  label="Description (Optional)"
                  placeholder="Additional details about this location..."
                  value={formData.description}
                  onValueChange={(v) => setFormData({ ...formData, description: v })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 28.6139"
                    value={formData.latitude}
                    onValueChange={(v) => setFormData({ ...formData, latitude: v })}
                    isRequired
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 77.2090"
                    value={formData.longitude}
                    onValueChange={(v) => setFormData({ ...formData, longitude: v })}
                    isRequired
                  />
                </div>

                <Button
                  variant="flat"
                  color="primary"
                  className="w-full"
                  startContent={<Navigation size={18} />}
                  onClick={getCurrentLocation}
                  isLoading={isGettingLocation}
                >
                  Use My Current Location
                </Button>

                <Input
                  label="Radius (meters)"
                  type="number"
                  placeholder="100"
                  description="How far from the center point attendance is allowed"
                  value={formData.radius}
                  onValueChange={(v) => setFormData({ ...formData, radius: v })}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      isSelected={formData.isActive}
                      onValueChange={(v) => setFormData({ ...formData, isActive: v })}
                    />
                    <span className="text-sm font-bold">Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      isSelected={formData.isDefault}
                      onValueChange={(v) => setFormData({ ...formData, isDefault: v })}
                    />
                    <span className="text-sm font-bold">Set as Default</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit} isLoading={isSaving}>
                  {editingId ? 'Update' : 'Add'} Location
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
