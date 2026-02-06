import { authOptions } from '@/lib/auth';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get goods receipt by ID
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
    const grn = await GoodsReceiptService.getById(id, tenantId);
    if (!grn) {
      return NextResponse.json({ message: 'Goods receipt not found' }, { status: 404 });
    }

    return NextResponse.json({ grn });
  } catch (error: any) {
    console.error('GRN_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
