// Permissions definition for EaseInventory RBAC system
// Each module has granular permissions that can be toggled

export interface Permission {
  key: string;
  label: string;
  description: string;
  module: string;
}

export interface PermissionModule {
  key: string;
  label: string;
  icon: string;
  permissions: Permission[];
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: 'inventory',
    label: 'Inventory',
    icon: 'Package',
    permissions: [
      { key: 'inventory:view', label: 'View Inventory', description: 'See product list and stock levels', module: 'inventory' },
      { key: 'inventory:create', label: 'Add Products', description: 'Create new products', module: 'inventory' },
      { key: 'inventory:edit', label: 'Edit Products', description: 'Modify product details and pricing', module: 'inventory' },
      { key: 'inventory:delete', label: 'Delete Products', description: 'Remove products from catalog', module: 'inventory' },
      { key: 'inventory:adjust', label: 'Stock Adjustments', description: 'Make manual stock changes', module: 'inventory' },
      { key: 'inventory:transfer', label: 'Stock Transfers', description: 'Transfer between locations', module: 'inventory' },
    ]
  },
  {
    key: 'repairs',
    label: 'Repairs',
    icon: 'Wrench',
    permissions: [
      { key: 'repairs:view', label: 'View Tickets', description: 'See repair tickets', module: 'repairs' },
      { key: 'repairs:create', label: 'Create Tickets', description: 'Register new repairs', module: 'repairs' },
      { key: 'repairs:edit', label: 'Edit Tickets', description: 'Update repair details', module: 'repairs' },
      { key: 'repairs:diagnose', label: 'Diagnose', description: 'Add diagnosis and notes', module: 'repairs' },
      { key: 'repairs:finalize', label: 'Finalize Cost', description: 'Set final repair cost', module: 'repairs' },
      { key: 'repairs:delete', label: 'Delete Tickets', description: 'Remove repair tickets', module: 'repairs' },
    ]
  },
  {
    key: 'invoices',
    label: 'Invoicing',
    icon: 'FileText',
    permissions: [
      { key: 'invoices:view', label: 'View Invoices', description: 'See invoice history', module: 'invoices' },
      { key: 'invoices:create', label: 'Create Invoices', description: 'Generate new invoices', module: 'invoices' },
      { key: 'invoices:edit', label: 'Edit Invoices', description: 'Modify invoice details', module: 'invoices' },
      { key: 'invoices:void', label: 'Void Invoices', description: 'Cancel invoices', module: 'invoices' },
      { key: 'invoices:export', label: 'Export Reports', description: 'Download GSTR-1 and reports', module: 'invoices' },
    ]
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: 'ShoppingCart',
    permissions: [
      { key: 'orders:view', label: 'View Orders', description: 'See sales orders list', module: 'orders' },
      { key: 'orders:create', label: 'Create Orders', description: 'Create new sales orders', module: 'orders' },
      { key: 'orders:edit', label: 'Edit Orders', description: 'Modify order details', module: 'orders' },
      { key: 'orders:cancel', label: 'Cancel Orders', description: 'Cancel sales orders', module: 'orders' },
      { key: 'orders:fulfill', label: 'Fulfill Orders', description: 'Pick, pack, and process orders', module: 'orders' },
    ]
  },
  {
    key: 'shipments',
    label: 'Shipments',
    icon: 'Truck',
    permissions: [
      { key: 'shipments:view', label: 'View Shipments', description: 'See shipment tracking', module: 'shipments' },
      { key: 'shipments:create', label: 'Create Shipments', description: 'Push orders to carriers', module: 'shipments' },
      { key: 'shipments:manage', label: 'Manage Shipments', description: 'Handle labels, pickups, NDR', module: 'shipments' },
      { key: 'shipments:cod', label: 'COD Management', description: 'Track COD remittances', module: 'shipments' },
      { key: 'shipments:carriers', label: 'Manage Carriers', description: 'Add/edit carrier accounts', module: 'shipments' },
    ]
  },
  {
    key: 'procurement',
    label: 'Procurement',
    icon: 'ClipboardList',
    permissions: [
      { key: 'procurement:view', label: 'View POs & GRNs', description: 'See purchase orders and goods receipts', module: 'procurement' },
      { key: 'procurement:create', label: 'Create POs & GRNs', description: 'Create purchase orders and goods receipts', module: 'procurement' },
      { key: 'procurement:edit', label: 'Edit POs', description: 'Modify purchase order details', module: 'procurement' },
      { key: 'procurement:approve', label: 'Approve POs', description: 'Send and approve purchase orders', module: 'procurement' },
      { key: 'procurement:receive', label: 'Receive Goods', description: 'Complete goods receipts and update stock', module: 'procurement' },
    ]
  },
  {
    key: 'returns',
    label: 'Returns',
    icon: 'RotateCcw',
    permissions: [
      { key: 'returns:view', label: 'View Returns', description: 'See return requests', module: 'returns' },
      { key: 'returns:create', label: 'Create Returns', description: 'Initiate return requests', module: 'returns' },
      { key: 'returns:approve', label: 'Approve Returns', description: 'Approve or reject returns', module: 'returns' },
      { key: 'returns:inspect', label: 'Inspect Returns', description: 'Grade returned items', module: 'returns' },
      { key: 'returns:refund', label: 'Process Refunds', description: 'Initiate refunds for returns', module: 'returns' },
    ]
  },
  {
    key: 'delivery',
    label: 'Delivery',
    icon: 'PackageCheck',
    permissions: [
      { key: 'delivery:view', label: 'View Deliveries', description: 'See delivery list', module: 'delivery' },
      { key: 'delivery:create', label: 'Create Deliveries', description: 'Schedule deliveries', module: 'delivery' },
      { key: 'delivery:update', label: 'Update Status', description: 'Change delivery status', module: 'delivery' },
    ]
  },
  {
    key: 'hr',
    label: 'HR & Payroll',
    icon: 'Users',
    permissions: [
      { key: 'hr:view', label: 'View Employees', description: 'See employee roster', module: 'hr' },
      { key: 'hr:create', label: 'Add Employees', description: 'Onboard new employees', module: 'hr' },
      { key: 'hr:edit', label: 'Edit Employees', description: 'Modify employee data', module: 'hr' },
      { key: 'hr:attendance', label: 'Manage Attendance', description: 'View and edit attendance', module: 'hr' },
      { key: 'hr:leaves', label: 'Approve Leaves', description: 'Handle leave requests', module: 'hr' },
      { key: 'hr:payroll', label: 'Payroll Access', description: 'View and process salaries', module: 'hr' },
    ]
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'Building',
    permissions: [
      { key: 'suppliers:view', label: 'View Suppliers', description: 'See supplier directory', module: 'suppliers' },
      { key: 'suppliers:create', label: 'Add Suppliers', description: 'Register new suppliers', module: 'suppliers' },
      { key: 'suppliers:edit', label: 'Edit Suppliers', description: 'Modify supplier info', module: 'suppliers' },
      { key: 'suppliers:settlements', label: 'Settlements', description: 'Process consignment payouts', module: 'suppliers' },
    ]
  },
  {
    key: 'team',
    label: 'Team Management',
    icon: 'UserCog',
    permissions: [
      { key: 'team:view', label: 'View Team', description: 'See user list', module: 'team' },
      { key: 'team:invite', label: 'Invite Users', description: 'Add new team members', module: 'team' },
      { key: 'team:edit', label: 'Edit Users', description: 'Change user roles', module: 'team' },
      { key: 'team:remove', label: 'Remove Users', description: 'Deactivate users', module: 'team' },
    ]
  },
  {
    key: 'cycle_counting',
    label: 'Cycle Counting',
    icon: 'ClipboardCheck',
    permissions: [
      { key: 'cycle_counting:view', label: 'View Counts', description: 'See cycle count sessions', module: 'cycle_counting' },
      { key: 'cycle_counting:create', label: 'Create Counts', description: 'Create new cycle count sessions', module: 'cycle_counting' },
      { key: 'cycle_counting:count', label: 'Record Counts', description: 'Record physical inventory counts', module: 'cycle_counting' },
      { key: 'cycle_counting:verify', label: 'Verify Counts', description: 'Verify and approve count results', module: 'cycle_counting' },
      { key: 'cycle_counting:adjust', label: 'Adjust Inventory', description: 'Apply inventory adjustments from counts', module: 'cycle_counting' },
    ]
  },
  {
    key: 'analytics',
    label: 'Analytics & Intelligence',
    icon: 'Brain',
    permissions: [
      { key: 'analytics:view', label: 'View Analytics', description: 'View analytics dashboards and intelligence', module: 'analytics' },
      { key: 'analytics:configure', label: 'Configure Analytics', description: 'Run classifications, set reorder points', module: 'analytics' },
      { key: 'analytics:reorder', label: 'Reorder Suggestions', description: 'View and act on reorder suggestions', module: 'analytics' },
    ]
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'Settings',
    permissions: [
      { key: 'settings:view', label: 'View Settings', description: 'See tenant settings', module: 'settings' },
      { key: 'settings:edit', label: 'Edit Settings', description: 'Modify tenant config', module: 'settings' },
      { key: 'settings:domains', label: 'Domain Management', description: 'Configure custom domains', module: 'settings' },
    ]
  },
];

