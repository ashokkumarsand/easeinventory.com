import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/reorder-suggestions — List suggestions
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
      status: searchParams.get('status') || undefined,
      urgency: searchParams.get('urgency') || undefined,
    };

    const result = await InventoryAnalyticsService.listSuggestions(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REORDER_SUGGESTIONS_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/reorder-suggestions — Generate new batch
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

    const result = await InventoryAnalyticsService.generateReorderSuggestions(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REORDER_SUGGESTIONS_GENERATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
