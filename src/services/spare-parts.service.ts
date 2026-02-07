import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export interface SparePartUsage {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  totalUsed: number;        // Total qty used across repairs
  repairCount: number;      // How many tickets used this part
  avgQtyPerRepair: number;
  lastUsedAt: string | null;
  monthlyUsageRate: number; // Avg monthly usage
  daysUntilStockout: number;
  isCritical: boolean;      // Stock < 2x monthly usage
}

export interface SparePartsSummary {
  totalPartsTracked: number;
  totalValueUsed: number;
  criticalCount: number;
  avgMonthlySpend: number;
}

export interface AddPartInput {
  ticketId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}

// ============================================================
// Service
// ============================================================

export class SparePartsService {
  /**
   * Add a spare part to a repair ticket
   */
  static async addPart(tenantId: string, input: AddPartInput) {
    // Verify ticket belongs to tenant
    const ticket = await prisma.repairTicket.findFirst({
      where: { id: input.ticketId, tenantId },
    });
    if (!ticket) throw new Error('Repair ticket not found');

    // Verify product exists
    const product = await prisma.product.findFirst({
      where: { id: input.productId, tenantId },
    });
    if (!product) throw new Error('Product not found');

    const totalCost = input.quantity * input.unitCost;

    const part = await prisma.repairPart.create({
      data: {
        ticketId: input.ticketId,
        productId: input.productId,
        quantity: input.quantity,
        unitCost: input.unitCost,
        totalCost,
        notes: input.notes,
      },
      include: {
        product: { select: { name: true, sku: true } },
      },
    });

    // Update ticket partsCost
    const allParts = await prisma.repairPart.findMany({
      where: { ticketId: input.ticketId },
    });
    const newPartsCost = allParts.reduce((s, p) => s + Number(p.totalCost), 0);

    await prisma.repairTicket.update({
      where: { id: input.ticketId },
      data: {
        partsCost: newPartsCost,
        totalCost: Number(ticket.laborCost) + newPartsCost,
      },
    });

    return part;
  }

  /**
   * Remove a spare part from a ticket
   */
  static async removePart(partId: string, tenantId: string) {
    const part = await prisma.repairPart.findFirst({
      where: { id: partId },
      include: { ticket: { select: { id: true, tenantId: true, laborCost: true } } },
    });
    if (!part || part.ticket.tenantId !== tenantId) throw new Error('Part not found');

    await prisma.repairPart.delete({ where: { id: partId } });

    // Recalculate ticket costs
    const remaining = await prisma.repairPart.findMany({
      where: { ticketId: part.ticketId },
    });
    const newPartsCost = remaining.reduce((s, p) => s + Number(p.totalCost), 0);

    await prisma.repairTicket.update({
      where: { id: part.ticketId },
      data: {
        partsCost: newPartsCost,
        totalCost: Number(part.ticket.laborCost) + newPartsCost,
      },
    });

    return { deleted: true };
  }

  /**
   * Get parts for a specific ticket
   */
  static async getPartsForTicket(ticketId: string, tenantId: string) {
    const ticket = await prisma.repairTicket.findFirst({
      where: { id: ticketId, tenantId },
    });
    if (!ticket) throw new Error('Ticket not found');

    return prisma.repairPart.findMany({
      where: { ticketId },
      include: {
        product: { select: { name: true, sku: true, quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Spare parts usage analytics — which products are most used in repairs
   */
  static async getUsageAnalytics(tenantId: string): Promise<{
    summary: SparePartsSummary;
    parts: SparePartUsage[];
  }> {
    // Get all repair parts for tenant
    const parts = await prisma.repairPart.findMany({
      where: { ticket: { tenantId } },
      include: {
        product: { select: { id: true, name: true, sku: true, quantity: true } },
      },
    });

    // Group by product
    const byProduct = new Map<string, {
      product: { id: string; name: string; sku: string | null; quantity: number };
      totalQty: number;
      totalCost: number;
      ticketIds: Set<string>;
      lastUsedAt: Date;
    }>();

    for (const part of parts) {
      const key = part.productId;
      const existing = byProduct.get(key);
      if (existing) {
        existing.totalQty += part.quantity;
        existing.totalCost += Number(part.totalCost);
        existing.ticketIds.add(part.ticketId);
        if (part.createdAt > existing.lastUsedAt) existing.lastUsedAt = part.createdAt;
      } else {
        byProduct.set(key, {
          product: part.product,
          totalQty: part.quantity,
          totalCost: Number(part.totalCost),
          ticketIds: new Set([part.ticketId]),
          lastUsedAt: part.createdAt,
        });
      }
    }

    // Compute analytics per product
    const now = new Date();
    const oldest = parts.length > 0
      ? parts.reduce((min, p) => p.createdAt < min ? p.createdAt : min, parts[0].createdAt)
      : now;
    const monthsOfData = Math.max(1, (now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 30));

    const usageList: SparePartUsage[] = Array.from(byProduct.values()).map((data) => {
      const monthlyRate = data.totalQty / monthsOfData;
      const daysUntilStockout = monthlyRate > 0
        ? Math.floor(data.product.quantity / (monthlyRate / 30))
        : 999;

      return {
        productId: data.product.id,
        productName: data.product.name,
        sku: data.product.sku,
        currentStock: data.product.quantity,
        totalUsed: data.totalQty,
        repairCount: data.ticketIds.size,
        avgQtyPerRepair: Math.round((data.totalQty / data.ticketIds.size) * 100) / 100,
        lastUsedAt: data.lastUsedAt.toISOString(),
        monthlyUsageRate: Math.round(monthlyRate * 100) / 100,
        daysUntilStockout,
        isCritical: daysUntilStockout < 60,
      };
    });

    usageList.sort((a, b) => b.totalUsed - a.totalUsed);

    const totalValueUsed = Array.from(byProduct.values()).reduce((s, d) => s + d.totalCost, 0);

    return {
      summary: {
        totalPartsTracked: usageList.length,
        totalValueUsed: Math.round(totalValueUsed * 100) / 100,
        criticalCount: usageList.filter((p) => p.isCritical).length,
        avgMonthlySpend: Math.round((totalValueUsed / monthsOfData) * 100) / 100,
      },
      parts: usageList,
    };
  }
}
