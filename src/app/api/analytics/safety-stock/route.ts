import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';

/**
 * GET /api/analytics/safety-stock — List all products with reorder params
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
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || undefined;

    const { default: prisma } = await import('@/lib/prisma');
    const where: any = {
      tenantId,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true, name: true, sku: true, quantity: true, costPrice: true,
          reorderPoint: true, safetyStock: true, economicOrderQty: true,
          leadTimeDays: true, abcClass: true,
          supplier: { select: { id: true, name: true, avgLeadTimeDays: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ data: products, total, page, pageSize });
  } catch (error: any) {
    console.error('SAFETY_STOCK_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/safety-stock — Bulk recalculate all products
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
    const serviceLevel = body.serviceLevel || 0.95;

    const result = await InventoryAnalyticsService.bulkComputeReorderParams(tenantId, serviceLevel);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SAFETY_STOCK_BULK_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
