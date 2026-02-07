import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { WarehouseCapacityService } from '@/services/warehouse-capacity.service';

/**
 * GET /api/warehouse-capacity — Capacity dashboard for all locations
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

    const result = await WarehouseCapacityService.getDashboard(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('WAREHOUSE_CAPACITY_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
