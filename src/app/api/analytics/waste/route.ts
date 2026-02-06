import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/waste — Waste/expiry metrics
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

    const metrics = await InventoryAnalyticsService.calculateWasteMetrics(tenantId, thirtyDaysAgo, now);

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('WASTE_METRICS_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
