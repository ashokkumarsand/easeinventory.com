import { authOptions } from '@/lib/auth';
import { GoodsReceiptService } from '@/services/goods-receipt.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List goods receipts
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
      poId: searchParams.get('poId') || undefined,
      search: searchParams.get('search') || undefined,
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await GoodsReceiptService.list(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GRN_LIST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

// POST - Create goods receipt note
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

    // Create from purchase order
    if (body.fromPO && body.poId) {
      const grn = await GoodsReceiptService.createFromPO(body.poId, tenantId, userId, body.receivingLocationId);
      return NextResponse.json({ message: 'GRN created from PO', grn }, { status: 201 });
    }

    // Manual creation — validate required fields
    if (!body.supplierId) {
      return NextResponse.json({ message: 'Supplier is required' }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'At least one item is required' }, { status: 400 });
    }

    const grn = await GoodsReceiptService.create(body, tenantId, userId);
    return NextResponse.json({ message: 'GRN created', grn }, { status: 201 });
  } catch (error: any) {
    console.error('GRN_CREATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