// Default role permission mappings
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.key)), // All permissions
  MANAGER: [
    'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:adjust', 'inventory:transfer',
    'repairs:view', 'repairs:create', 'repairs:edit', 'repairs:diagnose',
    'invoices:view', 'invoices:create', 'invoices:edit',
    'orders:view', 'orders:create', 'orders:edit', 'orders:fulfill',
    'shipments:view', 'shipments:create', 'shipments:manage', 'shipments:cod',
    'procurement:view', 'procurement:create', 'procurement:edit', 'procurement:approve', 'procurement:receive',
    'returns:view', 'returns:create', 'returns:approve', 'returns:inspect', 'returns:refund',
    'cycle_counting:view', 'cycle_counting:create', 'cycle_counting:count', 'cycle_counting:verify', 'cycle_counting:adjust',
    'delivery:view', 'delivery:create', 'delivery:update',
    'hr:view', 'hr:attendance', 'hr:leaves',
    'suppliers:view', 'suppliers:create', 'suppliers:edit',
    'analytics:view', 'analytics:configure', 'analytics:reorder',
    'team:view',
    'settings:view'
  ],
  ACCOUNTANT: [
    'inventory:view',
    'repairs:view', 'repairs:finalize',
    'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:export',
    'procurement:view', 'procurement:create', 'procurement:approve',
    'cycle_counting:view',
    'hr:view', 'hr:payroll',
    'suppliers:view', 'suppliers:settlements',
    'analytics:view',
  ],
  TECHNICIAN: [
    'inventory:view',
    'repairs:view', 'repairs:diagnose',
  ],
  SALES_STAFF: [
    'inventory:view', 'inventory:create',
    'invoices:view', 'invoices:create',
    'orders:view', 'orders:create', 'orders:fulfill',
    'shipments:view', 'shipments:create',
    'returns:view', 'returns:create',
    'delivery:view', 'delivery:create',
    'analytics:view',
  ],
  VIEWER: [
    'inventory:view',
    'repairs:view',
    'invoices:view',
    'delivery:view',
    'hr:view',
    'suppliers:view',
  ],
  STAFF: [
    'inventory:view',
    'repairs:view',
    'orders:view',
    'shipments:view',
    'procurement:view',
    'cycle_counting:view', 'cycle_counting:count',
    'delivery:view',
  ],
};

// Helper to check if a user has a specific permission
export function hasPermission(userPermissions: string[] | null, permission: string): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(permission) || userPermissions.includes('*');
}

// Helper to get all permissions for a role
export function getRolePermissions(role: string): string[] {
  return DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.STAFF;
}
