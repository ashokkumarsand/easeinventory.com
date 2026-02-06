'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewCycleCountPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    locationId: '',
    type: 'FULL',
    blindCount: false,
    abcFilter: '',
    scheduledDate: '',
    assignedToId: '',
    notes: '',
  });

  useEffect(() => {
    // Fetch locations
    fetch('/api/locations')
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : data.locations || []))
      .catch(() => {});

    // Fetch users for assignment
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.locationId) {
      setError('Please select a location');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/cycle-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: form.locationId,
          type: form.type,
          blindCount: form.blindCount,
          abcFilter: form.type === 'ABC_BASED' ? form.abcFilter || null : null,
          scheduledDate: form.scheduledDate || null,
          assignedToId: form.assignedToId || null,
          notes: form.notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create cycle count');
        return;
      }

      router.push(`/cycle-counting/${data.cycleCount.id}`);
    } catch (err) {
      setError('Failed to create cycle count');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Cycle Count</h1>
          <p className="text-foreground/50 text-sm mt-0.5">
            Set up a physical inventory count session
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Count Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={form.locationId}
                onValueChange={(v) => setForm({ ...form, locationId: v })}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select warehouse/location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc: any) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} {loc.code ? `(${loc.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Count Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full Count - All items at location</SelectItem>
                  <SelectItem value="ABC_BASED">ABC Based - Filter by classification</SelectItem>
                  <SelectItem value="RANDOM_SAMPLE">Random Sample - 20% of items</SelectItem>
                  <SelectItem value="SPOT_CHECK">Spot Check - Manual selection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ABC Filter (conditional) */}
            {form.type === 'ABC_BASED' && (
              <div className="space-y-2">
                <Label htmlFor="abcFilter">ABC Class Filter</Label>
                <Select
                  value={form.abcFilter}
                  onValueChange={(v) => setForm({ ...form, abcFilter: v })}
                >
                  <SelectTrigger id="abcFilter">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Class A - High value items</SelectItem>
                    <SelectItem value="B">Class B - Medium value items</SelectItem>
                    <SelectItem value="C">Class C - Low value items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Blind Count */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="blindCount"
                checked={form.blindCount}
                onChange={(e) => setForm({ ...form, blindCount: e.target.checked })}
                className="h-4 w-4 rounded border-foreground/20"
              />
              <Label htmlFor="blindCount" className="font-normal">
                Blind count (hide expected quantities from counters)
              </Label>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              />
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={form.assignedToId}
                onValueChange={(v) => setForm({ ...form, assignedToId: v })}
              >
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this count..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Cycle Count
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
