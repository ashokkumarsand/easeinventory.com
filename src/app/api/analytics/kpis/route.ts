import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/kpis — Get current KPI values
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try { return await fn(); } catch { return fallback; }
    };

    const [turnover, gmroi, daysOfSupply, fillRate, stockout, aging] = await Promise.all([
      safe(() => InventoryAnalyticsService.calculateTurnover(tenantId, thirtyDaysAgo, now), { turnoverRate: 0, totalCOGS: 0, avgInventoryValue: 0 }),
      safe(() => InventoryAnalyticsService.calculateGMROI(tenantId, thirtyDaysAgo, now), { gmroi: 0, grossProfit: 0, avgInventoryCost: 0 }),
      safe(() => InventoryAnalyticsService.calculateDaysOfSupply(tenantId), { products: [], avgDaysOfSupply: 0 }),
      safe(() => InventoryAnalyticsService.calculateFillRate(tenantId, thirtyDaysAgo, now), { fillRate: 0, fulfilled: 0, total: 0 }),
      safe(() => InventoryAnalyticsService.calculateStockoutRate(tenantId), { stockoutRate: 0, outOfStock: 0, totalActive: 0 }),
      safe(() => InventoryAnalyticsService.calculateAgingAnalysis(tenantId), { buckets: [], totalLots: 0, avgAgeDays: 0 }),
    ]);

    return NextResponse.json({
      turnover,
      gmroi,
      daysOfSupply: { avgDaysOfSupply: daysOfSupply?.avgDaysOfSupply ?? 0 },
      fillRate,
      stockout,
      aging,
    });
  } catch (error: any) {
    console.error('KPIS_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/kpis — Save KPI snapshot
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const snapshot = await InventoryAnalyticsService.computeAndSaveKpiSnapshot(tenantId);
    return NextResponse.json(snapshot);
  } catch (error: any) {
    console.error('KPIS_SNAPSHOT_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
