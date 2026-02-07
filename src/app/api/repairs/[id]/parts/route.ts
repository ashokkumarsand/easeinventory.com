import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { SparePartsService } from '@/services/spare-parts.service';

/**
 * GET /api/repairs/[id]/parts — List parts for a ticket
 */
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
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    const parts = await SparePartsService.getPartsForTicket(id, tenantId);
    return NextResponse.json({ data: parts });
  } catch (error: any) {
    console.error('REPAIR_PARTS_LIST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/repairs/[id]/parts — Add a spare part to a ticket
 */
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
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    const body = await req.json();

    const part = await SparePartsService.addPart(tenantId, {
      ticketId: id,
      productId: body.productId,
      quantity: body.quantity,
      unitCost: body.unitCost,
      notes: body.notes,
    });

    return NextResponse.json(part, { status: 201 });
  } catch (error: any) {
    console.error('REPAIR_PARTS_ADD_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 400;
    return NextResponse.json({ message: error.message || 'Internal error' }, { status });
  }
}
