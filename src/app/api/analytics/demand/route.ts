import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/demand — Bulk demand velocity (paginated)
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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const filter = {
      categoryId: searchParams.get('categoryId') || undefined,
      abcClass: searchParams.get('abcClass') || undefined,
      search: searchParams.get('search') || undefined,
    };

    let result;
    try {
      result = await InventoryAnalyticsService.getBulkDemandVelocity(tenantId, filter, page, pageSize);
    } catch {
      result = { data: [], total: 0, page, pageSize };
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DEMAND_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/demand — Trigger snapshot refresh
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

    const body = await req.json().catch(() => ({}));
    const lookbackDays = body.lookbackDays || 90;

    const result = await InventoryAnalyticsService.refreshDemandSnapshots(tenantId, 'DAILY', lookbackDays);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DEMAND_REFRESH_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
