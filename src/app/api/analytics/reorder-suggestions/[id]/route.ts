import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * PUT /api/analytics/reorder-suggestions/[id] — Dismiss suggestion
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;
    await InventoryAnalyticsService.dismissSuggestion(id, tenantId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('REORDER_SUGGESTION_DISMISS_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
