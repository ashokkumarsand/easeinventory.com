'use client';

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
} from '@heroui/react';
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
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            size="4xl"
            scrollBehavior="inside"
            classNames={{ base: 'modern-card' }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 p-8">
                            <h2 className="text-2xl font-black tracking-tight">
                                {isEditing ? 'Edit Custom Role' : 'Create Custom Role'}
                            </h2>
                            <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">
                                {isEditing
                                    ? 'Modify role name and permissions'
                                    : 'Define a new role with specific permissions'}
                            </p>
                        </ModalHeader>
                        <ModalBody className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                                    <p className="text-sm font-bold text-danger">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Role Name"
                                    placeholder="e.g. Warehouse Manager"
                                    labelPlacement="outside"
                                    size="lg"
                                    radius="lg"
                                    value={name}
                                    onValueChange={setName}
                                    classNames={{ inputWrapper: 'bg-black/5 h-14' }}
                                    isRequired
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Role Color</label>
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

                            <Textarea
                                label="Description"
                                placeholder="Describe what this role is for..."
                                labelPlacement="outside"
                                radius="lg"
                                value={description}
                                onValueChange={setDescription}
                                classNames={{ inputWrapper: 'bg-black/5' }}
                                minRows={2}
                            />

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
                        </ModalBody>
                        <ModalFooter className="border-t border-black/5 p-6">
                            <Button
                                variant="light"
                                className="font-bold h-12 px-8"
                                onPress={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                className="font-black h-12 px-10 shadow-xl shadow-primary/20"
                                radius="full"
                                onClick={handleSave}
                                isLoading={isLoading}
                            >
                                {isEditing ? 'Save Changes' : 'Create Role'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
