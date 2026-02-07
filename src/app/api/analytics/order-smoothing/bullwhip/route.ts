import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { OrderSmoothingService } from '@/services/order-smoothing.service';

/**
 * GET /api/analytics/order-smoothing/bullwhip — Bullwhip report (all products sorted by index)
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
    const limit = parseInt(searchParams.get('limit') || '20');

    const results = await OrderSmoothingService.getBullwhipReport(
      tenantId,
      lookbackDays,
      limit,
    );

    return NextResponse.json({ data: results });
  } catch (error: any) {
    console.error('BULLWHIP_REPORT_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
