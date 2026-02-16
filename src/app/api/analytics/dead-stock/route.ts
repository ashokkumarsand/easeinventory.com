import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/dead-stock — Dead stock report
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
    const noSaleDays = parseInt(searchParams.get('noSaleDays') || '90');

    let result;
    try {
      result = await InventoryAnalyticsService.getDeadStock(tenantId, noSaleDays);
    } catch {
      result = { deadStock: [], totalCount: 0, totalValue: 0 };
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DEAD_STOCK_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
