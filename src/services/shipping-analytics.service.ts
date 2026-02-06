import prisma from '@/lib/prisma';

export interface ShipmentKpis {
  totalShipments: number;
  deliveredCount: number;
  inTransitCount: number;
  rtoCount: number;
  cancelledCount: number;
  avgDeliveryHours: number | null;
  onTimeDeliveryRate: number | null; // 0-100
  ndrRate: number | null; // 0-100
  codShipments: number;
  prepaidShipments: number;
  statusDistribution: Record<string, number>;
  carrierPerformance: CarrierPerformance[];
  dailyVolume: DailyVolume[];
}

export interface CarrierPerformance {
  carrier: string;
  total: number;
  delivered: number;
  rto: number;
  avgDeliveryHours: number | null;
  successRate: number; // 0-100
}

export interface DailyVolume {
  date: string;
  created: number;
  delivered: number;
}

export interface CodAnalytics {
  totalCodValue: number;
  collectedValue: number;
  pendingValue: number;
  collectionRate: number; // 0-100
  totalCodShipments: number;
  collectedCount: number;
  pendingCount: number;
  avgCodValue: number;
  carrierBreakdown: CodCarrierBreakdown[];
  agingBuckets: CodAgingBucket[];
  remittanceSummary: RemittanceSummary;
}

export interface CodCarrierBreakdown {
  carrier: string;
  total: number;
  collected: number;
  pending: number;
  pendingValue: number;
}

export interface CodAgingBucket {
  bucket: string;
  count: number;
  value: number;
}

export interface RemittanceSummary {
  totalRemittances: number;
  totalRemitted: number;
  pendingRemittances: number;
  pendingAmount: number;
  paidAmount: number;
}

const SLA_HOURS = 120; // 5 days default delivery SLA

export class ShippingAnalyticsService {
  /**
   * Calculate all shipping KPIs for a tenant within a date range.
   */
  static async getShipmentKpis(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ShipmentKpis> {
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || now;

    const shipments = await prisma.shipment.findMany({
      where: {
        tenantId,
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        status: true,
        carrierName: true,
        codAmount: true,
        createdAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        ndrStatus: true,
      },
    });

    const total = shipments.length;
    const delivered = shipments.filter(s => s.status === 'DELIVERED');
    const inTransit = shipments.filter(s => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP', 'PICKUP_SCHEDULED'].includes(s.status));
    const rto = shipments.filter(s => ['RTO_INITIATED', 'RTO_DELIVERED'].includes(s.status));
    const cancelled = shipments.filter(s => s.status === 'CANCELLED');
    const codShipments = shipments.filter(s => s.codAmount && Number(s.codAmount) > 0);
    const ndrShipments = shipments.filter(s => s.ndrStatus !== null);

    // Average delivery time (pickup to delivered)
    const deliveryTimes = delivered
      .map(s => {
        const from = s.pickedUpAt || s.createdAt;
        const to = s.deliveredAt!;
        return (to.getTime() - from.getTime()) / (1000 * 60 * 60);
      })
      .filter(h => h > 0);

    const avgDeliveryHours = deliveryTimes.length > 0
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
      : null;

    // On-time delivery rate (within SLA)
    const onTimeCount = deliveryTimes.filter(h => h <= SLA_HOURS).length;
    const onTimeDeliveryRate = deliveryTimes.length > 0
      ? (onTimeCount / deliveryTimes.length) * 100
      : null;

    // NDR rate (out of non-cancelled)
    const nonCancelled = total - cancelled.length;
    const ndrRate = nonCancelled > 0
      ? (ndrShipments.length / nonCancelled) * 100
      : null;

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    for (const s of shipments) {
      statusDistribution[s.status] = (statusDistribution[s.status] || 0) + 1;
    }

    // Carrier performance
    const carrierMap = new Map<string, typeof shipments>();
    for (const s of shipments) {
      const key = s.carrierName || 'Unknown';
      if (!carrierMap.has(key)) carrierMap.set(key, []);
      carrierMap.get(key)!.push(s);
    }

    const carrierPerformance: CarrierPerformance[] = Array.from(carrierMap.entries()).map(([carrier, items]) => {
      const cDelivered = items.filter(s => s.status === 'DELIVERED');
      const cRto = items.filter(s => ['RTO_INITIATED', 'RTO_DELIVERED'].includes(s.status));
      const cTimes = cDelivered
        .map(s => {
          const from = s.pickedUpAt || s.createdAt;
          return (s.deliveredAt!.getTime() - from.getTime()) / (1000 * 60 * 60);
        })
        .filter(h => h > 0);
      const cAvg = cTimes.length > 0
        ? cTimes.reduce((a, b) => a + b, 0) / cTimes.length
        : null;
      const cNonCancelled = items.filter(s => s.status !== 'CANCELLED').length;

      return {
        carrier,
        total: items.length,
        delivered: cDelivered.length,
        rto: cRto.length,
        avgDeliveryHours: cAvg,
        successRate: cNonCancelled > 0
          ? (cDelivered.length / cNonCancelled) * 100
          : 0,
      };
    }).sort((a, b) => b.total - a.total);

    // Daily volume (last 30 days)
    const dailyMap = new Map<string, { created: number; delivered: number }>();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dailyMap.set(d.toISOString().split('T')[0], { created: 0, delivered: 0 });
    }
    for (const s of shipments) {
      const day = s.createdAt.toISOString().split('T')[0];
      if (dailyMap.has(day)) dailyMap.get(day)!.created++;
      if (s.deliveredAt) {
        const dDay = s.deliveredAt.toISOString().split('T')[0];
        if (dailyMap.has(dDay)) dailyMap.get(dDay)!.delivered++;
      }
    }
    const dailyVolume: DailyVolume[] = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalShipments: total,
      deliveredCount: delivered.length,
      inTransitCount: inTransit.length,
      rtoCount: rto.length,
      cancelledCount: cancelled.length,
      avgDeliveryHours,
      onTimeDeliveryRate,
      ndrRate,
      codShipments: codShipments.length,
      prepaidShipments: total - codShipments.length,
      statusDistribution,
      carrierPerformance,
      dailyVolume,
    };
  }

