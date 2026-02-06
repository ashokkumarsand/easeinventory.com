import prisma from '@/lib/prisma';

export interface SupplierMetrics {
  supplierId: string;
  supplierName: string;
  totalPOs: number;
  completedPOs: number;
  avgLeadTimeDays: number | null;
  onTimeRate: number | null;      // 0-100
  qualityScore: number | null;    // 0-100
  fillRate: number | null;        // 0-100
  reliabilityScore: number;       // 0-100 composite
  totalOrdered: number;
  totalReceived: number;
  totalRejected: number;
}

export interface PerformanceSummary {
  avgLeadTime: number;
  avgQuality: number;
  avgOnTimeRate: number;
  avgReliability: number;
  suppliers: SupplierMetrics[];
}

export class SupplierPerformanceService {
  /**
   * Get performance metrics for a single supplier.
   */
  static async getSupplierPerformance(
    supplierId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SupplierMetrics | null> {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId },
      select: { id: true, name: true, avgLeadTimeDays: true },
    });
    if (!supplier) return null;

    const metrics = await this.computeMetrics(supplier.id, tenantId, startDate, endDate);
    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      ...metrics,
    };
  }

  /**
   * Get performance metrics for all suppliers in a tenant.
   */
  static async getAllSupplierPerformance(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PerformanceSummary> {
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
      select: { id: true, name: true, avgLeadTimeDays: true },
      orderBy: { name: 'asc' },
    });

    const results: SupplierMetrics[] = [];

    for (const supplier of suppliers) {
      const metrics = await this.computeMetrics(supplier.id, tenantId, startDate, endDate);
      results.push({
        supplierId: supplier.id,
        supplierName: supplier.name,
        ...metrics,
      });
    }

    // Sort by reliability score descending
    results.sort((a, b) => b.reliabilityScore - a.reliabilityScore);

    // Summary KPIs (average of suppliers that have data)
    const withData = results.filter(r => r.completedPOs > 0);
    const avgLeadTime = withData.length > 0
      ? withData.reduce((s, r) => s + (r.avgLeadTimeDays || 0), 0) / withData.length
      : 0;
    const avgQuality = withData.length > 0
      ? withData.reduce((s, r) => s + (r.qualityScore || 0), 0) / withData.length
      : 0;
    const avgOnTimeRate = withData.length > 0
      ? withData.reduce((s, r) => s + (r.onTimeRate || 0), 0) / withData.length
      : 0;
    const avgReliability = withData.length > 0
      ? withData.reduce((s, r) => s + r.reliabilityScore, 0) / withData.length
      : 0;

    return {
      avgLeadTime: Math.round(avgLeadTime * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgOnTimeRate: Math.round(avgOnTimeRate * 10) / 10,
      avgReliability: Math.round(avgReliability * 10) / 10,
      suppliers: results,
    };
  }

  /**
   * Recalculate and persist avgLeadTimeDays + reliabilityScore for all suppliers.
   */
  static async refreshMetrics(tenantId: string): Promise<{ updated: number }> {
    const summary = await this.getAllSupplierPerformance(tenantId);
    let updated = 0;

    for (const metrics of summary.suppliers) {
      if (metrics.completedPOs === 0) continue;

      await prisma.supplier.update({
        where: { id: metrics.supplierId },
        data: {
          avgLeadTimeDays: metrics.avgLeadTimeDays !== null
            ? Math.round(metrics.avgLeadTimeDays)
            : null,
          reliabilityScore: metrics.reliabilityScore,
        },
      });
      updated++;
    }

    return { updated };
  }

  /**
   * Core calculation: compute all metrics from PO + GRN data for one supplier.
   */
  private static async computeMetrics(
    supplierId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Omit<SupplierMetrics, 'supplierId' | 'supplierName'>> {
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate || now;

    // Fetch POs with GRNs for this supplier
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        supplierId,
        tenantId,
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        goodsReceipts: {
          select: {
            id: true,
            status: true,
            completedAt: true,
            items: {
              select: {
                expectedQty: true,
                receivedQty: true,
                rejectedQty: true,
              },
            },
          },
        },
      },
    });

    const totalPOs = purchaseOrders.length;

    // Completed = PO has at least one completed GRN
    const completedPOs = purchaseOrders.filter(po =>
      po.goodsReceipts.some(grn => grn.status === 'COMPLETED')
    );

    // Lead time: days from PO creation to first completed GRN
    const leadTimes: number[] = [];
    for (const po of completedPOs) {
      const completedGrn = po.goodsReceipts.find(grn => grn.status === 'COMPLETED' && grn.completedAt);
      if (completedGrn?.completedAt) {
        const days = (completedGrn.completedAt.getTime() - po.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (days > 0) leadTimes.push(days);
      }
    }

    const avgLeadTimeDays = leadTimes.length > 0
      ? Math.round((leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) * 10) / 10
      : null;

    // On-time rate: POs where actual lead time ≤ promised
    // Promised = ProductSupplier.leadTimeDays → Supplier.avgLeadTimeDays → 7 fallback
    const supplierData = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { avgLeadTimeDays: true },
    });
    const promisedLeadTime = supplierData?.avgLeadTimeDays || 7;

    let onTimeCount = 0;
    for (const po of completedPOs) {
      const completedGrn = po.goodsReceipts.find(grn => grn.status === 'COMPLETED' && grn.completedAt);
      if (completedGrn?.completedAt) {
        const days = (completedGrn.completedAt.getTime() - po.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (days <= promisedLeadTime) onTimeCount++;
      }
    }

    const onTimeRate = completedPOs.length > 0
      ? Math.round((onTimeCount / completedPOs.length) * 1000) / 10
      : null;

    // Quality & fill rate from GRN items
    let totalExpected = 0;
    let totalReceived = 0;
    let totalRejected = 0;

    for (const po of purchaseOrders) {
      for (const grn of po.goodsReceipts) {
        if (grn.status !== 'COMPLETED') continue;
        for (const item of grn.items) {
          totalExpected += item.expectedQty;
          totalReceived += item.receivedQty;
          totalRejected += item.rejectedQty;
        }
      }
    }

    const qualityScore = totalReceived > 0
      ? Math.round(((totalReceived - totalRejected) / totalReceived) * 1000) / 10
      : null;

    const fillRate = totalExpected > 0
      ? Math.round((totalReceived / totalExpected) * 1000) / 10
      : null;

    // Composite reliability: onTime*0.4 + quality*0.4 + fillRate*0.2
    const safeOnTime = onTimeRate ?? 0;
    const safeQuality = qualityScore ?? 0;
    const safeFill = fillRate ?? 0;
    const reliabilityScore = completedPOs.length > 0
      ? Math.round((safeOnTime * 0.4 + safeQuality * 0.4 + safeFill * 0.2) * 10) / 10
      : 0;

    return {
      totalPOs,
      completedPOs: completedPOs.length,
      avgLeadTimeDays,
      onTimeRate,
      qualityScore,
      fillRate,
      reliabilityScore,
      totalOrdered: totalExpected,
      totalReceived,
      totalRejected,
    };
  }
}
