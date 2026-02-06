import { authOptions } from '@/lib/auth';
import { ShipmentService } from '@/services/shipment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List shipments
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
    const filter = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      ndrOnly: searchParams.get('ndrOnly') === 'true',
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await ShipmentService.list(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SHIPMENTS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create shipment (push to carrier)
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

    if (!body.orderId || !body.carrierAccountId) {
      return NextResponse.json(
        { message: 'orderId and carrierAccountId are required' },
        { status: 400 },
      );
    }

    const shipment = await ShipmentService.create(
      body.orderId,
      tenantId,
      body.carrierAccountId,
      body.courierCompanyId,
    );

    return NextResponse.json({ message: 'Shipment created', shipment }, { status: 201 });
  } catch (error: any) {
    console.error('SHIPMENTS_POST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
