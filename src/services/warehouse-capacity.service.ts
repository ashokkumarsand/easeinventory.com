import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export interface LocationCapacity {
  id: string;
  name: string;
  code: string | null;
  type: string;
  city: string | null;
  parentId: string | null;
  subType: string | null;
  // Unit capacity
  capacity: number | null;
  currentLoad: number;
  unitUtilization: number; // 0-100%
  // Weight capacity
  maxWeightKg: number | null;
  // Volume capacity
  maxVolumeCbm: number | null;
  // Stock metrics
  uniqueSkus: number;
  totalUnits: number;
  stockValue: number;
  // Alert level
  alertLevel: 'LOW' | 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface CapacitySummary {
  totalLocations: number;
  totalCapacity: number;
  totalCurrentLoad: number;
  overallUtilization: number;
  criticalCount: number;
  warningCount: number;
  underutilizedCount: number;
  totalStockValue: number;
}

export interface CapacityDashboard {
  summary: CapacitySummary;
  locations: LocationCapacity[];
}

// ============================================================
// Service
// ============================================================

export class WarehouseCapacityService {
  /**
   * Classify utilization alert level
   */
  private static getAlertLevel(utilization: number): 'LOW' | 'NORMAL' | 'WARNING' | 'CRITICAL' {
    if (utilization >= 95) return 'CRITICAL';
    if (utilization >= 80) return 'WARNING';
    if (utilization <= 20) return 'LOW';
    return 'NORMAL';
  }

  /**
   * Get capacity dashboard for all locations
   */
  static async getDashboard(tenantId: string): Promise<CapacityDashboard> {
    const locations = await prisma.location.findMany({
      where: { tenantId, isActive: true },
      include: {
        stock: {
          include: {
            product: {
              select: { costPrice: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const locationCapacities: LocationCapacity[] = locations.map((loc) => {
      const uniqueSkus = loc.stock.length;
      const totalUnits = loc.stock.reduce((s, sl) => s + sl.quantity, 0);
      const stockValue = loc.stock.reduce(
        (s, sl) => s + sl.quantity * Number(sl.product.costPrice),
        0,
      );

      // Use actual stock total for utilization if currentLoad is stale
      const effectiveLoad = Math.max(loc.currentLoad, totalUnits);
      const unitUtilization = loc.capacity && loc.capacity > 0
        ? Math.round((effectiveLoad / loc.capacity) * 100 * 100) / 100
        : 0;

      return {
        id: loc.id,
        name: loc.name,
        code: loc.code,
        type: loc.type,
        city: loc.city,
        parentId: loc.parentId,
        subType: loc.subType,
        capacity: loc.capacity,
        currentLoad: effectiveLoad,
        unitUtilization,
        maxWeightKg: loc.maxWeightKg,
        maxVolumeCbm: loc.maxVolumeCbm,
        uniqueSkus,
        totalUnits,
        stockValue: Math.round(stockValue * 100) / 100,
        alertLevel: loc.capacity ? this.getAlertLevel(unitUtilization) : 'NORMAL',
      };
    });

    // Summary
    const withCapacity = locationCapacities.filter((l) => l.capacity && l.capacity > 0);
    const totalCapacity = withCapacity.reduce((s, l) => s + (l.capacity ?? 0), 0);
    const totalCurrentLoad = withCapacity.reduce((s, l) => s + l.currentLoad, 0);
    const overallUtilization = totalCapacity > 0
      ? Math.round((totalCurrentLoad / totalCapacity) * 100 * 100) / 100
      : 0;

    return {
      summary: {
        totalLocations: locationCapacities.length,
        totalCapacity,
        totalCurrentLoad,
        overallUtilization,
        criticalCount: locationCapacities.filter((l) => l.alertLevel === 'CRITICAL').length,
        warningCount: locationCapacities.filter((l) => l.alertLevel === 'WARNING').length,
        underutilizedCount: locationCapacities.filter((l) => l.alertLevel === 'LOW').length,
        totalStockValue: Math.round(locationCapacities.reduce((s, l) => s + l.stockValue, 0) * 100) / 100,
      },
      locations: locationCapacities,
    };
  }

  /**
   * Update capacity for a location
   */
  static async updateCapacity(
    locationId: string,
    tenantId: string,
    data: { capacity?: number; maxWeightKg?: number; maxVolumeCbm?: number },
  ) {
    const loc = await prisma.location.findFirst({ where: { id: locationId, tenantId } });
    if (!loc) throw new Error('Location not found');

    return prisma.location.update({
      where: { id: locationId },
      data,
      select: { id: true, name: true, capacity: true, maxWeightKg: true, maxVolumeCbm: true },
    });
  }
}
