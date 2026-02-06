import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List sales orders
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
      fulfillmentStatus: searchParams.get('fulfillmentStatus') || undefined,
      search: searchParams.get('search') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      isCOD: searchParams.get('isCOD') === 'true' ? true : searchParams.get('isCOD') === 'false' ? false : undefined,
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await OrderService.list(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ORDERS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new sales order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.shippingName || !body.shippingPhone || !body.shippingAddress ||
        !body.shippingCity || !body.shippingState || !body.shippingPincode) {
      return NextResponse.json({ message: 'Shipping details are required' }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'At least one item is required' }, { status: 400 });
    }

    const order = await OrderService.create(body, tenantId, userId);
    return NextResponse.json({ message: 'Order created', order }, { status: 201 });
  } catch (error: any) {
    console.error('ORDERS_POST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
