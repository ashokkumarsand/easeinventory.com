import prisma from '@/lib/prisma';
import { InventoryAnalyticsService } from './inventory-analytics.service';

// ============================================================
// Types
// ============================================================

export type BullwhipSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export interface BullwhipResult {
  productId: string;
  productName: string;
  sku: string | null;
  bullwhipIndex: number;
  severity: BullwhipSeverity;
  demandVariance: number;
  poVariance: number;
}

export interface SmoothedOrderResult {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  alpha: number;
  reviewPeriodDays: number;
  leadTimeDays: number;
  avgDailyDemand: number;
  smoothedDailyDemand: number;
  orderUpToLevel: number;
  recommendedQty: number;
  naiveQty: number;
  reductionPct: number;
  bullwhipIndex: number;
  bullwhipSeverity: BullwhipSeverity;
  demandTimeSeries: { date: string; actual: number; smoothed: number }[];
}

export interface DashboardSummary {
  avgBullwhipIndex: number;
  avgReductionPct: number;
  productsWithAmplification: number;
  productsAnalyzed: number;
}

export interface DashboardResult {
  summary: DashboardSummary;
  products: SmoothedOrderResult[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================
// Service
// ============================================================

export class OrderSmoothingService {
  /**
   * Calculate full EMA series for charting (not just final value)
   */
  static calculateEMASeries(values: number[], alpha: number): number[] {
    if (values.length === 0) return [];
    const series: number[] = [values[0]];
    for (let i = 1; i < values.length; i++) {
      series.push(alpha * values[i] + (1 - alpha) * series[i - 1]);
    }
    return series;
  }

  /**
   * Population variance
   */
  static getVariance(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Build zero-filled daily demand array from SalesOrderItems
   */
  static async getDailyDemandArray(
    productId: string,
    tenantId: string,
    lookbackDays: number,
  ): Promise<{ dates: string[]; values: number[] }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const dailyMap = await InventoryAnalyticsService.calculateDemand(
      productId,
      tenantId,
      startDate,
      endDate,
    );

    const dates: string[] = [];
    const values: number[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const day = cursor.toISOString().slice(0, 10);
      dates.push(day);
      values.push(dailyMap.get(day)?.quantity ?? 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    return { dates, values };
  }

  /**
   * Build zero-filled daily PO ordered qty array
   */
  static async getDailyPOArray(
    productId: string,
    tenantId: string,
    lookbackDays: number,
  ): Promise<number[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const items = await prisma.purchaseOrderItem.findMany({
      where: {
        productId,
        po: {
          tenantId,
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      include: {
        po: { select: { createdAt: true } },
      },
    });

    // Group by day
    const dailyMap = new Map<string, number>();
    for (const item of items) {
      const day = item.po.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + item.orderedQty);
    }

    // Zero-fill
    const values: number[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const day = cursor.toISOString().slice(0, 10);
      values.push(dailyMap.get(day) ?? 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    return values;
  }

  /**
   * Classify bullwhip severity
   */
  static classifySeverity(index: number): BullwhipSeverity {
    if (index < 1.0) return 'LOW';
    if (index < 1.5) return 'MODERATE';
    if (index < 2.5) return 'HIGH';
    return 'SEVERE';
  }

  /**
   * Compute bullwhip index for a single product
   */
  static async computeBullwhipIndex(
    productId: string,
    tenantId: string,
    lookbackDays = 90,
  ): Promise<BullwhipResult & { demandValues: number[]; poValues: number[] }> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, sku: true },
    });

    const { values: demandValues } = await this.getDailyDemandArray(productId, tenantId, lookbackDays);
    const poValues = await this.getDailyPOArray(productId, tenantId, lookbackDays);

    const demandVariance = this.getVariance(demandValues);
    const poVariance = this.getVariance(poValues);

    // Avoid division by zero: if demand variance is 0, bullwhip = poVariance > 0 ? Infinity capped : 0
    let bullwhipIndex = 0;
    if (demandVariance > 0) {
      bullwhipIndex = poVariance / demandVariance;
    } else if (poVariance > 0) {
      bullwhipIndex = 10; // capped high value when no demand but POs exist
    }

    return {
      productId,
      productName: product?.name ?? 'Unknown',
      sku: product?.sku ?? null,
      bullwhipIndex: Math.round(bullwhipIndex * 100) / 100,
      severity: this.classifySeverity(bullwhipIndex),
      demandVariance: Math.round(demandVariance * 100) / 100,
      poVariance: Math.round(poVariance * 100) / 100,
      demandValues,
      poValues,
    };
  }

  /**
   * Full per-product smoothed order analysis
   */
  static async computeSmoothedOrder(
    productId: string,
    tenantId: string,
    lookbackDays = 90,
  ): Promise<SmoothedOrderResult> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        sku: true,
        quantity: true,
        smoothingAlpha: true,
        reviewPeriodDays: true,
        leadTimeDays: true,
        safetyStock: true,
        productSuppliers: {
          where: { priority: 'PREFERRED' },
          select: { leadTimeDays: true },
          take: 1,
        },
      },
    });

    if (!product) throw new Error('Product not found');

    const alpha = product.smoothingAlpha ?? 0.2;
    const reviewPeriod = product.reviewPeriodDays ?? 7;
    const leadTime =
      product.productSuppliers[0]?.leadTimeDays ?? product.leadTimeDays ?? 7;
    const safetyStock = product.safetyStock ?? 0;
    const currentStock = product.quantity;

