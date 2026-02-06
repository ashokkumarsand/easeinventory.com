import { authOptions } from '@/lib/auth';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Cancel goods receipt
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
    const grn = await GoodsReceiptService.cancel(id, tenantId);
    return NextResponse.json({ message: 'GRN cancelled', grn });
  } catch (error: any) {
    console.error('GRN_CANCEL_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
