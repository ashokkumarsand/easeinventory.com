import prisma from '@/lib/prisma';
import type { ForecastPoint } from '@/services/demand-forecast.service';

// ============================================================
// Types
// ============================================================

export type NudgeCategory =
  | 'STOCKOUT_RISK'
  | 'OVERSTOCK'
  | 'DEMAND_SHIFT'
  | 'SUPPLY_CHAIN'
  | 'LOST_REVENUE'
  | 'EXPIRY'
  | 'PRICING'
  | 'PIPELINE'
  | 'FORECAST_STOCKOUT'
  | 'DEMAND_SPIKE_FORECAST'
  | 'DEMAND_DROP_FORECAST'
  | 'LOW_FORECAST_CONFIDENCE';

export type NudgeSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Nudge {
  id: string;
  category: NudgeCategory;
  severity: NudgeSeverity;
  title: string;
  message: string;
  metric?: string;
  actionLabel?: string;
  actionHref?: string;
  productId?: string;
  productName?: string;
  sku?: string;
}

export interface NudgeDashboard {
  nudges: Nudge[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  pipeline: PipelineItem[];
}

export interface PipelineItem {
  poNumber: string;
  poId: string;
  supplierName: string;
  status: string;
  itemCount: number;
  totalValue: number;
  dueDate: string | null;
  isOverdue: boolean;
}

// ============================================================
// Service
// ============================================================

export class DecisionNudgesService {
  /**
   * Generate all nudges for the tenant
   */
  static async getDashboard(tenantId: string): Promise<NudgeDashboard> {
    const [nudges, pipeline] = await Promise.all([
      this.generateNudges(tenantId),
      this.getPipeline(tenantId),
    ]);

    // Sort: CRITICAL first, then HIGH, etc.
    const severityOrder: Record<NudgeSeverity, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
      INFO: 4,
    };
    nudges.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const summary = {
      critical: nudges.filter((n) => n.severity === 'CRITICAL').length,
      high: nudges.filter((n) => n.severity === 'HIGH').length,
      medium: nudges.filter((n) => n.severity === 'MEDIUM').length,
      low: nudges.filter((n) => n.severity === 'LOW').length,
      info: nudges.filter((n) => n.severity === 'INFO').length,
      total: nudges.length,
    };

    return { nudges, summary, pipeline };
  }

  /**
   * Generate nudges from various data sources
   */
  private static async generateNudges(tenantId: string): Promise<Nudge[]> {
    const nudges: Nudge[] = [];

    const [
      stockoutRisks,
      overstocked,
      demandShifts,
      expiringLots,
      lostSales,
      bullwhipProducts,
      forecastNudges,
    ] = await Promise.all([
      this.getStockoutRisks(tenantId),
      this.getOverstocked(tenantId),
      this.getDemandShifts(tenantId),
      this.getExpiringLots(tenantId),
      this.getLostSalesNudges(tenantId),
      this.getBullwhipNudges(tenantId),
      this.getForecastNudges(tenantId),
    ]);

    nudges.push(...stockoutRisks, ...overstocked, ...demandShifts, ...expiringLots, ...lostSales, ...bullwhipProducts, ...forecastNudges);

    return nudges;
  }

