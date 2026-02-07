import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';

// ============================================================
// Types
// ============================================================

export interface TransshipmentSuggestion {
  productId: string;
  productName: string;
  sku: string | null;
  sourceLocationId: string;
  sourceLocationName: string;
  sourceQty: number;
  destLocationId: string;
  destLocationName: string;
  destQty: number;
  suggestedQty: number;
  reason: string;
}

export interface CreateTransshipmentInput {
  sourceLocationId: string;
  destLocationId: string;
  items: { productId: string; quantity: number }[];
  reason?: string;
  isEmergency?: boolean;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string;
}

// ============================================================
// Service
// ============================================================

export class TransshipmentService {
  /**
   * Suggest lateral transshipments based on stock imbalances across locations
   */
  static async getSuggestions(tenantId: string): Promise<TransshipmentSuggestion[]> {
    // Get all locations
    const locations = await prisma.location.findMany({
      where: { tenant: { id: tenantId } },
      select: { id: true, name: true },
    });

    if (locations.length < 2) return [];

    // Get stock at all locations for products with reorder points
    const stockAtLocations = await prisma.stockAtLocation.findMany({
      where: { locationId: { in: locations.map((l) => l.id) } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            tenantId: true,
            reorderPoint: true,
            safetyStock: true,
            maxStock: true,
            quantity: true,
          },
        },
        location: { select: { id: true, name: true } },
      },
    });

    // Filter to only this tenant's products
    const tenantStock = stockAtLocations.filter((s) => s.product.tenantId === tenantId);

    // Group by product
    const byProduct = new Map<string, typeof tenantStock>();
    for (const s of tenantStock) {
      const arr = byProduct.get(s.productId) || [];
      arr.push(s);
      byProduct.set(s.productId, arr);
    }

    const locationMap = new Map(locations.map((l) => [l.id, l.name]));
    const suggestions: TransshipmentSuggestion[] = [];

    for (const [, stocks] of byProduct) {
      if (stocks.length < 2) continue;

      const product = stocks[0].product;
      const reorderPoint = product.reorderPoint ?? 0;
      const safetyStock = product.safetyStock ?? 0;

      // Find locations below safety stock and locations with excess
      const lowLocations = stocks.filter((s) => s.quantity < safetyStock && s.quantity < reorderPoint);
      const excessLocations = stocks.filter((s) => {
        const maxStock = product.maxStock ?? reorderPoint * 3;
        return s.quantity > maxStock * 0.7;
      });

      for (const low of lowLocations) {
        for (const excess of excessLocations) {
          if (low.locationId === excess.locationId) continue;

          const deficit = reorderPoint - low.quantity;
          const available = excess.quantity - (product.safetyStock ?? 0);
          const suggestedQty = Math.min(deficit, Math.max(0, available));

          if (suggestedQty <= 0) continue;

          suggestions.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            sourceLocationId: excess.locationId,
            sourceLocationName: excess.location.name,
            sourceQty: excess.quantity,
            destLocationId: low.locationId,
            destLocationName: low.location.name,
            destQty: low.quantity,
            suggestedQty,
            reason: `${low.location.name} is below safety stock (${low.quantity}/${safetyStock}). ${excess.location.name} has excess (${excess.quantity}).`,
          });
        }
      }
    }

    // Sort by urgency (largest deficits first)
    suggestions.sort((a, b) => (b.suggestedQty - a.suggestedQty));

    return suggestions.slice(0, 50);
  }

  /**
   * Create a lateral transshipment (emergency stock transfer)
   */
  static async create(tenantId: string, userId: string, input: CreateTransshipmentInput) {
    if (input.sourceLocationId === input.destLocationId) {
      throw new Error('Source and destination locations must be different');
    }

    // Validate locations belong to tenant
    const [source, dest] = await Promise.all([
      prisma.location.findFirst({
        where: { id: input.sourceLocationId, tenant: { id: tenantId } },
      }),
      prisma.location.findFirst({
        where: { id: input.destLocationId, tenant: { id: tenantId } },
      }),
    ]);

    if (!source) throw new Error('Source location not found');
    if (!dest) throw new Error('Destination location not found');

    // Validate stock availability
    for (const item of input.items) {
      const stock = await prisma.stockAtLocation.findFirst({
        where: { productId: item.productId, locationId: input.sourceLocationId },
      });
      if (!stock || stock.quantity < item.quantity) {
        const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { name: true } });
        throw new Error(`Insufficient stock for ${product?.name ?? item.productId} at source location`);
      }
    }

    const transferNumber = await generateNumber('TRF', tenantId);

    return prisma.stockTransfer.create({
      data: {
        transferNumber,
        sourceLocationId: input.sourceLocationId,
        destLocationId: input.destLocationId,
        status: 'PENDING',
        isEmergency: input.isEmergency ?? false,
        priority: input.priority ?? 'NORMAL',
        reason: input.reason,
        notes: input.notes,
        createdById: userId,
        tenantId,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, sku: true } } } },
        sourceLocation: { select: { name: true } },
        destLocation: { select: { name: true } },
      },
    });
  }

  /**
   * Approve a transshipment request
   */
  static async approve(tenantId: string, userId: string, transferId: string) {
    const transfer = await prisma.stockTransfer.findFirst({
      where: { id: transferId, tenantId, status: 'PENDING' },
    });
    if (!transfer) throw new Error('Transfer not found or not pending');

    return prisma.stockTransfer.update({
      where: { id: transferId },
      data: { status: 'APPROVED', approvedById: userId },
    });
  }

  /**
   * Reject a transshipment request
   */
  static async reject(tenantId: string, userId: string, transferId: string, reason?: string) {
    const transfer = await prisma.stockTransfer.findFirst({
      where: { id: transferId, tenantId, status: 'PENDING' },
    });
    if (!transfer) throw new Error('Transfer not found or not pending');

    return prisma.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: 'REJECTED',
        approvedById: userId,
        notes: reason ? `Rejected: ${reason}` : transfer.notes,
      },
    });
  }

  /**
   * List transshipments (emergency transfers)
   */
  static async list(tenantId: string, page = 1, pageSize = 20, emergencyOnly = false) {
    const where: any = { tenantId };
    if (emergencyOnly) where.isEmergency = true;

    const [transfers, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        include: {
          items: { include: { product: { select: { name: true, sku: true } } } },
          sourceLocation: { select: { name: true } },
          destLocation: { select: { name: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockTransfer.count({ where }),
    ]);

    return { transfers, total };
  }
}
