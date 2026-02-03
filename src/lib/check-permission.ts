import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRolePermissions, hasPermission } from '@/lib/permissions';

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  user?: {
    id: string;
    tenantId: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Check if current user has specified permission
 * Checks in order: custom role permissions > user-specific permissions > default role permissions
 */
export async function checkPermission(
  requiredPermission: string | string[]
): Promise<PermissionCheckResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { allowed: false, reason: 'Not authenticated' };
  }

  const sessionUser = session.user as any;
  const tenantId = sessionUser.tenantId;
  const role = sessionUser.role;
  const userId = sessionUser.id;

  if (!tenantId) {
    return { allowed: false, reason: 'No tenant context' };
  }

  // SUPER_ADMIN has all permissions
  if (role === 'SUPER_ADMIN') {
    return {
      allowed: true,
      user: {
        id: userId,
        tenantId: tenantId,
        role: role,
        permissions: ['*'],
      },
    };
  }

  // Fetch user with custom role if any
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customRole: true,
    },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // Determine effective permissions
  let effectivePermissions: string[];

  if (user.customRole) {
    // Use custom role permissions
    effectivePermissions = user.customRole.permissions;
  } else if (user.permissions && Array.isArray(user.permissions)) {
    // Use user-specific permissions if set
    effectivePermissions = user.permissions as string[];
  } else {
    // Fall back to default role permissions
    effectivePermissions = getRolePermissions(user.role);
  }

  // Check permission(s)
  const requiredPerms = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  const hasAllPermissions = requiredPerms.every((perm) =>
    hasPermission(effectivePermissions, perm)
  );

  return {
    allowed: hasAllPermissions,
    reason: hasAllPermissions ? undefined : 'Insufficient permissions',
    user: {
      id: user.id,
      tenantId: tenantId,
      role: user.role,
      permissions: effectivePermissions,
    },
  };
}

/**
 * Check permission and throw error if not allowed
 * Useful for API route protection
 */
export async function requirePermission(
  requiredPermission: string | string[]
): Promise<{
  id: string;
  tenantId: string;
  role: string;
  permissions: string[];
}> {
  const result = await checkPermission(requiredPermission);

  if (!result.allowed) {
    const error = new Error(result.reason || 'Permission denied');
    (error as any).status = 403;
    throw error;
  }

  return result.user!;
}

/**
 * Get all effective permissions for current user
 */
export async function getEffectivePermissions(): Promise<string[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return [];
  }

  const sessionUser = session.user as any;

  if (sessionUser.role === 'SUPER_ADMIN') {
    return ['*'];
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      customRole: true,
    },
  });

  if (!user) {
    return [];
  }

  if (user.customRole) {
    return user.customRole.permissions;
  }

  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions as string[];
  }

  return getRolePermissions(user.role);
}
