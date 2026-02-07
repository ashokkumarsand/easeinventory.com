import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { WarehouseCapacityService } from '@/services/warehouse-capacity.service';

/**
 * PUT /api/warehouse-capacity/[locationId] — Update capacity settings
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ locationId: string }> },
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

    const { locationId } = await params;
    const body = await req.json();
    const { capacity, maxWeightKg, maxVolumeCbm } = body;

    const result = await WarehouseCapacityService.updateCapacity(locationId, tenantId, {
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      maxWeightKg: maxWeightKg !== undefined ? Number(maxWeightKg) : undefined,
      maxVolumeCbm: maxVolumeCbm !== undefined ? Number(maxVolumeCbm) : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('WAREHOUSE_CAPACITY_UPDATE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 400;
    return NextResponse.json({ message: error.message || 'Internal error' }, { status });
  }
}
