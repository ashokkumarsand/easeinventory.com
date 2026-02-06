import { authOptions } from '@/lib/auth';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get purchase order by ID
export async function GET(
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
    const purchaseOrder = await PurchaseOrderService.getById(id, tenantId);

    if (!purchaseOrder) {
      return NextResponse.json(
        { message: 'Purchase order not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(purchaseOrder);
  } catch (error: any) {
    console.error('PURCHASE_ORDER_GET_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}

// PATCH - Update purchase order
export async function PATCH(
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

    const purchaseOrder = await PurchaseOrderService.update(id, tenantId, body);
    return NextResponse.json(purchaseOrder);
  } catch (error: any) {
    console.error('PURCHASE_ORDER_PATCH_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
