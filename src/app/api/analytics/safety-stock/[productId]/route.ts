import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/safety-stock/[productId] — Single product reorder params
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
    const { default: prisma } = await import('@/lib/prisma');

    const product = await prisma.product.findFirst({
      where: { id: productId, tenantId },
      select: {
        id: true, name: true, sku: true, quantity: true, costPrice: true,
        reorderPoint: true, safetyStock: true, economicOrderQty: true, leadTimeDays: true,
        supplier: { select: { id: true, name: true, avgLeadTimeDays: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Also get demand velocity
    const velocity = await InventoryAnalyticsService.getDemandVelocity(productId, tenantId);

    return NextResponse.json({ product, velocity });
  } catch (error: any) {
    console.error('SAFETY_STOCK_PRODUCT_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * PUT /api/analytics/safety-stock/[productId] — Manual override
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
    const { default: prisma } = await import('@/lib/prisma');

    // Verify ownership
    const product = await prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // If serviceLevel provided, recalculate; otherwise accept manual values
    if (body.serviceLevel) {
      const result = await InventoryAnalyticsService.computeAndSaveReorderParams(productId, tenantId, body.serviceLevel);
      return NextResponse.json(result);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        safetyStock: body.safetyStock ?? product.safetyStock,
        reorderPoint: body.reorderPoint ?? product.reorderPoint,
        economicOrderQty: body.economicOrderQty ?? product.economicOrderQty,
        leadTimeDays: body.leadTimeDays ?? product.leadTimeDays,
      },
      select: {
        id: true, safetyStock: true, reorderPoint: true, economicOrderQty: true, leadTimeDays: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('SAFETY_STOCK_PRODUCT_PUT_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
