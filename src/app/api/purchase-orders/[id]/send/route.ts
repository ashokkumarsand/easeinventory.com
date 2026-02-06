import { authOptions } from '@/lib/auth';
import { PurchaseOrderService } from '@/services/purchase-order.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Send purchase order to supplier
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
    const purchaseOrder = await PurchaseOrderService.send(id, tenantId);

    return NextResponse.json({ message: 'Purchase order sent', purchaseOrder });
  } catch (error: any) {
    console.error('PURCHASE_ORDER_SEND_ERROR:', error);
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
