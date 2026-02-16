import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { InventoryAnalyticsService } from '@/services/inventory-analytics.service';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/abc-xyz — Get current classification data
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
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const abcFilter = searchParams.get('abcClass') || undefined;
    const xyzFilter = searchParams.get('xyzClass') || undefined;

    const where: any = {
      tenantId,
      isActive: true,
      ...(abcFilter && { abcClass: abcFilter }),
      ...(xyzFilter && { xyzClass: xyzFilter }),
    };

    let products: any[] = [];
    let total = 0;
    let distribution: any[] = [];

    try {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          select: {
            id: true, name: true, sku: true, quantity: true, costPrice: true, salePrice: true,
            abcClass: true, xyzClass: true,
            category: { select: { name: true } },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: [{ abcClass: 'asc' }, { name: 'asc' }],
        }),
        prisma.product.count({ where }),
      ]);

      // Get distribution counts
      distribution = await prisma.product.groupBy({
        by: ['abcClass', 'xyzClass'],
        where: { tenantId, isActive: true },
        _count: true,
      });
    } catch (e) {
      // Return empty data if queries fail (e.g. schema mismatch)
    }

    // Build 3x3 matrix counts
    const matrix: Record<string, number> = {};
    for (const abc of ['A', 'B', 'C']) {
      for (const xyz of ['X', 'Y', 'Z']) {
        matrix[`${abc}${xyz}`] = 0;
      }
    }
    for (const row of distribution) {
      if (row.abcClass && row.xyzClass) {
        matrix[`${row.abcClass}${row.xyzClass}`] = row._count;
      }
    }

    const abcCounts = { A: 0, B: 0, C: 0, unclassified: 0 };
    const xyzCounts = { X: 0, Y: 0, Z: 0, unclassified: 0 };
    for (const row of distribution) {
      if (row.abcClass && row.abcClass in abcCounts) {
        abcCounts[row.abcClass as 'A' | 'B' | 'C'] += row._count;
      } else {
        abcCounts.unclassified += row._count;
      }
      if (row.xyzClass && row.xyzClass in xyzCounts) {
        xyzCounts[row.xyzClass as 'X' | 'Y' | 'Z'] += row._count;
      } else {
        xyzCounts.unclassified += row._count;
      }
    }

    return NextResponse.json({
      data: products,
      total,
      page,
      pageSize,
      matrix,
      abcCounts,
      xyzCounts,
    });
  } catch (error: any) {
    console.error('ABC_XYZ_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/abc-xyz — Trigger re-classification
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

    const result = await InventoryAnalyticsService.runFullClassification(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ABC_XYZ_CLASSIFY_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
