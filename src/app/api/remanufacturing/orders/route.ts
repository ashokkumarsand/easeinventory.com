import { authOptions } from '@/lib/auth';
import { RemanufacturingService } from '@/services/remanufacturing.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Remanufacturing dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await RemanufacturingService.getDashboard(tenantId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[REMAN_GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - Create or update remanufacturing order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = (session?.user as any)?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === 'update_status') {
      const order = await RemanufacturingService.updateOrderStatus(
        tenantId,
        body.orderId,
        body.status,
        body.outputQuantity,
        body.scrapQuantity
      );
      return NextResponse.json({ order });
    }

    // Default: create new order
    const order = await RemanufacturingService.createOrder(tenantId, {
      sourceProductId: body.sourceProductId,
      outputProductId: body.outputProductId,
      bomId: body.bomId,
      inputQuantity: body.inputQuantity,
      notes: body.notes,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('[REMAN_POST]', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
