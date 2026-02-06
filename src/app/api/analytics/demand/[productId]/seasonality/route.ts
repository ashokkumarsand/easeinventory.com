import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/demand/[productId]/seasonality — Seasonality analysis
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { productId } = await params;

    const result = await InventoryAnalyticsService.detectSeasonality(productId, tenantId);
    if (!result) {
      return NextResponse.json({ message: 'Insufficient data for seasonality analysis (need 30+ days)' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SEASONALITY_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
