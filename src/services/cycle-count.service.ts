import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import type { Prisma } from '@prisma/client';

export interface CreateCycleCountInput {
  locationId: string;
  type?: 'FULL' | 'ABC_BASED' | 'RANDOM_SAMPLE' | 'SPOT_CHECK';
  blindCount?: boolean;
  abcFilter?: string | null;
  scheduledDate?: string | null;
  assignedToId?: string | null;
  notes?: string | null;
}

export interface RecordCountItem {
  itemId: string;
  countedQuantity: number;
  notes?: string;
}

export interface CycleCountFilter {
  status?: string;
  locationId?: string;
  search?: string;
}

export class CycleCountService {
  /**
   * Create a DRAFT cycle count with a generated CC number.
   */
  static async create(input: CreateCycleCountInput, tenantId: string, userId: string) {
    // Validate location belongs to tenant
    const location = await prisma.location.findFirst({
      where: { id: input.locationId, tenantId },
    });
    if (!location) throw new Error('Location not found');

    const ccNumber = await generateNumber('CC', tenantId);

    return prisma.cycleCount.create({
      data: {
        ccNumber,
        locationId: input.locationId,
        type: input.type || 'FULL',
        blindCount: input.blindCount || false,
        abcFilter: input.abcFilter || null,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        assignedToId: input.assignedToId || null,
        createdById: userId,
        notes: input.notes || null,
        tenantId,
      },
      include: {
        location: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Get a single cycle count with all items and product details.
   */
  static async getById(id: string, tenantId: string) {
    return prisma.cycleCount.findFirst({
      where: { id, tenantId },
      include: {
        location: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, name: true } },
        verifiedBy: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                costPrice: true,
                salePrice: true,
                abcClass: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Paginated list with filters.
   */
  static async list(tenantId: string, filter: CycleCountFilter = {}, page = 1, pageSize = 50) {
    const where: Prisma.CycleCountWhereInput = { tenantId };

    if (filter.status) where.status = filter.status as any;
    if (filter.locationId) where.locationId = filter.locationId;
    if (filter.search) {
      where.OR = [
        { ccNumber: { contains: filter.search, mode: 'insensitive' } },
        { notes: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [counts, total] = await Promise.all([
      prisma.cycleCount.findMany({
        where,
        include: {
          location: { select: { id: true, name: true, code: true } },
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.cycleCount.count({ where }),
    ]);

    return { counts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * DRAFT → IN_PROGRESS. Populate items from StockAtLocation.
   * Snapshots expectedQuantity from current stock levels.
   */
  static async start(id: string, tenantId: string) {
    const cc = await prisma.cycleCount.findFirst({
      where: { id, tenantId },
    });
    if (!cc) throw new Error('Cycle count not found');
    if (cc.status !== 'DRAFT') throw new Error('Only draft counts can be started');

    // Get all stock at this location, filtering by tenant through product join
    let stockItems = await prisma.stockAtLocation.findMany({
      where: {
        locationId: cc.locationId,
        product: { tenantId },
      },
      include: {
        product: {
          select: { id: true, abcClass: true, costPrice: true },
        },
      },
    });

    // Apply ABC filter if set
    if (cc.type === 'ABC_BASED' && cc.abcFilter) {
      stockItems = stockItems.filter(s => s.product.abcClass === cc.abcFilter);
    }

    // Random sample: take ~20% using Fisher-Yates shuffle
    if (cc.type === 'RANDOM_SAMPLE') {
      const shuffled = [...stockItems];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const sampleSize = Math.max(1, Math.ceil(stockItems.length * 0.2));
      stockItems = shuffled.slice(0, sampleSize);
    }

    if (stockItems.length === 0) {
      throw new Error('No products found at this location matching the count criteria');
    }

    // Create items and update status in a transaction
    return prisma.$transaction(async (tx) => {
      // Create cycle count items
      await tx.cycleCountItem.createMany({
        data: stockItems.map(s => ({
          cycleCountId: id,
          productId: s.productId,
          expectedQuantity: s.quantity,
          status: 'PENDING' as const,
        })),
      });

      // Update cycle count status
      return tx.cycleCount.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          totalItems: stockItems.length,
        },
        include: {
          location: { select: { id: true, name: true, code: true } },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, barcode: true, costPrice: true, abcClass: true },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Batch update countedQuantity on items.
   */
  static async recordCounts(id: string, tenantId: string, items: RecordCountItem[]) {
    const cc = await prisma.cycleCount.findFirst({ where: { id, tenantId } });
    if (!cc) throw new Error('Cycle count not found');
    if (cc.status !== 'IN_PROGRESS') throw new Error('Counts can only be recorded on in-progress counts');

    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.cycleCountItem.update({
          where: { id: item.itemId },
          data: {
            countedQuantity: item.countedQuantity,
            notes: item.notes || undefined,
            status: 'COUNTED',
            countedAt: new Date(),
          },
        });
      }

      // Update counted items count
      const countedCount = await tx.cycleCountItem.count({
        where: { cycleCountId: id, status: { not: 'PENDING' } },
      });

      return tx.cycleCount.update({
        where: { id },
        data: { countedItems: countedCount },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, costPrice: true },
              },
            },
          },
        },
      });
    });
  }

  /**
   * IN_PROGRESS → COMPLETED. Calculate variance per item.
   */
  static async complete(id: string, tenantId: string) {
    const cc = await prisma.cycleCount.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            product: { select: { costPrice: true } },
          },
        },
      },
    });
    if (!cc) throw new Error('Cycle count not found');
    if (cc.status !== 'IN_PROGRESS') throw new Error('Only in-progress counts can be completed');

    // Check all items have been counted
    const uncounted = cc.items.filter(i => i.countedQuantity === null);
    if (uncounted.length > 0) {
      throw new Error(`${uncounted.length} items have not been counted yet`);
    }

    return prisma.$transaction(async (tx) => {
      let varianceCount = 0;
      let totalVarianceValue = 0;

      for (const item of cc.items) {
        const counted = item.countedQuantity!;
        const variance = counted - item.expectedQuantity;
        const variancePercent = item.expectedQuantity > 0
          ? (variance / item.expectedQuantity) * 100
          : (counted > 0 ? 100 : 0);
        const varianceValue = variance * Number(item.product.costPrice);

        if (variance !== 0) varianceCount++;
        totalVarianceValue += Math.abs(varianceValue);

        await tx.cycleCountItem.update({
          where: { id: item.id },
          data: {
            variance,
            variancePercent,
            varianceValue,
          },
        });
      }

      return tx.cycleCount.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          countedItems: cc.items.length,
          varianceCount,
          varianceValue: totalVarianceValue,
        },
        include: {
          location: { select: { id: true, name: true, code: true } },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, costPrice: true },
              },
            },
          },
        },
      });
    });
  }

  /**
   * COMPLETED → VERIFIED. Set verifier and timestamp.
   */
  static async verify(id: string, tenantId: string, userId: string) {
    const cc = await prisma.cycleCount.findFirst({ where: { id, tenantId } });
    if (!cc) throw new Error('Cycle count not found');
    if (cc.status !== 'COMPLETED') throw new Error('Only completed counts can be verified');

    return prisma.cycleCount.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedById: userId,
        verifiedAt: new Date(),
      },
      include: {
        location: { select: { id: true, name: true, code: true } },
        verifiedBy: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * VERIFIED only. Apply inventory adjustments:
   * - Update Product.quantity by variance delta
   * - Update StockAtLocation.quantity by variance delta
   * - Create StockMovement with type CYCLE_COUNT per item with non-zero variance
   */
  static async adjust(id: string, tenantId: string, userId: string) {
    const cc = await prisma.cycleCount.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, costPrice: true } },
          },
        },
      },
    });
    if (!cc) throw new Error('Cycle count not found');
    if (cc.status !== 'VERIFIED') throw new Error('Only verified counts can be adjusted');

    return prisma.$transaction(async (tx) => {
      for (const item of cc.items) {
        if (item.variance === 0 || item.variance === null) continue;

        const delta = item.variance;

        // Update Product.quantity by delta
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: delta } },
        });

        // Update StockAtLocation.quantity by delta
        await tx.stockAtLocation.updateMany({
          where: {
            productId: item.productId,
            locationId: cc.locationId,
          },
          data: { quantity: { increment: delta } },
        });

        // Create StockMovement record
        await tx.stockMovement.create({
          data: {
            type: 'CYCLE_COUNT',
            quantity: delta,
            productId: item.productId,
            userId,
            tenantId,
            notes: `Cycle count adjustment: CC ${cc.ccNumber}. Expected: ${item.expectedQuantity}, Counted: ${item.countedQuantity}`,
          },
        });

        // Mark item as adjusted
        await tx.cycleCountItem.update({
          where: { id: item.id },
          data: { status: 'ADJUSTED' },
        });
      }

      // Note: we keep the status as VERIFIED; adjustments are tracked via item status
      return tx.cycleCount.findFirst({
        where: { id },
        include: {
          location: { select: { id: true, name: true, code: true } },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, costPrice: true },
              },
            },
          },
        },
      });
    });
  }

  /**
   * DRAFT or IN_PROGRESS → CANCELLED.
   */
  static async cancel(id: string, tenantId: string) {
    const cc = await prisma.cycleCount.findFirst({ where: { id, tenantId } });
    if (!cc) throw new Error('Cycle count not found');
    if (cc.status === 'COMPLETED' || cc.status === 'VERIFIED') {
      throw new Error('Cannot cancel completed or verified counts');
    }

    return prisma.cycleCount.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
