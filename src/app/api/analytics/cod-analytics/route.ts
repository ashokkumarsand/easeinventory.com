import { authOptions } from '@/lib/auth';
import { ShippingAnalyticsService } from '@/services/shipping-analytics.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// GET - COD analytics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const analytics = await ShippingAnalyticsService.getCodAnalytics(tenantId);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('COD_ANALYTICS_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
