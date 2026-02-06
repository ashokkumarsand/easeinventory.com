import { authOptions } from '@/lib/auth';
import { ShipmentService } from '@/services/shipment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Check pincode serviceability
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

    const body = await req.json();

    if (!body.carrierAccountId || !body.pickupPincode || !body.deliveryPincode) {
      return NextResponse.json(
        { message: 'carrierAccountId, pickupPincode, and deliveryPincode are required' },
        { status: 400 },
      );
    }

    const result = await ShipmentService.checkServiceability(
      body.carrierAccountId,
      body.pickupPincode,
      body.deliveryPincode,
      body.weightGrams || 500,
      body.isCOD || false,
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SERVICEABILITY_CHECK_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
