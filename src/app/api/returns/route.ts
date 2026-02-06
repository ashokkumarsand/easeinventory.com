import { authOptions } from '@/lib/auth';
import { ReturnService } from '@/services/return.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List returns
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
      type: searchParams.get('type') || undefined,
      orderId: searchParams.get('orderId') || undefined,
      search: searchParams.get('search') || undefined,
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await ReturnService.list(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('RETURNS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new return
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

    if (!body.orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }
    if (!body.type) {
      return NextResponse.json({ message: 'Return type is required' }, { status: 400 });
    }
    if (!body.reason) {
      return NextResponse.json({ message: 'Return reason is required' }, { status: 400 });
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ message: 'At least one item is required' }, { status: 400 });
    }

    const returnOrder = await ReturnService.create(body, tenantId, userId);
    return NextResponse.json({ message: 'Return created', returnOrder }, { status: 201 });
  } catch (error: any) {
    console.error('RETURNS_POST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
