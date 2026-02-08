import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DemandForecastService } from '@/services/demand-forecast.service';

/**
 * GET /api/analytics/forecasts/[productId] — Product forecast detail (all methods)
 */
export async function GET(
  _req: NextRequest,
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
    const result = await DemandForecastService.getProductForecasts(productId, tenantId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('FORECAST_PRODUCT_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/forecasts/[productId] — Regenerate forecast for one product
 */
export async function POST(
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
    const body = await req.json().catch(() => ({}));
    const horizon = body.horizon ?? 30;
    const lookback = body.lookback ?? 90;

    const result = await DemandForecastService.generateForProduct(productId, tenantId, horizon, lookback);

    if (!result) {
      return NextResponse.json({ message: 'Insufficient data to generate forecast' }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('FORECAST_REGENERATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
