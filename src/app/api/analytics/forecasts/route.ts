import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DemandForecastService } from '@/services/demand-forecast.service';

/**
 * GET /api/analytics/forecasts — Dashboard (paginated summaries, leaderboard, aggregate)
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
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const search = searchParams.get('search') || undefined;
    const abcClass = searchParams.get('abcClass') || undefined;

    const result = await DemandForecastService.getDashboard(
      tenantId,
      { search, abcClass },
      page,
      pageSize,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('FORECAST_DASHBOARD_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/forecasts — Trigger bulk forecast generation
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
    const horizon = body.horizon ?? 30;
    const lookback = body.lookback ?? 90;

    const result = await DemandForecastService.generateForTenant(tenantId, horizon, lookback);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('FORECAST_GENERATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