  /**
   * COD analytics: collection rates, aging, carrier breakdown, reconciliation.
   */
  static async getCodAnalytics(tenantId: string): Promise<CodAnalytics> {
    // All COD shipments (delivered)
    const codShipments = await prisma.shipment.findMany({
      where: {
        tenantId,
        codAmount: { not: null },
        status: 'DELIVERED',
      },
      select: {
        id: true,
        codAmount: true,
        codCollected: true,
        carrierName: true,
        deliveredAt: true,
      },
    });

    const totalCodValue = codShipments.reduce((s, sh) => s + Number(sh.codAmount || 0), 0);
    const collected = codShipments.filter(s => s.codCollected);
    const pending = codShipments.filter(s => !s.codCollected);

    const collectedValue = collected.reduce((s, sh) => s + Number(sh.codAmount || 0), 0);
    const pendingValue = pending.reduce((s, sh) => s + Number(sh.codAmount || 0), 0);
    const collectionRate = codShipments.length > 0
      ? (collected.length / codShipments.length) * 100
      : 0;
    const avgCodValue = codShipments.length > 0
      ? totalCodValue / codShipments.length
      : 0;

    // Carrier breakdown
    const carrierMap = new Map<string, { total: number; collected: number; pending: number; pendingValue: number }>();
    for (const s of codShipments) {
      const key = s.carrierName || 'Unknown';
      if (!carrierMap.has(key)) carrierMap.set(key, { total: 0, collected: 0, pending: 0, pendingValue: 0 });
      const entry = carrierMap.get(key)!;
      entry.total++;
      if (s.codCollected) {
        entry.collected++;
      } else {
        entry.pending++;
        entry.pendingValue += Number(s.codAmount || 0);
      }
    }
    const carrierBreakdown: CodCarrierBreakdown[] = Array.from(carrierMap.entries())
      .map(([carrier, data]) => ({ carrier, ...data }))
      .sort((a, b) => b.pendingValue - a.pendingValue);

    // Aging buckets for pending COD
    const now = new Date();
    const buckets = [
      { label: '0-3 days', maxDays: 3 },
      { label: '4-7 days', maxDays: 7 },
      { label: '8-14 days', maxDays: 14 },
      { label: '15-30 days', maxDays: 30 },
      { label: '30+ days', maxDays: Infinity },
    ];
    const agingBuckets: CodAgingBucket[] = buckets.map(b => ({ bucket: b.label, count: 0, value: 0 }));

    for (const s of pending) {
      if (!s.deliveredAt) continue;
      const ageDays = (now.getTime() - s.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
      let prevMax = 0;
      for (let i = 0; i < buckets.length; i++) {
        if (ageDays > prevMax && ageDays <= buckets[i].maxDays) {
          agingBuckets[i].count++;
          agingBuckets[i].value += Number(s.codAmount || 0);
          break;
        }
        prevMax = buckets[i].maxDays;
      }
    }

    // Remittance summary
    const remittances = await prisma.cODRemittance.findMany({
      where: { tenantId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
      },
    });

    const paidRemittances = remittances.filter(r => r.status === 'PAID');
    const pendingRemittances = remittances.filter(r => r.status !== 'PAID');

    const remittanceSummary: RemittanceSummary = {
      totalRemittances: remittances.length,
      totalRemitted: paidRemittances.reduce((s, r) => s + Number(r.totalAmount), 0),
      pendingRemittances: pendingRemittances.length,
      pendingAmount: pendingRemittances.reduce((s, r) => s + Number(r.totalAmount), 0),
      paidAmount: paidRemittances.reduce((s, r) => s + Number(r.totalAmount), 0),
    };

    return {
      totalCodValue,
      collectedValue,
      pendingValue,
      collectionRate,
      totalCodShipments: codShipments.length,
      collectedCount: collected.length,
      pendingCount: pending.length,
      avgCodValue,
      carrierBreakdown,
      agingBuckets,
      remittanceSummary,
    };
  }
}
