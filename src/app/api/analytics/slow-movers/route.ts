import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/slow-movers — Slow movers report
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

    const searchParams = req.nextUrl.searchParams;
    const lookbackDays = parseInt(searchParams.get('lookbackDays') || '90');
    const slowFactor = parseFloat(searchParams.get('slowFactor') || '0.25');

    const result = await InventoryAnalyticsService.getSlowMovers(tenantId, lookbackDays, slowFactor);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SLOW_MOVERS_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
