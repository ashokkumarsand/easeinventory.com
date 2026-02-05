'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

    const handlePermissionChange = (permKey: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedPermissions, permKey]);
        } else {
            onChange(selectedPermissions.filter((p) => p !== permKey));
        }
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
                                        checked={isFullySelected}
                                        onCheckedChange={(checked) =>
                                            handleModuleToggle(module.key, checked)
                                        }
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {module.permissions.map((perm) => {
                                const isChecked = selectedPermissions.includes(perm.key);
                                return (
                                    <div
                                        key={perm.key}
                                        className={`p-3 rounded-xl border ${
                                            isChecked
                                                ? 'bg-primary/5 border-primary/20'
                                                : 'bg-white/50 dark:bg-black/20 border-black/5 dark:border-white/5'
                                        } hover:bg-primary/5 transition-all`}
                                    >
                                        <Label className="flex items-start gap-3 cursor-pointer">
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    handlePermissionChange(perm.key, checked as boolean)
                                                }
                                                disabled={readOnly}
                                                className="mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-xs">{perm.label}</p>
                                                <p className="text-[10px] opacity-40 leading-tight">
                                                    {perm.description}
                                                </p>
                                            </div>
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
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
                <Badge
                    variant={
                        selectedPermissions.length === 0
                            ? 'outline'
                            : selectedPermissions.length ===
                              modules.reduce((acc, m) => acc + m.permissions.length, 0)
                            ? 'default'
                            : 'secondary'
                    }
                    className="font-black text-base px-4 py-1"
                >
                    {selectedPermissions.length} /{' '}
                    {modules.reduce((acc, m) => acc + m.permissions.length, 0)}
                </Badge>
            </div>
        </div>
    );
}
