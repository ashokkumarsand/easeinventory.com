import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/expiring-lots — Expiring lots with urgency
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

    const withinDays = parseInt(req.nextUrl.searchParams.get('withinDays') || '90');

    const alerts = await InventoryAnalyticsService.getExpiryAlerts(tenantId);

    return NextResponse.json(alerts);
  } catch (error: any) {
    console.error('EXPIRING_LOTS_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
