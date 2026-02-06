import { authOptions } from '@/lib/auth';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update goods receipt item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
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

    const { id, itemId } = await params;
    const body = await req.json();

    if (body.receivedQty === undefined || body.receivedQty === null) {
      return NextResponse.json({ message: 'receivedQty is required' }, { status: 400 });
    }

    const item = await GoodsReceiptService.updateItem(
      id,
      itemId,
      tenantId,
      body.receivedQty,
      body.rejectedQty,
      body.rejectionReason,
      body.lotNumber,
      body.batchNumber,
      body.expiryDate,
      body.putawayLocationId,
    );
    return NextResponse.json({ message: 'GRN item updated', item });
  } catch (error: any) {
    console.error('GRN_ITEM_UPDATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
