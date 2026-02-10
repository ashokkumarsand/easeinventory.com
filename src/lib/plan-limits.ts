/**
 * Plan limit checking utility (server-side)
 *
 * Checks current resource usage against plan limits + active add-ons.
 */

import prisma from '@/lib/prisma';
import {
  PlanType,
  normalizePlanType,
  getEffectiveLimits,
  AddOnType,
} from '@/lib/plan-features';

export type LimitResource = 'users' | 'products' | 'locations' | 'invoices' | 'storage';

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number; // -1 = unlimited
  percentUsed: number;
  resource: LimitResource;
}

/**
 * Check if a tenant is within their plan limit for a given resource.
 */
export async function checkPlanLimit(
  tenantId: string,
  resource: LimitResource
): Promise<LimitCheckResult> {
  // Fetch tenant plan + active add-ons in one query
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      plan: true,
      effectiveUserLimit: true,
      effectiveProductLimit: true,
      effectiveLocationLimit: true,
      effectiveStorageLimit: true,
      planAddOns: {
        where: { isActive: true },
        select: { type: true, quantity: true },
      },
    },
  });

  if (!tenant) {
    return { allowed: false, current: 0, limit: 0, percentUsed: 0, resource };
  }

  const plan = normalizePlanType(tenant.plan as string);
  const addOns = tenant.planAddOns.map((a) => ({
    type: a.type as AddOnType,
    quantity: a.quantity,
  }));
  const limits = getEffectiveLimits(plan, addOns);

  // Use cached effective limits if available, otherwise compute from plan + add-ons
  const getLimit = (): number => {
    switch (resource) {
      case 'users':
        return tenant.effectiveUserLimit ?? limits.users;
      case 'products':
        return tenant.effectiveProductLimit ?? limits.products;
      case 'locations':
        return tenant.effectiveLocationLimit ?? limits.locations;
      case 'storage':
        return tenant.effectiveStorageLimit ?? limits.storage;
      case 'invoices':
        return limits.invoices;
    }
  };

  const limit = getLimit();
  const current = await getCurrentUsage(tenantId, resource);

  if (limit === -1) {
    return { allowed: true, current, limit: -1, percentUsed: 0, resource };
  }

  const percentUsed = limit > 0 ? Math.round((current / limit) * 100) : 0;

  return {
    allowed: current < limit,
    current,
    limit,
    percentUsed,
    resource,
  };
}

/**
 * Check all limits for a tenant at once
 */
export async function checkAllLimits(tenantId: string): Promise<LimitCheckResult[]> {
  const resources: LimitResource[] = ['users', 'products', 'locations', 'invoices', 'storage'];
  return Promise.all(resources.map((r) => checkPlanLimit(tenantId, r)));
}

/**
 * Get the current usage count for a resource
 */
async function getCurrentUsage(tenantId: string, resource: LimitResource): Promise<number> {
  switch (resource) {
    case 'users':
      // Exclude the owner/admin from the count
      return prisma.user.count({
        where: { tenantId, role: { not: 'OWNER' } },
      });

    case 'products':
      return prisma.product.count({ where: { tenantId } });

    case 'locations':
      return prisma.location.count({ where: { tenantId } });

    case 'invoices': {
      // Count invoices created this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return prisma.invoice.count({
        where: {
          tenantId,
          invoiceDate: { gte: startOfMonth },
        },
      });
    }

    case 'storage':
      // Storage tracking not yet implemented — return 0
      return 0;

    default:
      return 0;
  }
}

/**
 * Recalculate and persist effective limits for a tenant.
 * Call this after plan change or add-on purchase.
 */
export async function recalculateEffectiveLimits(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      plan: true,
      planAddOns: {
        where: { isActive: true },
        select: { type: true, quantity: true },
      },
    },
  });

  if (!tenant) return;

  const plan = normalizePlanType(tenant.plan as string);
  const addOns = tenant.planAddOns.map((a) => ({
    type: a.type as AddOnType,
    quantity: a.quantity,
  }));
  const limits = getEffectiveLimits(plan, addOns);

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      effectiveUserLimit: limits.users,
      effectiveProductLimit: limits.products,
      effectiveLocationLimit: limits.locations,
      effectiveStorageLimit: limits.storage,
    },
  });
}
