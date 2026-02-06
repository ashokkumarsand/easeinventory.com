import { authOptions } from '@/lib/auth';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List purchase orders
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
      supplierId: searchParams.get('supplierId') || undefined,
      search: searchParams.get('search') || undefined,
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await PurchaseOrderService.list(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PURCHASE_ORDERS_GET_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}

// POST - Create new purchase order
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

    if (!body.supplierId) {
      return NextResponse.json(
        { message: 'Supplier is required' },
        { status: 400 },
      );
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { message: 'At least one item is required' },
        { status: 400 },
      );
    }

    const purchaseOrder = await PurchaseOrderService.create(body, tenantId, userId);
    return NextResponse.json(
      { message: 'Purchase order created', purchaseOrder },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('PURCHASE_ORDERS_POST_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
