import { authOptions } from '@/lib/auth';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Complete goods receipt
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
    const body = await req.json();
    const grn = await GoodsReceiptService.complete(id, tenantId, body.qcStatus);
    return NextResponse.json({ message: 'GRN completed', grn });
  } catch (error: any) {
    console.error('GRN_COMPLETE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
