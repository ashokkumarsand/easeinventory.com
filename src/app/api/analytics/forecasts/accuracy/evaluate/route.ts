import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DemandForecastService } from '@/services/demand-forecast.service';

/**
 * POST /api/analytics/forecasts/accuracy/evaluate — Evaluate past forecasts vs actuals
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const result = await DemandForecastService.evaluateAccuracy(tenantId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('FORECAST_EVALUATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
