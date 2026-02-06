import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/kpis/history — Historical KPI snapshots
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

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30');

    const snapshots = await prisma.inventoryKpiSnapshot.findMany({
      where: { tenantId },
      orderBy: { periodDate: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: snapshots.reverse() });
  } catch (error: any) {
    console.error('KPIS_HISTORY_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