    // Get daily demand
    const { dates, values: demandValues } = await this.getDailyDemandArray(
      productId,
      tenantId,
      lookbackDays,
    );

    // EMA series
    const emaSeries = this.calculateEMASeries(demandValues, alpha);
    const smoothedDaily = emaSeries.length > 0 ? emaSeries[emaSeries.length - 1] : 0;

    // Average daily demand
    const totalDemand = demandValues.reduce((s, v) => s + v, 0);
    const avgDaily = demandValues.length > 0 ? totalDemand / demandValues.length : 0;

    // Order-up-to level: S = smoothedDaily × (leadTime + reviewPeriod) + safetyStock
    const orderUpToLevel = smoothedDaily * (leadTime + reviewPeriod) + safetyStock;
    const recommendedQty = Math.max(0, Math.ceil(orderUpToLevel - currentStock));

    // Naive comparison (matches existing reorder logic): avgDaily × leadTime × 2
    const naiveQty = Math.max(0, Math.ceil(avgDaily * leadTime * 2 - currentStock));

    // Reduction percentage
    const reductionPct =
      naiveQty > 0
        ? Math.round(((naiveQty - recommendedQty) / naiveQty) * 100)
        : 0;

    // Bullwhip
    const poValues = await this.getDailyPOArray(productId, tenantId, lookbackDays);
    const demandVariance = this.getVariance(demandValues);
    const poVariance = this.getVariance(poValues);
    let bullwhipIndex = 0;
    if (demandVariance > 0) {
      bullwhipIndex = poVariance / demandVariance;
    } else if (poVariance > 0) {
      bullwhipIndex = 10;
    }

    // Build time series for chart
    const demandTimeSeries = dates.map((date, i) => ({
      date,
      actual: Math.round(demandValues[i] * 100) / 100,
      smoothed: Math.round((emaSeries[i] ?? 0) * 100) / 100,
    }));

    return {
      productId,
      productName: product.name,
      sku: product.sku,
      currentStock,
      alpha,
      reviewPeriodDays: reviewPeriod,
      leadTimeDays: leadTime,
      avgDailyDemand: Math.round(avgDaily * 100) / 100,
      smoothedDailyDemand: Math.round(smoothedDaily * 100) / 100,
      orderUpToLevel: Math.round(orderUpToLevel),
      recommendedQty,
      naiveQty,
      reductionPct,
      bullwhipIndex: Math.round(bullwhipIndex * 100) / 100,
      bullwhipSeverity: this.classifySeverity(bullwhipIndex),
      demandTimeSeries,
    };
  }

  /**
   * Dashboard: bulk analysis with summary + paginated products
   */
  static async getDashboard(
    tenantId: string,
    lookbackDays = 90,
    page = 1,
    pageSize = 50,
    search?: string,
  ): Promise<DashboardResult> {
    // Get active products
    const where: any = {
      tenantId,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [allProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: { id: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Compute per-product in parallel (batch of page)
    const products = await Promise.all(
      allProducts.map((p) => this.computeSmoothedOrder(p.id, tenantId, lookbackDays)),
    );

    // Summary stats from this page
    const bullwhipValues = products.map((p) => p.bullwhipIndex);
    const reductionValues = products.map((p) => p.reductionPct);

    const avgBullwhipIndex =
      bullwhipValues.length > 0
        ? Math.round(
            (bullwhipValues.reduce((s, v) => s + v, 0) / bullwhipValues.length) * 100,
          ) / 100
        : 0;

    const avgReductionPct =
      reductionValues.length > 0
        ? Math.round(
            reductionValues.reduce((s, v) => s + v, 0) / reductionValues.length,
          )
        : 0;

    return {
      summary: {
        avgBullwhipIndex,
        avgReductionPct,
        productsWithAmplification: products.filter((p) => p.bullwhipIndex > 1).length,
        productsAnalyzed: total,
      },
      products,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Bullwhip report: all products sorted by bullwhip index descending
   */
  static async getBullwhipReport(
    tenantId: string,
    lookbackDays = 90,
    limit = 20,
  ): Promise<BullwhipResult[]> {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true },
      orderBy: { name: 'asc' },
    });

    const results = await Promise.all(
      products.map((p) =>
        this.computeBullwhipIndex(p.id, tenantId, lookbackDays).then(
          // Strip internal arrays from result
          ({ demandValues: _d, poValues: _p, ...rest }) => rest,
        ),
      ),
    );

    // Sort by bullwhip index descending, take top N
    return results
      .sort((a, b) => b.bullwhipIndex - a.bullwhipIndex)
      .slice(0, limit);
  }

  /**
   * Update smoothing configuration for a product
   */
  static async updateConfig(
    productId: string,
    tenantId: string,
    alpha?: number,
    reviewPeriodDays?: number,
  ) {
    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true },
    });
    if (!product) throw new Error('Product not found');

    const data: any = {};
    if (alpha !== undefined) {
      if (alpha < 0.01 || alpha > 0.99) throw new Error('Alpha must be between 0.01 and 0.99');
      data.smoothingAlpha = alpha;
    }
    if (reviewPeriodDays !== undefined) {
      if (reviewPeriodDays < 1 || reviewPeriodDays > 365) throw new Error('Review period must be between 1 and 365');
      data.reviewPeriodDays = reviewPeriodDays;
    }

    return prisma.product.update({
      where: { id: productId },
      data,
      select: {
        id: true,
        name: true,
        smoothingAlpha: true,
        reviewPeriodDays: true,
      },
    });
  }
}
