import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Generate pick list for order
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

    if (!body.locationId) {
      return NextResponse.json({ message: 'Location ID is required' }, { status: 400 });
    }

    const pickList = await OrderService.generatePickList(
      id,
      tenantId,
      body.locationId,
      body.assignedToId,
    );
    return NextResponse.json({ message: 'Pick list generated', pickList }, { status: 201 });
  } catch (error: any) {
    console.error('ORDER_PICK_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
