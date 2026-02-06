import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update pick list item (mark as picked)
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

    const { id: pickListId } = await params;
    const body = await req.json();

    if (!body.itemId || body.pickedQty === undefined) {
      return NextResponse.json({ message: 'itemId and pickedQty are required' }, { status: 400 });
    }

    const result = await OrderService.updatePickListItem(
      pickListId,
      body.itemId,
      tenantId,
      body.pickedQty,
      body.scannedBarcode,
    );

    return NextResponse.json({ message: 'Pick list updated', ...result });
  } catch (error: any) {
    console.error('PICKLIST_PATCH_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