  /**
   * Products below reorder point or near stockout
   */
  private static async getStockoutRisks(tenantId: string): Promise<Nudge[]> {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        reorderPoint: { not: null },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        reorderPoint: true,
        safetyStock: true,
        leadTimeDays: true,
      },
    });

    const nudges: Nudge[] = [];
    let counter = 0;

    for (const p of products) {
      if (p.reorderPoint === null) continue;

      if (p.quantity <= 0) {
        nudges.push({
          id: `stockout-${counter++}`,
          category: 'STOCKOUT_RISK',
          severity: 'CRITICAL',
          title: 'Out of Stock',
          message: `${p.name} has zero stock. Immediate reorder needed.`,
          metric: `${p.quantity} units`,
          actionLabel: 'Create PO',
          actionHref: '/purchase-orders/new',
          productId: p.id,
          productName: p.name,
          sku: p.sku ?? undefined,
        });
      } else if (p.quantity <= (p.safetyStock ?? 0)) {
        nudges.push({
          id: `stockout-${counter++}`,
          category: 'STOCKOUT_RISK',
          severity: 'HIGH',
          title: 'Below Safety Stock',
          message: `${p.name} is below safety stock (${p.quantity} / ${p.safetyStock}).`,
          metric: `${p.quantity} units`,
          actionLabel: 'Reorder',
          actionHref: '/intelligence?tab=reorder',
          productId: p.id,
          productName: p.name,
          sku: p.sku ?? undefined,
        });
      } else if (p.quantity <= p.reorderPoint) {
        nudges.push({
          id: `stockout-${counter++}`,
          category: 'STOCKOUT_RISK',
          severity: 'MEDIUM',
          title: 'Below Reorder Point',
          message: `${p.name} is at ${p.quantity} units (reorder at ${p.reorderPoint}).`,
          metric: `${p.quantity} / ${p.reorderPoint}`,
          actionLabel: 'Reorder',
          actionHref: '/intelligence?tab=reorder',
          productId: p.id,
          productName: p.name,
          sku: p.sku ?? undefined,
        });
      }
    }

    return nudges;
  }

  /**
   * Products significantly above max stock or with excess supply
   */
  private static async getOverstocked(tenantId: string): Promise<Nudge[]> {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        maxStock: { not: null, gt: 0 },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        maxStock: true,
        salePrice: true,
      },
    });

    const nudges: Nudge[] = [];
    let counter = 0;

    for (const p of products) {
      if (p.maxStock === null || p.maxStock === 0) continue;
      const excess = p.quantity - p.maxStock;
      if (excess > 0) {
        const excessValue = excess * Number(p.salePrice);
        nudges.push({
          id: `overstock-${counter++}`,
          category: 'OVERSTOCK',
          severity: excess > p.maxStock * 0.5 ? 'HIGH' : 'MEDIUM',
          title: 'Overstocked',
          message: `${p.name} has ${excess} excess units above max stock (${p.maxStock}).`,
          metric: `${p.quantity} / ${p.maxStock} max`,
          actionLabel: 'View Pricing Rules',
          actionHref: '/pricing-rules',
          productId: p.id,
          productName: p.name,
          sku: p.sku ?? undefined,
        });
      }
    }

    return nudges;
  }

  /**
   * Products with significant demand trend changes
   */
  private static async getDemandShifts(tenantId: string): Promise<Nudge[]> {
    // Get recent demand snapshots to detect shifts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshots = await prisma.demandSnapshot.findMany({
      where: {
        product: { tenantId },
        periodType: 'DAILY',
        periodStart: { gte: thirtyDaysAgo },
      },
      include: { product: { select: { id: true, name: true, sku: true, quantity: true } } },
      orderBy: { periodStart: 'desc' },
    });

    // Group by product
    const byProduct = new Map<string, typeof snapshots>();
    for (const s of snapshots) {
      const arr = byProduct.get(s.productId) || [];
      arr.push(s);
      byProduct.set(s.productId, arr);
    }

    const nudges: Nudge[] = [];
    let counter = 0;

    for (const [, productSnapshots] of byProduct) {
      if (productSnapshots.length < 14) continue; // Need at least 2 weeks of data
      const product = productSnapshots[0].product;

      // Compare recent 7d avg vs prior 7d avg
      const recent7d = productSnapshots.slice(0, 7);
      const prior7d = productSnapshots.slice(7, 14);

      const recentAvg = recent7d.reduce((s, d) => s + d.totalQuantity, 0) / recent7d.length;
      const priorAvg = prior7d.reduce((s, d) => s + d.totalQuantity, 0) / prior7d.length;

      if (priorAvg === 0) continue;
      const changePercent = ((recentAvg - priorAvg) / priorAvg) * 100;

      if (changePercent > 50) {
        nudges.push({
          id: `demand-${counter++}`,
          category: 'DEMAND_SHIFT',
          severity: changePercent > 100 ? 'HIGH' : 'MEDIUM',
          title: 'Demand Surge Detected',
          message: `${product.name} demand increased ${Math.round(changePercent)}% in the last 7 days. Review stock levels.`,
          metric: `+${Math.round(changePercent)}%`,
          actionLabel: 'View Demand',
          actionHref: `/intelligence/demand/${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku ?? undefined,
        });
      } else if (changePercent < -50) {
        nudges.push({
          id: `demand-${counter++}`,
          category: 'DEMAND_SHIFT',
          severity: 'LOW',
          title: 'Demand Drop Detected',
          message: `${product.name} demand decreased ${Math.abs(Math.round(changePercent))}% in the last 7 days.`,
          metric: `${Math.round(changePercent)}%`,
          actionLabel: 'View Demand',
          actionHref: `/intelligence/demand/${product.id}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku ?? undefined,
        });
      }
    }

    return nudges;
  }

  /**
   * Lots expiring soon
   */
  private static async getExpiringLots(tenantId: string): Promise<Nudge[]> {
    const soon = new Date();
    soon.setDate(soon.getDate() + 14);

    const lots = await prisma.productLot.findMany({
      where: {
        product: { tenantId },
        expiryDate: { lte: soon, gte: new Date() },
        quantity: { gt: 0 },
      },
      include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } },
      orderBy: { expiryDate: 'asc' },
      take: 10,
    });

    const nudges: Nudge[] = [];
    for (let i = 0; i < lots.length; i++) {
      const lot = lots[i];
      const daysLeft = Math.ceil((lot.expiryDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      nudges.push({
        id: `expiry-${i}`,
        category: 'EXPIRY',
        severity: daysLeft <= 3 ? 'CRITICAL' : daysLeft <= 7 ? 'HIGH' : 'MEDIUM',
        title: 'Lot Expiring Soon',
        message: `${lot.product.name} lot ${lot.lotNumber} expires in ${daysLeft} days (${lot.quantity} units).`,
        metric: `${daysLeft} days`,
        actionLabel: 'View Intelligence',
        actionHref: '/intelligence?tab=perishable',
        productId: lot.product.id,
        productName: lot.product.name,
        sku: lot.product.sku ?? undefined,
      });
    }

    return nudges;
  }

  /**
   * Products with frequent stockouts (lost sales in last 30 days)
   */
  private static async getLostSalesNudges(tenantId: string): Promise<Nudge[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lostSales = await prisma.lostSale.groupBy({
      by: ['productId'],
      where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      _sum: { estimatedRevenue: true },
      orderBy: { _sum: { estimatedRevenue: 'desc' } },
      take: 5,
    });

    if (lostSales.length === 0) return [];

    const productIds = lostSales.map((ls) => ls.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const nudges: Nudge[] = [];
    for (let i = 0; i < lostSales.length; i++) {
      const ls = lostSales[i];
      const product = productMap.get(ls.productId);
      if (!product) continue;
      const revenue = Number(ls._sum.estimatedRevenue ?? 0);
      nudges.push({
        id: `lostsale-${i}`,
        category: 'LOST_REVENUE',
        severity: revenue > 50000 ? 'HIGH' : revenue > 10000 ? 'MEDIUM' : 'LOW',
        title: 'Recurring Stockouts',
        message: `${product.name} had ${ls._count.id} stockout events, losing ~${formatINR(revenue)} in revenue.`,
        metric: formatINR(revenue),
        actionLabel: 'View Lost Sales',
        actionHref: '/lost-sales',
        productId: product.id,
        productName: product.name,
        sku: product.sku ?? undefined,
      });
    }

    return nudges;
  }

  /**
   * Products with bullwhip amplification (order variance >> demand variance)
   */
  private static async getBullwhipNudges(tenantId: string): Promise<Nudge[]> {
    // Get products that have purchase order items in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        purchaseOrderItems: {
          some: { po: { createdAt: { gte: ninetyDaysAgo } } },
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        smoothingAlpha: true,
        purchaseOrderItems: {
          where: { po: { createdAt: { gte: ninetyDaysAgo } } },
          select: { orderedQty: true },
        },
        salesOrderItems: {
          where: { order: { createdAt: { gte: ninetyDaysAgo } } },
          select: { quantity: true },
        },
      },
      take: 50,
    });

    const nudges: Nudge[] = [];
    let counter = 0;

    for (const p of products) {
      const poQtys = p.purchaseOrderItems.map((i) => i.orderedQty);
      const demandQtys = p.salesOrderItems.map((i) => i.quantity);

      if (poQtys.length < 3 || demandQtys.length < 3) continue;

      const poVariance = variance(poQtys);
      const demandVariance = variance(demandQtys);

      if (demandVariance === 0) continue;
      const bullwhipIndex = poVariance / demandVariance;

      if (bullwhipIndex > 2.0) {
        nudges.push({
          id: `bullwhip-${counter++}`,
          category: 'SUPPLY_CHAIN',
          severity: bullwhipIndex > 4 ? 'HIGH' : 'MEDIUM',
          title: 'Bullwhip Effect',
          message: `${p.name} has a bullwhip index of ${bullwhipIndex.toFixed(1)} — ordering is much more variable than demand. Consider EMA smoothing.`,
          metric: `${bullwhipIndex.toFixed(1)}x`,
          actionLabel: 'Configure Smoothing',
          actionHref: '/intelligence?tab=order-smoothing',
          productId: p.id,
          productName: p.name,
          sku: p.sku ?? undefined,
        });
      }
    }

    return nudges;
  }

  /**
   * Forecast-based nudges: stockout prediction, demand spike/drop, low confidence
   */
  private static async getForecastNudges(tenantId: string): Promise<Nudge[]> {
    const forecasts = await prisma.demandForecast.findMany({
      where: { tenantId, isActive: true, isBest: true },
      include: { product: { select: { id: true, name: true, sku: true, quantity: true, leadTimeDays: true } } },
    });

    const nudges: Nudge[] = [];
    let counter = 0;

    for (const f of forecasts) {
      const data = f.forecastData as unknown as ForecastPoint[];
      if (!Array.isArray(data) || data.length === 0) continue;

      const forecastAvg = data.reduce((s, p) => s + p.value, 0) / data.length;
      if (forecastAvg <= 0) continue;

      const daysOfSupply = Math.floor(f.product.quantity / forecastAvg);
      const leadTime = f.product.leadTimeDays ?? 7;

      // FORECAST_STOCKOUT: will run out before next PO arrives
      if (daysOfSupply < leadTime && daysOfSupply < 30) {
        nudges.push({
          id: `forecast-stockout-${counter++}`,
          category: 'FORECAST_STOCKOUT',
          severity: daysOfSupply <= 3 ? 'CRITICAL' : daysOfSupply <= 7 ? 'HIGH' : 'MEDIUM',
          title: 'Predicted Stockout',
          message: `${f.product.name} is forecasted to stock out in ${daysOfSupply} days (lead time: ${leadTime}d). Reorder now.`,
          metric: `${daysOfSupply} days`,
          actionLabel: 'View Forecast',
          actionHref: `/intelligence/forecast/${f.product.id}`,
          productId: f.product.id,
          productName: f.product.name,
          sku: f.product.sku ?? undefined,
        });
      }

      // DEMAND_SPIKE_FORECAST: forecast shows significant increase in last 7 days of horizon
      if (data.length >= 14) {
        const firstWeekAvg = data.slice(0, 7).reduce((s, p) => s + p.value, 0) / 7;
        const lastWeekAvg = data.slice(-7).reduce((s, p) => s + p.value, 0) / 7;
        if (firstWeekAvg > 0) {
          const change = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;
          if (change > 30) {
            nudges.push({
              id: `forecast-spike-${counter++}`,
              category: 'DEMAND_SPIKE_FORECAST',
              severity: change > 50 ? 'HIGH' : 'MEDIUM',
              title: 'Demand Spike Forecast',
              message: `${f.product.name} demand is forecast to increase ${Math.round(change)}% over the next ${f.horizonDays} days.`,
              metric: `+${Math.round(change)}%`,
              actionLabel: 'View Forecast',
              actionHref: `/intelligence/forecast/${f.product.id}`,
              productId: f.product.id,
              productName: f.product.name,
              sku: f.product.sku ?? undefined,
            });
          } else if (change < -30) {
            nudges.push({
              id: `forecast-drop-${counter++}`,
              category: 'DEMAND_DROP_FORECAST',
              severity: 'LOW',
              title: 'Demand Drop Forecast',
              message: `${f.product.name} demand is forecast to decrease ${Math.abs(Math.round(change))}% — consider reducing orders.`,
              metric: `${Math.round(change)}%`,
              actionLabel: 'View Forecast',
              actionHref: `/intelligence/forecast/${f.product.id}`,
              productId: f.product.id,
              productName: f.product.name,
              sku: f.product.sku ?? undefined,
            });
          }
        }
      }

      // LOW_FORECAST_CONFIDENCE: MAPE > 30%
      if (f.mape !== null && f.mape > 30) {
        nudges.push({
          id: `forecast-lowconf-${counter++}`,
          category: 'LOW_FORECAST_CONFIDENCE',
          severity: 'INFO',
          title: 'Low Forecast Confidence',
          message: `${f.product.name} forecast has ${f.mape.toFixed(0)}% MAPE. Consider manual review.`,
          metric: `${f.mape.toFixed(0)}% MAPE`,
          actionLabel: 'View Forecast',
          actionHref: `/intelligence/forecast/${f.product.id}`,
          productId: f.product.id,
          productName: f.product.name,
          sku: f.product.sku ?? undefined,
        });
      }
    }

    return nudges;
  }

  /**
   * Get pending/in-transit PO pipeline for visibility
   */
  private static async getPipeline(tenantId: string): Promise<PipelineItem[]> {
    const activePOs = await prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        status: { in: ['SENT', 'PARTIALLY_RECEIVED'] },
      },
      include: {
        supplier: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });

    const now = new Date();

    return activePOs.map((po) => ({
      poNumber: po.poNumber,
      poId: po.id,
      supplierName: po.supplier.name,
      status: po.status,
      itemCount: po._count.items,
      totalValue: Number(po.total),
      dueDate: po.dueDate?.toISOString() ?? null,
      isOverdue: po.dueDate ? po.dueDate < now : false,
    }));
  }
}

// ============================================================
// Helpers
// ============================================================

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
