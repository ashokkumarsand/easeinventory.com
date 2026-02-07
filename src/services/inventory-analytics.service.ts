import prisma from '@/lib/prisma';
import { DemandPeriodType, Prisma } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface DemandVelocity {
  productId: string;
  productName: string;
  sku: string | null;
  avgDailyDemand: number;
  avgWeeklyDemand: number;
  avgMonthlyDemand: number;
  movingAvg7d: number;
  movingAvg30d: number;
  stdDeviation: number;
  coefficientOfVariation: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  totalQuantitySold: number;
  totalRevenue: number;
  currentStock: number;
}

export interface SeasonalityResult {
  productId: string;
  monthlyData: { month: number; avgQuantity: number; deviation: number }[];
  peakMonths: number[];
  troughMonths: number[];
  isHighlySeasonalCV: number;
}

export interface DemandFilter {
  categoryId?: string;
  abcClass?: string;
  search?: string;
}

// ============================================================
// Section 1: Demand Analytics
// ============================================================

export class InventoryAnalyticsService {
  /**
   * Calculate daily demand for a product from SalesOrderItems
   */
  static async calculateDemand(
    productId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Get sales from SalesOrderItems where order was confirmed/shipped/delivered
    const items = await prisma.salesOrderItem.findMany({
      where: {
        productId,
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      include: {
        order: { select: { createdAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyMap = new Map<string, { quantity: number; revenue: number; cost: number; orders: number }>();
    for (const item of items) {
      const day = item.order.createdAt.toISOString().slice(0, 10);
      const existing = dailyMap.get(day) || { quantity: 0, revenue: 0, cost: 0, orders: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.total);
      existing.cost += Number(item.unitPrice) * item.quantity;
      existing.orders += 1;
      dailyMap.set(day, existing);
    }

    return dailyMap;
  }

  /**
   * Refresh DemandSnapshot records for a tenant
   */
  static async refreshDemandSnapshots(
    tenantId: string,
    periodType: DemandPeriodType = 'DAILY',
    lookbackDays = 90,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    // Get all active products
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true },
    });

    let refreshedCount = 0;

    for (const product of products) {
      const dailyMap = await this.calculateDemand(product.id, tenantId, startDate, endDate);
      if (dailyMap.size === 0) continue;

      // For DAILY snapshots, upsert each day
      if (periodType === 'DAILY') {
        for (const [dayStr, data] of dailyMap) {
          const periodStart = new Date(dayStr);
          const periodEnd = new Date(dayStr);
          periodEnd.setDate(periodEnd.getDate() + 1);

          await prisma.demandSnapshot.upsert({
            where: {
              productId_periodType_periodStart: {
                productId: product.id,
                periodType: 'DAILY',
                periodStart,
              },
            },
            update: {
              totalQuantity: data.quantity,
              totalRevenue: data.revenue,
              totalCost: data.cost,
              orderCount: data.orders,
            },
            create: {
              productId: product.id,
              periodType: 'DAILY',
              periodStart,
              periodEnd,
              totalQuantity: data.quantity,
              totalRevenue: data.revenue,
              totalCost: data.cost,
              orderCount: data.orders,
              tenantId,
            },
          });
          refreshedCount++;
        }
      }

      // Compute moving averages for latest snapshots
      const allDailySnapshots = await prisma.demandSnapshot.findMany({
        where: {
          productId: product.id,
          periodType: 'DAILY',
          tenantId,
        },
        orderBy: { periodStart: 'desc' },
        take: 30,
      });

      if (allDailySnapshots.length > 0) {
        const quantities = allDailySnapshots.map(s => s.totalQuantity).reverse();
        const ma7 = this.calculateSMA(quantities, 7);
        const ma30 = this.calculateSMA(quantities, 30);
        const stdDev = this.calculateStdDev(quantities);

        // Update latest snapshot with MAs
        await prisma.demandSnapshot.update({
          where: { id: allDailySnapshots[0].id },
          data: {
            movingAvg7d: ma7,
            movingAvg30d: ma30,
            stdDeviation: stdDev,
          },
        });
      }
    }

    return { refreshedCount, productsProcessed: products.length };
  }

  /**
   * Get demand velocity for a single product
   */
  static async getDemandVelocity(
    productId: string,
    tenantId: string,
    lookbackDays = 90,
  ): Promise<DemandVelocity | null> {
    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { id: true, name: true, sku: true, quantity: true, costPrice: true },
    });
    if (!product) return null;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const dailyMap = await this.calculateDemand(productId, tenantId, startDate, endDate);

    // Fill in zero-demand days
    const allDays: number[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayStr = current.toISOString().slice(0, 10);
      const data = dailyMap.get(dayStr);
      allDays.push(data?.quantity ?? 0);
      current.setDate(current.getDate() + 1);
    }

    const totalQty = allDays.reduce((s, v) => s + v, 0);
    const totalRevenue = Array.from(dailyMap.values()).reduce((s, d) => s + d.revenue, 0);
    const avgDaily = totalQty / lookbackDays;
    const ma7 = this.calculateSMA(allDays, 7);
    const ma30 = this.calculateSMA(allDays, 30);
    const stdDev = this.calculateStdDev(allDays);
    const cv = avgDaily > 0 ? stdDev / avgDaily : 0;

    // Trend: compare first half avg vs second half avg
    const half = Math.floor(allDays.length / 2);
    const firstHalfAvg = allDays.slice(0, half).reduce((s, v) => s + v, 0) / half || 0;
    const secondHalfAvg = allDays.slice(half).reduce((s, v) => s + v, 0) / (allDays.length - half) || 0;
    const trendRatio = firstHalfAvg > 0 ? secondHalfAvg / firstHalfAvg : 1;
    const trend: 'UP' | 'DOWN' | 'STABLE' = trendRatio > 1.15 ? 'UP' : trendRatio < 0.85 ? 'DOWN' : 'STABLE';

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      avgDailyDemand: Math.round(avgDaily * 100) / 100,
      avgWeeklyDemand: Math.round(avgDaily * 7 * 100) / 100,
      avgMonthlyDemand: Math.round(avgDaily * 30 * 100) / 100,
      movingAvg7d: Math.round(ma7 * 100) / 100,
      movingAvg30d: Math.round(ma30 * 100) / 100,
      stdDeviation: Math.round(stdDev * 100) / 100,
      coefficientOfVariation: Math.round(cv * 100) / 100,
      trend,
      totalQuantitySold: totalQty,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      currentStock: product.quantity,
    };
  }

