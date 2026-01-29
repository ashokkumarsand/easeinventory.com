import { useSession } from 'next-auth/react';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'ADMIN'
  | 'MANAGER'
  | 'ACCOUNTANT'
  | 'TECHNICIAN'
  | 'SALES_STAFF'
  | 'VIEWER'
  | 'STAFF';

export function usePermissions() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role: UserRole = user?.role || 'STAFF';

  const permissions = {
    role,
    isAdmin: role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'ADMIN',
    isManager: role === 'MANAGER' || role === 'OWNER' || role === 'ADMIN',
    isAccountant: role === 'ACCOUNTANT' || role === 'OWNER' || role === 'ADMIN',
    isTechnician: role === 'TECHNICIAN',
    isStaff: role === 'STAFF',
    
    // Feature specific checks
    canManageInventory: ['OWNER', 'ADMIN', 'MANAGER'].includes(role),
    canManageHR: ['OWNER', 'ADMIN', 'MANAGER'].includes(role),
    canManageInvoices: ['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(role),
    canProcessRepairs: ['OWNER', 'ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role),
    canViewAnalytics: ['OWNER', 'ADMIN', 'MANAGER'].includes(role),
  };

  return permissions;
}
