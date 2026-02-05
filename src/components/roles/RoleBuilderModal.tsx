'use client';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import PermissionMatrix from './PermissionMatrix';

interface PermissionModule {
    key: string;
    label: string;
    icon: string;
    permissions: { key: string; label: string; description: string }[];
}

interface CustomRole {
    id?: string;
    name: string;
    description?: string | null;
    color?: string | null;
    permissions: string[];
}

interface RoleBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: CustomRole) => Promise<void>;
    modules: PermissionModule[];
    existingRole?: CustomRole | null;
}

const COLOR_PRESETS = [
    '#6A3BF6', // Purple
    '#F5A524', // Warning/Orange
    '#17C964', // Success/Green
    '#F31260', // Danger/Red
    '#006FEE', // Primary/Blue
    '#7828C8', // Secondary/Purple
    '#EC4899', // Pink
    '#0891B2', // Cyan
];

export default function RoleBuilderModal({
    isOpen,
    onClose,
    onSave,
    modules,
    existingRole,
}: RoleBuilderModalProps) {
    const [name, setName] = useState(existingRole?.name || '');
    const [description, setDescription] = useState(existingRole?.description || '');
    const [color, setColor] = useState(existingRole?.color || COLOR_PRESETS[0]);
    const [permissions, setPermissions] = useState<string[]>(existingRole?.permissions || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!existingRole?.id;

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Role name is required');
            return;
        }

        if (permissions.length === 0) {
            setError('Select at least one permission');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onSave({
                id: existingRole?.id,
                name: name.trim(),
                description: description.trim() || null,
                color,
                permissions,
            });
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save role');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setColor(COLOR_PRESETS[0]);
        setPermissions([]);
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modern-card">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-2xl font-black tracking-tight">
                        {isEditing ? 'Edit Custom Role' : 'Create Custom Role'}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                        {isEditing
                            ? 'Modify role name and permissions'
                            : 'Define a new role with specific permissions'}
                    </DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                            <p className="text-sm font-bold text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="role-name" className="text-sm font-bold">
                                Role Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="role-name"
                                placeholder="e.g. Warehouse Manager"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-black/5 h-14 text-lg rounded-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Role Color</Label>
                            <div className="flex gap-2 flex-wrap">
                                {COLOR_PRESETS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-10 h-10 rounded-xl transition-all ${
                                            color === c
                                                ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                                : 'hover:scale-105'
                                        }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role-description" className="text-sm font-bold">
                            Description
                        </Label>
                        <Textarea
                            id="role-description"
                            placeholder="Describe what this role is for..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-black/5 rounded-lg min-h-[80px]"
                        />
                    </div>

                    <div className="pt-4">
                        <h3 className="text-sm font-black uppercase tracking-widest opacity-40 mb-4">
                            Permissions
                        </h3>
                        <PermissionMatrix
                            modules={modules}
                            selectedPermissions={permissions}
                            onChange={setPermissions}
                        />
                    </div>
                </div>
                <DialogFooter className="border-t border-black/5 p-6">
                    <Button
                        variant="ghost"
                        className="font-bold h-12 px-8"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="font-black h-12 px-10 shadow-xl shadow-primary/20 rounded-full"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Save Changes' : 'Create Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
