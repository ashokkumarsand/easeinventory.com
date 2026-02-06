import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { SupplierPerformanceService } from '@/services/supplier-performance.service';

/**
 * GET /api/analytics/supplier-performance/[id] — Single supplier detail
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const { id } = await params;
    const days = parseInt(req.nextUrl.searchParams.get('days') || '90');
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const metrics = await SupplierPerformanceService.getSupplierPerformance(
      id,
      tenantId,
      startDate,
      now,
    );

    if (!metrics) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('SUPPLIER_PERFORMANCE_DETAIL_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
