import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { SupplierPerformanceService } from '@/services/supplier-performance.service';

/**
 * GET /api/analytics/supplier-performance — All supplier performance metrics
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

    const days = parseInt(req.nextUrl.searchParams.get('days') || '90');
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const summary = await SupplierPerformanceService.getAllSupplierPerformance(
      tenantId,
      startDate,
      now,
    );

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('SUPPLIER_PERFORMANCE_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/supplier-performance — Refresh & persist metrics
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

    const result = await SupplierPerformanceService.refreshMetrics(tenantId);

    return NextResponse.json({ message: 'Metrics refreshed', ...result });
  } catch (error: any) {
    console.error('SUPPLIER_PERFORMANCE_REFRESH_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
