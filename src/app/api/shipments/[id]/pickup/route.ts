import { authOptions } from '@/lib/auth';
import { ShipmentService } from '@/services/shipment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Schedule carrier pickup
export async function POST(
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
    const body = await req.json();

    if (!body.pickupDate) {
      return NextResponse.json({ message: 'pickupDate is required' }, { status: 400 });
    }

    const shipment = await ShipmentService.schedulePickup(id, tenantId, body.pickupDate);
    return NextResponse.json({ message: 'Pickup scheduled', shipment });
  } catch (error: any) {
    console.error('SHIPMENT_PICKUP_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
