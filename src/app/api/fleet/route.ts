import { authOptions } from '@/lib/auth';
import { FleetService } from '@/services/fleet.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fleet dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await FleetService.getDashboard(tenantId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[FLEET_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - Add vehicle, driver, or trip
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'add_vehicle') {
      const vehicle = await FleetService.addVehicle(tenantId, {
        registrationNumber: body.registrationNumber,
        type: body.type || 'VAN',
        capacity: body.capacity || 500,
        driverName: body.driverName,
        driverPhone: body.driverPhone,
      });
      return NextResponse.json({ vehicle }, { status: 201 });
    }

    if (action === 'add_driver') {
      const driver = await FleetService.addDriver(tenantId, {
        name: body.name,
        phone: body.phone,
        licenseNumber: body.licenseNumber,
        vehicleId: body.vehicleId,
      });
      return NextResponse.json({ driver }, { status: 201 });
    }

    if (action === 'create_trip') {
      const trip = await FleetService.createTrip(tenantId, {
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        shipmentIds: body.shipmentIds || [],
        notes: body.notes,
      });
      return NextResponse.json({ trip }, { status: 201 });
    }

    if (action === 'complete_trip') {
      const trip = await FleetService.completeTrip(tenantId, body.tripId);
      return NextResponse.json({ trip });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[FLEET_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
