import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/inventory-valuation — Inventory valuation & working capital metrics
 * Query params: ?days=30&carryingRate=0.25
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

    const { searchParams } = new URL(req.url);
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 1), 365);
    const carryingRate = Math.min(Math.max(parseFloat(searchParams.get('carryingRate') || '0.25') || 0.25, 0.01), 1);

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const [summary, byCategory, byLocation, carryingCost, workingCapital, aging] = await Promise.all([
      InventoryAnalyticsService.getValuationSummary(tenantId),
      InventoryAnalyticsService.getValuationByCategory(tenantId),
      InventoryAnalyticsService.getValuationByLocation(tenantId),
      InventoryAnalyticsService.calculateCarryingCost(tenantId, carryingRate),
      InventoryAnalyticsService.calculateWorkingCapitalMetrics(tenantId, startDate, now),
      InventoryAnalyticsService.calculateAgingAnalysis(tenantId),
    ]);

    return NextResponse.json({
      summary,
      byCategory,
      byLocation,
      carryingCost,
      workingCapital,
      aging,
    });
  } catch (error: any) {
    console.error('INVENTORY_VALUATION_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
