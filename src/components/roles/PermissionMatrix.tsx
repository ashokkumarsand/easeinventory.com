'use client';

import {
    Checkbox,
    CheckboxGroup,
    Chip,
    Switch,
} from '@heroui/react';
import {
    Building,
    FileText,
    Package,
    Settings,
    Shield,
    Truck,
    UserCog,
    Users,
    Wrench,
} from 'lucide-react';

interface Permission {
    key: string;
    label: string;
    description: string;
}

interface PermissionModule {
    key: string;
    label: string;
    icon: string;
    permissions: Permission[];
}

interface PermissionMatrixProps {
    modules: PermissionModule[];
    selectedPermissions: string[];
    onChange: (permissions: string[]) => void;
    readOnly?: boolean;
}

const ICON_MAP: Record<string, any> = {
    Package,
    Wrench,
    FileText,
    Truck,
    Users,
    Building,
    UserCog,
    Settings,
    Shield,
};

export default function PermissionMatrix({
    modules,
    selectedPermissions,
    onChange,
    readOnly = false,
}: PermissionMatrixProps) {
    const handleModuleToggle = (moduleKey: string, isSelected: boolean) => {
        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return;

        const modulePermKeys = module.permissions.map((p) => p.key);

        if (isSelected) {
            // Add all permissions from this module
            const newPerms = [...new Set([...selectedPermissions, ...modulePermKeys])];
            onChange(newPerms);
        } else {
            // Remove all permissions from this module
            const newPerms = selectedPermissions.filter((p) => !modulePermKeys.includes(p));
            onChange(newPerms);
        }
    };

    const handlePermissionChange = (moduleKey: string, values: string[]) => {
        // Remove old permissions for this module and add new ones
        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return;

        const modulePermKeys = module.permissions.map((p) => p.key);
        const otherPerms = selectedPermissions.filter((p) => !modulePermKeys.includes(p));
        onChange([...otherPerms, ...values]);
    };

    const getModulePermissions = (moduleKey: string) => {
        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return [];
        return selectedPermissions.filter((p) => module.permissions.some((mp) => mp.key === p));
    };

    const isModuleFullySelected = (moduleKey: string) => {
        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return false;
        return module.permissions.every((p) => selectedPermissions.includes(p.key));
    };

    const isModulePartiallySelected = (moduleKey: string) => {
        const module = modules.find((m) => m.key === moduleKey);
        if (!module) return false;
        const selected = module.permissions.filter((p) => selectedPermissions.includes(p.key));
        return selected.length > 0 && selected.length < module.permissions.length;
    };

    return (
        <div className="space-y-6">
            {modules.map((module) => {
                const Icon = ICON_MAP[module.icon] || Package;
                const isFullySelected = isModuleFullySelected(module.key);
                const isPartiallySelected = isModulePartiallySelected(module.key);
                const modulePerms = getModulePermissions(module.key);

                return (
                    <div
                        key={module.key}
                        className={`p-5 rounded-2xl border transition-all ${
                            isFullySelected
                                ? 'bg-success/5 border-success/20'
                                : isPartiallySelected
                                ? 'bg-warning/5 border-warning/20'
                                : 'bg-black/[0.02] border-black/5 dark:bg-white/[0.02] dark:border-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        isFullySelected || isPartiallySelected
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-black/5 dark:bg-white/10 opacity-50'
                                    }`}
                                >
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm">{module.label}</h4>
                                    <p className="text-[10px] font-bold opacity-40">
                                        {modulePerms.length} of {module.permissions.length} enabled
                                    </p>
                                </div>
                            </div>

                            {!readOnly && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold opacity-40">All</span>
                                    <Switch
                                        size="sm"
                                        isSelected={isFullySelected}
                                        onValueChange={(checked) =>
                                            handleModuleToggle(module.key, checked)
                                        }
                                        color="success"
                                    />
                                </div>
                            )}
                        </div>

                        <CheckboxGroup
                            value={modulePerms}
                            onValueChange={(values) =>
                                handlePermissionChange(module.key, values as string[])
                            }
                            isDisabled={readOnly}
                            classNames={{
                                wrapper: 'gap-2',
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {module.permissions.map((perm) => (
                                    <Checkbox
                                        key={perm.key}
                                        value={perm.key}
                                        classNames={{
                                            base: `p-3 rounded-xl border ${
                                                selectedPermissions.includes(perm.key)
                                                    ? 'bg-primary/5 border-primary/20'
                                                    : 'bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/5'
                                            } hover:bg-primary/5 transition-all`,
                                            label: 'w-full',
                                        }}
                                    >
                                        <div className="flex-1">
                                            <p className="font-bold text-xs">{perm.label}</p>
                                            <p className="text-[10px] opacity-40 leading-tight">
                                                {perm.description}
                                            </p>
                                        </div>
                                    </Checkbox>
                                ))}
                            </div>
                        </CheckboxGroup>
                    </div>
                );
            })}

            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
                <div>
                    <p className="font-black text-sm">Total Permissions</p>
                    <p className="text-[10px] font-bold opacity-40">
                        Selected across all modules
                    </p>
                </div>
                <Chip
                    size="lg"
                    color={
                        selectedPermissions.length === 0
                            ? 'default'
                            : selectedPermissions.length ===
                              modules.reduce((acc, m) => acc + m.permissions.length, 0)
                            ? 'success'
                            : 'primary'
                    }
                    variant="flat"
                    className="font-black"
                >
                    {selectedPermissions.length} /{' '}
                    {modules.reduce((acc, m) => acc + m.permissions.length, 0)}
                </Chip>
            </div>
        </div>
    );
}
