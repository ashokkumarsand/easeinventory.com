import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { OrderSmoothingService } from '@/services/order-smoothing.service';

/**
 * GET /api/analytics/order-smoothing — Dashboard summary + paginated products
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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || undefined;

    const result = await OrderSmoothingService.getDashboard(
      tenantId,
      lookbackDays,
      page,
      pageSize,
      search,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ORDER_SMOOTHING_DASHBOARD_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
