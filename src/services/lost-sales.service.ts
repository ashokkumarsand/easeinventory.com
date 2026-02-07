import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export interface LostSaleEntry {
  id: string;
  productId: string;
  productName: string;
  sku: string | null;
  requestedQty: number;
  availableQty: number;
  shortfallQty: number;
  estimatedRevenue: number;
  source: string | null;
  notes: string | null;
  createdAt: string;
}

export interface LostSalesSummary {
  totalEvents: number;
  totalLostRevenue: number;
  totalShortfallUnits: number;
  topProducts: { productId: string; productName: string; lostRevenue: number; events: number }[];
  bySource: Record<string, number>;
}

export interface RecordLostSaleInput {
  productId: string;
  requestedQty: number;
  source?: string;
  orderId?: string;
  notes?: string;
}

// ============================================================
// Service
// ============================================================

export class LostSalesService {
  /**
   * Record a lost sale event
   */
  static async record(tenantId: string, userId: string, input: RecordLostSaleInput) {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, tenantId },
      select: { quantity: true, salePrice: true },
    });
    if (!product) throw new Error('Product not found');

    const availableQty = product.quantity;
    const shortfallQty = Math.max(0, input.requestedQty - availableQty);
    const estimatedRevenue = shortfallQty * Number(product.salePrice);

    return prisma.lostSale.create({
      data: {
        productId: input.productId,
        requestedQty: input.requestedQty,
        availableQty,
        shortfallQty,
        estimatedRevenue,
        source: input.source,
        orderId: input.orderId,
        notes: input.notes,
        recordedById: userId,
        tenantId,
      },
    });
  }

  /**
   * Get lost sales analytics
   */
  static async getAnalytics(
    tenantId: string,
    days = 90,
    page = 1,
    pageSize = 50,
  ): Promise<{
    summary: LostSalesSummary;
    events: LostSaleEntry[];
    total: number;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where = { tenantId, createdAt: { gte: since } };

    const [events, total] = await Promise.all([
      prisma.lostSale.findMany({
        where,
        include: { product: { select: { name: true, sku: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lostSale.count({ where }),
    ]);

    // Get all events for summary (not paginated)
    const allEvents = await prisma.lostSale.findMany({
      where,
      include: { product: { select: { name: true } } },
    });

    const totalLostRevenue = allEvents.reduce((s, e) => s + Number(e.estimatedRevenue), 0);
    const totalShortfallUnits = allEvents.reduce((s, e) => s + e.shortfallQty, 0);

    // Top products
    const productMap = new Map<string, { productName: string; lostRevenue: number; events: number }>();
    for (const e of allEvents) {
      const key = e.productId;
      const existing = productMap.get(key);
      if (existing) {
        existing.lostRevenue += Number(e.estimatedRevenue);
        existing.events += 1;
      } else {
        productMap.set(key, { productName: e.product.name, lostRevenue: Number(e.estimatedRevenue), events: 1 });
      }
    }
    const topProducts = Array.from(productMap.entries())
      .map(([productId, d]) => ({ productId, ...d }))
      .sort((a, b) => b.lostRevenue - a.lostRevenue)
      .slice(0, 10);

    // By source
    const bySource: Record<string, number> = {};
    for (const e of allEvents) {
      const src = e.source ?? 'UNKNOWN';
      bySource[src] = (bySource[src] ?? 0) + 1;
    }

    return {
      summary: {
        totalEvents: allEvents.length,
        totalLostRevenue: Math.round(totalLostRevenue * 100) / 100,
        totalShortfallUnits,
        topProducts,
        bySource,
      },
      events: events.map((e) => ({
        id: e.id,
        productId: e.productId,
        productName: e.product.name,
        sku: e.product.sku,
        requestedQty: e.requestedQty,
        availableQty: e.availableQty,
        shortfallQty: e.shortfallQty,
        estimatedRevenue: Number(e.estimatedRevenue),
        source: e.source,
        notes: e.notes,
        createdAt: e.createdAt.toISOString(),
      })),
      total,
    };
  }
}
