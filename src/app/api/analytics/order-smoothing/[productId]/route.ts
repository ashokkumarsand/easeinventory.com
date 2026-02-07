import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { OrderSmoothingService } from '@/services/order-smoothing.service';

/**
 * GET /api/analytics/order-smoothing/[productId] — Per-product detail
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
    const lookbackDays = parseInt(
      req.nextUrl.searchParams.get('lookbackDays') || '90',
    );

    const result = await OrderSmoothingService.computeSmoothedOrder(
      productId,
      tenantId,
      lookbackDays,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ORDER_SMOOTHING_PRODUCT_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * PUT /api/analytics/order-smoothing/[productId] — Update smoothing config
 */
export async function PUT(
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
    const body = await req.json();
    const { smoothingAlpha, reviewPeriodDays } = body;

    const result = await OrderSmoothingService.updateConfig(
      productId,
      tenantId,
      smoothingAlpha,
      reviewPeriodDays,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ORDER_SMOOTHING_UPDATE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 400;
    return NextResponse.json({ message: error.message || 'Internal error' }, { status });
  }
}