  /**
   * Get bulk demand velocity for all products
   */
  static async getBulkDemandVelocity(
    tenantId: string,
    filter: DemandFilter = {},
    page = 1,
    pageSize = 50,
  ) {
    const where: Prisma.ProductWhereInput = {
      tenantId,
      isActive: true,
      ...(filter.categoryId && { categoryId: filter.categoryId }),
      ...(filter.abcClass && { abcClass: filter.abcClass }),
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' as const } },
          { sku: { contains: filter.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: { id: true, name: true, sku: true, quantity: true, costPrice: true, salePrice: true, abcClass: true, xyzClass: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    // Get latest demand snapshots for these products
    const productIds = products.map(p => p.id);
    const latestSnapshots = await prisma.demandSnapshot.findMany({
      where: {
        productId: { in: productIds },
        periodType: 'DAILY',
        tenantId,
      },
      orderBy: { periodStart: 'desc' },
    });

    // Group snapshots by productId — get latest 30 per product
    const snapshotsByProduct = new Map<string, typeof latestSnapshots>();
    for (const snap of latestSnapshots) {
      const existing = snapshotsByProduct.get(snap.productId) || [];
      if (existing.length < 30) {
        existing.push(snap);
        snapshotsByProduct.set(snap.productId, existing);
      }
    }

    const results = products.map(product => {
      const snapshots = snapshotsByProduct.get(product.id) || [];
      const totalQty = snapshots.reduce((s, snap) => s + snap.totalQuantity, 0);
      const days = Math.max(snapshots.length, 1);
      const avgDaily = totalQty / days;
      const latestSnap = snapshots[0];

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock: product.quantity,
        abcClass: product.abcClass,
        xyzClass: product.xyzClass,
        avgDailyDemand: Math.round(avgDaily * 100) / 100,
        avgWeeklyDemand: Math.round(avgDaily * 7 * 100) / 100,
        movingAvg7d: latestSnap ? Number(latestSnap.movingAvg7d || 0) : 0,
        movingAvg30d: latestSnap ? Number(latestSnap.movingAvg30d || 0) : 0,
        stdDeviation: latestSnap ? Number(latestSnap.stdDeviation || 0) : 0,
        totalQuantitySold: totalQty,
      };
    });

    return { data: results, total, page, pageSize };
  }

  /**
   * Detect seasonality for a product
   */
  static async detectSeasonality(
    productId: string,
    tenantId: string,
  ): Promise<SeasonalityResult | null> {
    // Get all monthly snapshots or aggregate from daily
    const snapshots = await prisma.demandSnapshot.findMany({
      where: {
        productId,
        periodType: 'DAILY',
        tenantId,
      },
      orderBy: { periodStart: 'asc' },
    });

    if (snapshots.length < 30) return null;

    // Group by month
    const monthlyMap = new Map<number, number[]>();
    for (const snap of snapshots) {
      const month = snap.periodStart.getMonth() + 1;
      const existing = monthlyMap.get(month) || [];
      existing.push(snap.totalQuantity);
      monthlyMap.set(month, existing);
    }

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const values = monthlyMap.get(month) || [0];
      const avg = values.reduce((s, v) => s + v, 0) / values.length;
      return { month, avgQuantity: Math.round(avg * 100) / 100, deviation: 0 };
    });

    const overallAvg = monthlyData.reduce((s, m) => s + m.avgQuantity, 0) / 12;
    for (const m of monthlyData) {
      m.deviation = overallAvg > 0 ? Math.round(((m.avgQuantity - overallAvg) / overallAvg) * 100) / 100 : 0;
    }

    const sorted = [...monthlyData].sort((a, b) => b.avgQuantity - a.avgQuantity);
    const peakMonths = sorted.filter(m => m.deviation > 0.2).map(m => m.month);
    const troughMonths = sorted.filter(m => m.deviation < -0.2).map(m => m.month);

    const monthAvgs = monthlyData.map(m => m.avgQuantity);
    const seasonalCV = overallAvg > 0 ? this.calculateStdDev(monthAvgs) / overallAvg : 0;

    return {
      productId,
      monthlyData,
      peakMonths,
      troughMonths,
      isHighlySeasonalCV: Math.round(seasonalCV * 100) / 100,
    };
  }

  // ============================================================
  // Section 2: Safety Stock & Reorder Point (Commit 3)
  // ============================================================

  static getZScore(serviceLevel: number): number {
    const table: Record<string, number> = {
      '0.85': 1.04, '0.90': 1.28, '0.95': 1.65, '0.97': 1.88, '0.99': 2.33,
    };
    return table[serviceLevel.toFixed(2)] ?? 1.65;
  }

  /**
   * Safety Stock = Z × σ × √L
   */
  static calculateSafetyStock(avgDaily: number, stdDev: number, leadTimeDays: number, serviceLevel = 0.95): number {
    const z = this.getZScore(serviceLevel);
    return Math.ceil(z * stdDev * Math.sqrt(leadTimeDays));
  }

  /**
   * Reorder Point = D̄ × L + SS
   */
  static calculateReorderPoint(avgDaily: number, leadTimeDays: number, safetyStock: number): number {
    return Math.ceil(avgDaily * leadTimeDays + safetyStock);
  }

  /**
   * EOQ = √(2DS/H) where D=annual demand, S=ordering cost, H=holding cost per unit per year
   */
  static calculateEOQ(annualDemand: number, orderingCost = 500, holdingCostPerUnit?: number): number {
    const h = holdingCostPerUnit ?? (orderingCost * 0.25); // Default 25% of ordering cost
    if (h <= 0 || annualDemand <= 0) return 0;
    return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / h));
  }

  /**
   * Compute and persist reorder params for a product
   */
  static async computeAndSaveReorderParams(
    productId: string,
    tenantId: string,
    serviceLevel = 0.95,
  ) {
    const velocity = await this.getDemandVelocity(productId, tenantId);
    if (!velocity) return null;

    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: { leadTimeDays: true, costPrice: true, supplierId: true, supplier: { select: { avgLeadTimeDays: true } } },
    });

    const leadTime = product?.leadTimeDays ?? product?.supplier?.avgLeadTimeDays ?? 7;
    const ss = this.calculateSafetyStock(velocity.avgDailyDemand, velocity.stdDeviation, leadTime, serviceLevel);
    const rop = this.calculateReorderPoint(velocity.avgDailyDemand, leadTime, ss);
    const eoq = this.calculateEOQ(velocity.avgDailyDemand * 365, 500, Number(product?.costPrice ?? 100) * 0.25);

    await prisma.product.update({
      where: { id: productId },
      data: { safetyStock: ss, reorderPoint: rop, economicOrderQty: eoq, leadTimeDays: leadTime },
    });

    return { productId, safetyStock: ss, reorderPoint: rop, economicOrderQty: eoq, leadTimeDays: leadTime };
  }

  /**
   * Bulk compute reorder params for all active products
   */
  static async bulkComputeReorderParams(tenantId: string, serviceLevel = 0.95) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true },
    });

    let updated = 0;
    for (const product of products) {
      const result = await this.computeAndSaveReorderParams(product.id, tenantId, serviceLevel);
      if (result) updated++;
    }
    return { updated, total: products.length };
  }

  // ============================================================
  // Section 3: ABC/XYZ Classification (Commit 4)
  // ============================================================

  /**
   * ABC Classification — Pareto: A=80% revenue, B=next 15%, C=bottom 5%
   */
  static async classifyABC(tenantId: string, lookbackDays = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    // Get revenue per product from SalesOrderItems
    const productRevenue = await prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate },
        },
        productId: { not: null },
      },
      _sum: { total: true },
    });

    const sorted = productRevenue
      .map(r => ({ productId: r.productId!, revenue: Number(r._sum.total ?? 0) }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = sorted.reduce((s, r) => s + r.revenue, 0);
    if (totalRevenue === 0) return [];

    let cumulative = 0;
    const classified = sorted.map(item => {
      cumulative += item.revenue;
      const pct = cumulative / totalRevenue;
      const abcClass = pct <= 0.80 ? 'A' : pct <= 0.95 ? 'B' : 'C';
      return { ...item, abcClass, cumulativePct: Math.round(pct * 100) / 100 };
    });

    return classified;
  }

  /**
   * XYZ Classification — CV: X<0.5, Y=0.5-1.0, Z≥1.0
   */
  static async classifyXYZ(tenantId: string, lookbackDays = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true },
    });

    const results: { productId: string; cv: number; xyzClass: string }[] = [];

    for (const product of products) {
      const dailyMap = await this.calculateDemand(product.id, tenantId, startDate, new Date());
      const values = Array.from(dailyMap.values()).map(d => d.quantity);
      if (values.length === 0) {
        results.push({ productId: product.id, cv: Infinity, xyzClass: 'Z' });
        continue;
      }
      const avg = values.reduce((s, v) => s + v, 0) / lookbackDays;
      // Fill zeros for days with no sales
      const allDays = new Array(lookbackDays).fill(0);
      let idx = 0;
      for (const v of values) {
        allDays[idx++] = v;
      }
      const stdDev = this.calculateStdDev(allDays);
      const cv = avg > 0 ? stdDev / avg : Infinity;
      const xyzClass = cv < 0.5 ? 'X' : cv < 1.0 ? 'Y' : 'Z';
      results.push({ productId: product.id, cv: Math.round(cv * 100) / 100, xyzClass });
    }

    return results;
  }

  /**
   * Run full classification and persist results
   */
  static async runFullClassification(tenantId: string) {
    const [abcResults, xyzResults] = await Promise.all([
      this.classifyABC(tenantId),
      this.classifyXYZ(tenantId),
    ]);

    const abcMap = new Map(abcResults.map(r => [r.productId, r.abcClass]));
    const xyzMap = new Map(xyzResults.map(r => [r.productId, r.xyzClass]));

    const allProductIds = new Set([...abcMap.keys(), ...xyzMap.keys()]);
    let updated = 0;

    for (const pid of allProductIds) {
      await prisma.product.update({
        where: { id: pid },
        data: {
          abcClass: abcMap.get(pid) ?? null,
          xyzClass: xyzMap.get(pid) ?? null,
        },
      });
      updated++;
    }

    return { updated, abcDistribution: this.countDistribution(abcResults.map(r => r.abcClass)), xyzDistribution: this.countDistribution(xyzResults.map(r => r.xyzClass)) };
  }

  /**
   * Get strategy recommendation based on ABC/XYZ combo
   */
  static getStrategyRecommendation(abc: string, xyz: string) {
    const strategies: Record<string, { policy: string; reviewFrequency: string; automation: string }> = {
      'AX': { policy: 'Just-in-time replenishment', reviewFrequency: 'Daily', automation: 'Full auto-reorder' },
      'AY': { policy: 'Regular review with safety stock', reviewFrequency: 'Weekly', automation: 'Auto-reorder with manual approval' },
      'AZ': { policy: 'High safety stock, careful monitoring', reviewFrequency: 'Daily', automation: 'Manual review required' },
      'BX': { policy: 'Regular periodic review', reviewFrequency: 'Weekly', automation: 'Auto-reorder' },
      'BY': { policy: 'Periodic review with moderate safety stock', reviewFrequency: 'Bi-weekly', automation: 'Auto-reorder with alerts' },
      'BZ': { policy: 'Moderate safety stock, order in bulk', reviewFrequency: 'Weekly', automation: 'Semi-automated' },
      'CX': { policy: 'Min-max with low safety stock', reviewFrequency: 'Monthly', automation: 'Auto-reorder' },
      'CY': { policy: 'Periodic bulk ordering', reviewFrequency: 'Monthly', automation: 'Auto-reorder' },
      'CZ': { policy: 'Order on demand, consider discontinuing', reviewFrequency: 'Quarterly', automation: 'Manual only' },
    };
    return strategies[`${abc}${xyz}`] ?? { policy: 'Standard review', reviewFrequency: 'Monthly', automation: 'Manual' };
  }

  // ============================================================
  // Section 4: Inventory KPIs (Commit 5)
  // ============================================================

  /**
   * Inventory Turnover = COGS / Avg Inventory Value
   */
  static async calculateTurnover(tenantId: string, startDate: Date, endDate: Date) {
    // COGS from sales order items
    const cogs = await prisma.salesOrderItem.aggregate({
      where: {
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      _sum: { total: true },
    });

    // Average inventory value
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { quantity: true, costPrice: true },
    });

    const totalInventoryValue = products.reduce((s, p) => s + p.quantity * Number(p.costPrice), 0);
    const cogsValue = Number(cogs._sum.total ?? 0);
    const turnover = totalInventoryValue > 0 ? cogsValue / totalInventoryValue : 0;

    return { turnover: Math.round(turnover * 100) / 100, cogsValue, totalInventoryValue };
  }

  /**
   * GMROI = Gross Margin / Avg Inventory at Cost
   */
  static async calculateGMROI(tenantId: string, startDate: Date, endDate: Date) {
    const items = await prisma.salesOrderItem.findMany({
      where: {
        order: {
          tenantId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate, lte: endDate },
        },
        productId: { not: null },
      },
      include: { product: { select: { costPrice: true } } },
    });

    let revenue = 0;
    let cost = 0;
    for (const item of items) {
      revenue += Number(item.total);
      cost += item.quantity * Number(item.product?.costPrice ?? item.unitPrice);
    }

    const grossMargin = revenue - cost;
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { quantity: true, costPrice: true },
    });
    const avgInventoryCost = products.reduce((s, p) => s + p.quantity * Number(p.costPrice), 0);

    return {
      gmroi: avgInventoryCost > 0 ? Math.round((grossMargin / avgInventoryCost) * 100) / 100 : 0,
      grossMargin: Math.round(grossMargin * 100) / 100,
      avgInventoryCost,
    };
  }

  /**
   * Days of Supply per product = Current Stock / Avg Daily Demand
   */
  static async calculateDaysOfSupply(tenantId: string) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true, quantity: { gt: 0 } },
      select: { id: true, name: true, quantity: true },
    });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const results: { productId: string; productName: string; daysOfSupply: number; currentStock: number }[] = [];

    for (const product of products) {
      const dailyMap = await this.calculateDemand(product.id, tenantId, startDate, endDate);
      const totalQty = Array.from(dailyMap.values()).reduce((s, d) => s + d.quantity, 0);
      const avgDaily = totalQty / 30;
      const dos = avgDaily > 0 ? Math.round(product.quantity / avgDaily) : 999;
      results.push({ productId: product.id, productName: product.name, daysOfSupply: dos, currentStock: product.quantity });
    }

    const avgDos = results.length > 0 ? results.reduce((s, r) => s + r.daysOfSupply, 0) / results.length : 0;
    return { products: results, avgDaysOfSupply: Math.round(avgDos) };
  }

  /**
   * Fill Rate = Fully fulfilled orders / Total orders
   */
  static async calculateFillRate(tenantId: string, startDate: Date, endDate: Date) {
    const [fulfilledCount, totalCount] = await Promise.all([
      prisma.salesOrder.count({
        where: { tenantId, createdAt: { gte: startDate, lte: endDate }, fulfillmentStatus: 'FULFILLED' },
      }),
      prisma.salesOrder.count({
        where: { tenantId, createdAt: { gte: startDate, lte: endDate }, status: { not: 'CANCELLED' } },
      }),
    ]);

    return {
      fillRate: totalCount > 0 ? Math.round((fulfilledCount / totalCount) * 10000) / 10000 : 0,
      fulfilledCount,
      totalCount,
    };
  }

  /**
   * Stockout Rate = Zero-stock active products / Total active products
   */
  static async calculateStockoutRate(tenantId: string) {
    const [zeroStock, totalActive] = await Promise.all([
      prisma.product.count({ where: { tenantId, isActive: true, quantity: 0 } }),
      prisma.product.count({ where: { tenantId, isActive: true } }),
    ]);

    return {
      stockoutRate: totalActive > 0 ? Math.round((zeroStock / totalActive) * 10000) / 10000 : 0,
      zeroStockCount: zeroStock,
      totalActive,
    };
  }

  /**
   * Aging Analysis — stock value by age buckets
   */
  static async calculateAgingAnalysis(tenantId: string) {
    const lots = await prisma.productLot.findMany({
      where: { tenantId, isActive: true, quantity: { gt: 0 } },
      select: { quantity: true, costPrice: true, purchaseDate: true },
    });

    const now = new Date();
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '91-180': 0, '180+': 0 };

    for (const lot of lots) {
      const ageDays = Math.floor((now.getTime() - lot.purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      const value = lot.quantity * Number(lot.costPrice);

      if (ageDays <= 30) buckets['0-30'] += value;
      else if (ageDays <= 60) buckets['31-60'] += value;
      else if (ageDays <= 90) buckets['61-90'] += value;
      else if (ageDays <= 180) buckets['91-180'] += value;
      else buckets['180+'] += value;
    }

    // Round values
    for (const key of Object.keys(buckets) as (keyof typeof buckets)[]) {
      buckets[key] = Math.round(buckets[key] * 100) / 100;
    }

    return buckets;
  }

  /**
   * Compute and save a KPI snapshot
   */
  static async computeAndSaveKpiSnapshot(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [turnoverResult, gmroiResult, fillRateResult, stockoutResult, carryingCostResult, workingCapitalResult, valuationSummary] = await Promise.all([
      this.calculateTurnover(tenantId, thirtyDaysAgo, now),
      this.calculateGMROI(tenantId, thirtyDaysAgo, now),
      this.calculateFillRate(tenantId, thirtyDaysAgo, now),
      this.calculateStockoutRate(tenantId),
      this.calculateCarryingCost(tenantId),
      this.calculateWorkingCapitalMetrics(tenantId, thirtyDaysAgo, now),
      this.getValuationSummary(tenantId),
    ]);

    const periodDate = new Date(now.toISOString().slice(0, 10));

    const kpiData = {
      inventoryTurnover: turnoverResult.turnover,
      gmroi: gmroiResult.gmroi,
      fillRate: fillRateResult.fillRate,
      stockoutRate: stockoutResult.stockoutRate,
      totalInventoryValue: turnoverResult.totalInventoryValue,
      totalInventoryValueAtSale: valuationSummary.totalValueAtSale,
      carryingCostMonthly: carryingCostResult.monthlyCarryingCost,
      carryingCostRate: carryingCostResult.annualRate,
      inventoryToRevenueRatio: workingCapitalResult.inventoryToRevenueRatio,
      inventoryDays: workingCapitalResult.inventoryDays,
    };

    const snapshot = await prisma.inventoryKpiSnapshot.upsert({
      where: {
        tenantId_periodDate_periodType: {
          tenantId,
          periodDate,
          periodType: 'DAILY',
        },
      },
      update: kpiData,
      create: { tenantId, periodDate, periodType: 'DAILY', ...kpiData },
    });

    return snapshot;
  }

  // ============================================================
  // Section 5: Perishable Management (Commit 6)
  // ============================================================

  /**
   * Get lots expiring within N days, sorted FEFO
   */
  static async getExpiringLots(tenantId: string, withinDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + withinDays);

    const lots = await prisma.productLot.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: { gt: 0 },
        expiryDate: { not: null, lte: cutoffDate },
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();
    return lots.map(lot => {
      const daysUntilExpiry = lot.expiryDate ? Math.floor((lot.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      const urgency = daysUntilExpiry <= 0 ? 'EXPIRED' : daysUntilExpiry <= 7 ? 'CRITICAL' : daysUntilExpiry <= 30 ? 'WARNING' : 'NOTICE';
      return { ...lot, daysUntilExpiry, urgency };
    });
  }

  /**
   * FEFO lot allocation: allocate from nearest-expiry lots first
   */
  static async getFEFOLots(productId: string, tenantId: string, requiredQty: number) {
    const lots = await prisma.productLot.findMany({
      where: {
        productId,
        tenantId,
        isActive: true,
        quantity: { gt: 0 },
        expiryDate: { not: null },
      },
      orderBy: { expiryDate: 'asc' },
    });

    let remaining = requiredQty;
    const allocation: { lotId: string; lotNumber: string; allocatedQty: number; expiryDate: Date | null }[] = [];

    for (const lot of lots) {
      if (remaining <= 0) break;
      const allocQty = Math.min(lot.quantity, remaining);
      allocation.push({ lotId: lot.id, lotNumber: lot.lotNumber, allocatedQty: allocQty, expiryDate: lot.expiryDate });
      remaining -= allocQty;
    }

    return { allocation, unallocated: Math.max(remaining, 0) };
  }

  /**
   * Waste metrics: expired quantity/value
   */
  static async calculateWasteMetrics(tenantId: string, startDate: Date, endDate: Date) {
    const now = new Date();

    // Find expired lots
    const expiredLots = await prisma.productLot.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: { gt: 0 },
        expiryDate: { not: null, lt: now },
      },
      select: { quantity: true, costPrice: true },
    });

    const expiredQty = expiredLots.reduce((s, l) => s + l.quantity, 0);
    const expiredValue = expiredLots.reduce((s, l) => s + l.quantity * Number(l.costPrice), 0);

    // Total inventory value for waste rate
    const totalValue = await prisma.product.aggregate({
      where: { tenantId, isActive: true },
      _sum: { quantity: true },
    });

    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { quantity: true, costPrice: true },
    });
    const totalInventoryValue = products.reduce((s, p) => s + p.quantity * Number(p.costPrice), 0);

    return {
      expiredLotCount: expiredLots.length,
      expiredQuantity: expiredQty,
      expiredValue: Math.round(expiredValue * 100) / 100,
      wasteRate: totalInventoryValue > 0 ? Math.round((expiredValue / totalInventoryValue) * 10000) / 10000 : 0,
    };
  }

  /**
   * Get expiry alerts grouped by urgency
   */
  static async getExpiryAlerts(tenantId: string) {
    const lots = await this.getExpiringLots(tenantId, 90);

    const critical = lots.filter(l => l.urgency === 'CRITICAL' || l.urgency === 'EXPIRED');
    const warning = lots.filter(l => l.urgency === 'WARNING');
    const notice = lots.filter(l => l.urgency === 'NOTICE');

    return {
      critical: { count: critical.length, lots: critical },
      warning: { count: warning.length, lots: warning },
      notice: { count: notice.length, lots: notice },
      totalAlerts: lots.length,
    };
  }

  // ============================================================
  // Section 6: Reorder Suggestions (Commit 7)
  // ============================================================

  /**
   * Generate reorder suggestions for products below reorder point
   */
  static async generateReorderSuggestions(tenantId: string) {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        reorderPoint: { not: null },
      },
      select: {
        id: true, name: true, quantity: true, reorderPoint: true, safetyStock: true,
        economicOrderQty: true, leadTimeDays: true, costPrice: true, supplierId: true,
      },
    });

    const suggestions: Prisma.ReorderSuggestionCreateManyInput[] = [];

    for (const product of products) {
      if (product.reorderPoint == null || product.quantity > product.reorderPoint) continue;

      // Get recent demand for avg daily
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const dailyMap = await this.calculateDemand(product.id, tenantId, startDate, endDate);
      const totalQty = Array.from(dailyMap.values()).reduce((s, d) => s + d.quantity, 0);
      const avgDaily = totalQty / 30;

      const suggestedQty = product.economicOrderQty ?? Math.max(
        Math.ceil(avgDaily * (product.leadTimeDays ?? 7) * 2),
        1
      );
      const daysUntilStockout = avgDaily > 0 ? Math.floor(product.quantity / avgDaily) : 999;
      const urgency = daysUntilStockout <= 2 ? 'CRITICAL' as const
        : daysUntilStockout <= 7 ? 'HIGH' as const
        : daysUntilStockout <= 14 ? 'NORMAL' as const
        : 'LOW' as const;

      suggestions.push({
        productId: product.id,
        suggestedQty,
        currentStock: product.quantity,
        reorderPoint: product.reorderPoint,
        safetyStock: product.safetyStock ?? 0,
        avgDailyDemand: avgDaily,
        leadTimeDays: product.leadTimeDays ?? 7,
        estimatedCost: suggestedQty * Number(product.costPrice),
        supplierId: product.supplierId,
        urgency,
        daysUntilStockout,
        tenantId,
      });
    }

    // Clear old pending suggestions and insert new
    await prisma.reorderSuggestion.deleteMany({
      where: { tenantId, status: 'PENDING' },
    });

    if (suggestions.length > 0) {
      await prisma.reorderSuggestion.createMany({ data: suggestions });
    }

    return { generated: suggestions.length };
  }

  /**
   * Dismiss a suggestion
   */
  static async dismissSuggestion(id: string, tenantId: string) {
    return prisma.reorderSuggestion.updateMany({
      where: { id, tenantId },
      data: { status: 'DISMISSED' },
    });
  }

  /**
   * List suggestions with filter
   */
  static async listSuggestions(
    tenantId: string,
    filter: { status?: string; urgency?: string } = {},
    page = 1,
    pageSize = 50,
  ) {
    const where: Prisma.ReorderSuggestionWhereInput = {
      tenantId,
      ...(filter.status && { status: filter.status as any }),
      ...(filter.urgency && { urgency: filter.urgency as any }),
    };

    const [data, total] = await Promise.all([
      prisma.reorderSuggestion.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy: [{ urgency: 'asc' }, { daysUntilStockout: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.reorderSuggestion.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  // ============================================================
  // Section 7: Dead Stock & Slow Movers (Commit 8)
  // ============================================================

  /**
   * Dead stock: zero sales in N days + positive inventory
   */
  static async getDeadStock(tenantId: string, noSaleDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - noSaleDays);

    // Get products with stock but no recent sales
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: { gt: 0 },
      },
      select: {
        id: true, name: true, sku: true, quantity: true, costPrice: true, abcClass: true,
        category: { select: { name: true } },
      },
    });

    const deadStock: {
      productId: string; productName: string; sku: string | null;
      currentStock: number; stockValue: number; daysSinceLastSale: number;
      recommendation: ReturnType<typeof InventoryAnalyticsService.getMarkdownRecommendation>;
      categoryName: string | null; abcClass: string | null;
    }[] = [];

    for (const product of products) {
      // Check most recent sale
      const lastSale = await prisma.salesOrderItem.findFirst({
        where: {
          productId: product.id,
          order: {
            tenantId,
            status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      if (lastSale && lastSale.createdAt >= cutoffDate) continue; // Has recent sales

      const daysSinceLastSale = lastSale
        ? Math.floor((new Date().getTime() - lastSale.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      const stockValue = product.quantity * Number(product.costPrice);

      deadStock.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock: product.quantity,
        stockValue: Math.round(stockValue * 100) / 100,
        daysSinceLastSale,
        recommendation: this.getMarkdownRecommendation(product.quantity, daysSinceLastSale, Number(product.costPrice), product.abcClass),
        categoryName: product.category?.name ?? null,
        abcClass: product.abcClass,
      });
    }

    deadStock.sort((a, b) => b.stockValue - a.stockValue);

    return {
      products: deadStock,
      totalCount: deadStock.length,
      totalValue: Math.round(deadStock.reduce((s, d) => s + d.stockValue, 0) * 100) / 100,
    };
  }

  /**
   * Slow movers: below average velocity
   */
  static async getSlowMovers(tenantId: string, lookbackDays = 90, slowFactor = 0.25) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true, quantity: { gt: 0 } },
      select: {
        id: true, name: true, sku: true, quantity: true, costPrice: true, abcClass: true,
        category: { select: { name: true } },
      },
    });

    // Calculate velocity for all products
    const velocities: { product: typeof products[0]; dailyAvg: number; totalQty: number }[] = [];

    for (const product of products) {
      const dailyMap = await this.calculateDemand(product.id, tenantId, startDate, new Date());
      const totalQty = Array.from(dailyMap.values()).reduce((s, d) => s + d.quantity, 0);
      velocities.push({ product, dailyAvg: totalQty / lookbackDays, totalQty });
    }

    const overallAvgVelocity = velocities.length > 0
      ? velocities.reduce((s, v) => s + v.dailyAvg, 0) / velocities.length
      : 0;

    const threshold = overallAvgVelocity * slowFactor;

    const slowMovers = velocities
      .filter(v => v.dailyAvg > 0 && v.dailyAvg < threshold)
      .map(v => ({
        productId: v.product.id,
        productName: v.product.name,
        sku: v.product.sku,
        currentStock: v.product.quantity,
        stockValue: Math.round(v.product.quantity * Number(v.product.costPrice) * 100) / 100,
        avgDailyDemand: Math.round(v.dailyAvg * 100) / 100,
        totalSold: v.totalQty,
        velocityVsAvg: Math.round((v.dailyAvg / overallAvgVelocity) * 100) / 100,
        categoryName: v.product.category?.name ?? null,
        abcClass: v.product.abcClass,
      }))
      .sort((a, b) => a.velocityVsAvg - b.velocityVsAvg);

    return {
      products: slowMovers,
      totalCount: slowMovers.length,
      totalValue: Math.round(slowMovers.reduce((s, m) => s + m.stockValue, 0) * 100) / 100,
      overallAvgVelocity: Math.round(overallAvgVelocity * 100) / 100,
    };
  }

  /**
   * Markdown/action recommendation for dead/slow stock
   */
  static getMarkdownRecommendation(
    currentStock: number,
    daysSinceLastSale: number,
    costPrice: number,
    abcClass: string | null,
  ) {
    if (daysSinceLastSale > 365) {
      return { action: 'LIQUIDATE', rationale: 'No sales in over a year. Consider liquidation or donation for tax benefit.' };
    }
    if (daysSinceLastSale > 180) {
      if (abcClass === 'C') {
        return { action: 'DISCONTINUE', rationale: 'Low-value item with no sales in 6+ months. Discontinue and clear.' };
      }
      return { action: 'MARKDOWN', rationale: 'Consider 30-50% markdown to clear inventory before it ages further.' };
    }
    if (daysSinceLastSale > 90) {
      return { action: 'BUNDLE', rationale: 'Bundle with faster-moving products or offer as a promotion add-on.' };
    }
    return { action: 'HOLD', rationale: 'Monitor for another cycle before taking action.' };
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  static calculateSMA(values: number[], periods: number): number {
    if (values.length === 0) return 0;
    const slice = values.slice(-periods);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  }

  static calculateEMA(values: number[], periods: number): number {
    if (values.length === 0) return 0;
    const alpha = 2 / (periods + 1);
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = alpha * values[i] + (1 - alpha) * ema;
    }
    return ema;
  }

  static calculateStdDev(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // ============================================================
  // Section 8: Inventory Valuation & Working Capital (P6-T4)
  // ============================================================

  /**
   * Get valuation summary: total value at cost & sale, margin, ABC breakdown
   */
  static async getValuationSummary(tenantId: string) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { quantity: true, costPrice: true, salePrice: true, abcClass: true },
    });

    let totalValueAtCost = 0;
    let totalValueAtSale = 0;
    const abcBreakdown: Record<string, { count: number; valueAtCost: number; valueAtSale: number }> = {};

    for (const p of products) {
      const cost = p.quantity * Number(p.costPrice);
      const sale = p.quantity * Number(p.salePrice);
      totalValueAtCost += cost;
      totalValueAtSale += sale;

      const cls = p.abcClass || 'Unclassified';
      if (!abcBreakdown[cls]) abcBreakdown[cls] = { count: 0, valueAtCost: 0, valueAtSale: 0 };
      abcBreakdown[cls].count += 1;
      abcBreakdown[cls].valueAtCost += cost;
      abcBreakdown[cls].valueAtSale += sale;
    }

    // Round breakdown values
    for (const cls of Object.keys(abcBreakdown)) {
      abcBreakdown[cls].valueAtCost = Math.round(abcBreakdown[cls].valueAtCost * 100) / 100;
      abcBreakdown[cls].valueAtSale = Math.round(abcBreakdown[cls].valueAtSale * 100) / 100;
    }

    const potentialMargin = totalValueAtSale - totalValueAtCost;
    const marginPct = totalValueAtSale > 0 ? (potentialMargin / totalValueAtSale) * 100 : 0;

    return {
      totalValueAtCost: Math.round(totalValueAtCost * 100) / 100,
      totalValueAtSale: Math.round(totalValueAtSale * 100) / 100,
      potentialMargin: Math.round(potentialMargin * 100) / 100,
      marginPct: Math.round(marginPct * 100) / 100,
      totalSKUs: products.length,
      abcBreakdown,
    };
  }

  /**
   * Valuation grouped by product category
   */
  static async getValuationByCategory(tenantId: string) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { quantity: true, costPrice: true, salePrice: true, category: { select: { name: true } } },
    });

    const categoryMap = new Map<string, { valueAtCost: number; valueAtSale: number; skuCount: number; totalUnits: number }>();

    for (const p of products) {
      const catName = p.category?.name || 'Uncategorized';
      const existing = categoryMap.get(catName) || { valueAtCost: 0, valueAtSale: 0, skuCount: 0, totalUnits: 0 };
      existing.valueAtCost += p.quantity * Number(p.costPrice);
      existing.valueAtSale += p.quantity * Number(p.salePrice);
      existing.skuCount += 1;
      existing.totalUnits += p.quantity;
      categoryMap.set(catName, existing);
    }

    const categories = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        valueAtCost: Math.round(data.valueAtCost * 100) / 100,
        valueAtSale: Math.round(data.valueAtSale * 100) / 100,
        skuCount: data.skuCount,
        totalUnits: data.totalUnits,
      }))
      .sort((a, b) => b.valueAtCost - a.valueAtCost);

    return { categories };
  }

  /**
   * Valuation grouped by location
   */
  static async getValuationByLocation(tenantId: string) {
    const locationsList = await prisma.location.findMany({
      where: { tenantId },
      select: { id: true, name: true, code: true, type: true },
    });

    if (locationsList.length === 0) return { locations: [] };

    const locationIds = locationsList.map(l => l.id);

    const stockAtLocations = await prisma.stockAtLocation.findMany({
      where: { locationId: { in: locationIds }, quantity: { gt: 0 } },
      include: { product: { select: { costPrice: true, salePrice: true } } },
    });

    const locationMap = new Map<string, { valueAtCost: number; valueAtSale: number; skuCount: number; totalUnits: number }>();

    for (const sal of stockAtLocations) {
      const existing = locationMap.get(sal.locationId) || { valueAtCost: 0, valueAtSale: 0, skuCount: 0, totalUnits: 0 };
      existing.valueAtCost += sal.quantity * Number(sal.product.costPrice);
      existing.valueAtSale += sal.quantity * Number(sal.product.salePrice);
      existing.skuCount += 1;
      existing.totalUnits += sal.quantity;
      locationMap.set(sal.locationId, existing);
    }

    const locations = locationsList
      .map(loc => {
        const data = locationMap.get(loc.id) || { valueAtCost: 0, valueAtSale: 0, skuCount: 0, totalUnits: 0 };
        return {
          name: loc.name,
          code: loc.code,
          type: loc.type,
          valueAtCost: Math.round(data.valueAtCost * 100) / 100,
          valueAtSale: Math.round(data.valueAtSale * 100) / 100,
          skuCount: data.skuCount,
          totalUnits: data.totalUnits,
        };
      })
      .filter(l => l.totalUnits > 0)
      .sort((a, b) => b.valueAtCost - a.valueAtCost);

    return { locations };
  }

  /**
   * Calculate inventory carrying cost
   */
  static async calculateCarryingCost(tenantId: string, annualRate = 0.25) {
    const products = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { quantity: true, costPrice: true },
    });

    const totalInventoryValue = products.reduce((s, p) => s + p.quantity * Number(p.costPrice), 0);
    const annualCarryingCost = totalInventoryValue * annualRate;
    const monthlyCarryingCost = annualCarryingCost / 12;
    const dailyCarryingCost = annualCarryingCost / 365;

    return {
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
      annualRate,
      annualCarryingCost: Math.round(annualCarryingCost * 100) / 100,
      monthlyCarryingCost: Math.round(monthlyCarryingCost * 100) / 100,
      dailyCarryingCost: Math.round(dailyCarryingCost * 100) / 100,
      breakdown: {
        storage: { label: 'Storage & Warehousing', pct: 0.40, amount: Math.round(annualCarryingCost * 0.40 * 100) / 100 },
        capitalCost: { label: 'Cost of Capital', pct: 0.30, amount: Math.round(annualCarryingCost * 0.30 * 100) / 100 },
        insurance: { label: 'Insurance', pct: 0.10, amount: Math.round(annualCarryingCost * 0.10 * 100) / 100 },
        obsolescence: { label: 'Obsolescence & Shrinkage', pct: 0.15, amount: Math.round(annualCarryingCost * 0.15 * 100) / 100 },
        handling: { label: 'Handling & Admin', pct: 0.05, amount: Math.round(annualCarryingCost * 0.05 * 100) / 100 },
      },
    };
  }

  /**
   * Calculate working capital metrics
   */
  static async calculateWorkingCapitalMetrics(tenantId: string, startDate: Date, endDate: Date) {
    const [revenueResult, products] = await Promise.all([
      prisma.salesOrderItem.aggregate({
        where: {
          order: {
            tenantId,
            status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            createdAt: { gte: startDate, lte: endDate },
          },
        },
        _sum: { total: true },
      }),
      prisma.product.findMany({
        where: { tenantId, isActive: true },
        select: { quantity: true, costPrice: true, salePrice: true },
      }),
    ]);

    const periodRevenue = Number(revenueResult._sum.total ?? 0);
    const totalValueAtCost = products.reduce((s, p) => s + p.quantity * Number(p.costPrice), 0);
    const totalValueAtSale = products.reduce((s, p) => s + p.quantity * Number(p.salePrice), 0);
    const capitalTiedUp = totalValueAtCost;

    const daySpan = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const turnover = totalValueAtCost > 0 ? periodRevenue / totalValueAtCost : 0;
    const annualizedTurnover = turnover * (365 / daySpan);
    const inventoryDays = annualizedTurnover > 0 ? 365 / annualizedTurnover : 999;
    const inventoryToRevenueRatio = periodRevenue > 0 ? totalValueAtCost / periodRevenue : 0;

    return {
      periodRevenue: Math.round(periodRevenue * 100) / 100,
      totalValueAtCost: Math.round(totalValueAtCost * 100) / 100,
      totalValueAtSale: Math.round(totalValueAtSale * 100) / 100,
      capitalTiedUp: Math.round(capitalTiedUp * 100) / 100,
      turnover: Math.round(turnover * 100) / 100,
      annualizedTurnover: Math.round(annualizedTurnover * 100) / 100,
      inventoryDays: Math.round(inventoryDays * 100) / 100,
      inventoryToRevenueRatio: Math.round(inventoryToRevenueRatio * 10000) / 10000,
    };
  }

  private static countDistribution(classes: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const c of classes) {
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }
}
