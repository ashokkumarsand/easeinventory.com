import { authOptions } from '@/lib/auth';
import { ShipmentService } from '@/services/shipment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Handle NDR action (reattempt or RTO)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> },
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

    const { awb } = await params;
    const body = await req.json();

    if (!body.action || !['REATTEMPT', 'RTO'].includes(body.action)) {
      return NextResponse.json(
        { message: 'action is required and must be REATTEMPT or RTO' },
        { status: 400 },
      );
    }

    const shipment = await prisma.shipment.findFirst({
      where: { awbNumber: awb, tenantId },
    });

    if (!shipment) {
      return NextResponse.json({ message: 'Shipment not found' }, { status: 404 });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        ndrStatus: body.action === 'REATTEMPT' ? 'REATTEMPT_REQUESTED' : 'RTO_REQUESTED',
        ndrActionTaken: body.comments,
      },
    });

    return NextResponse.json({ shipment: updatedShipment });
  } catch (error: any) {
    console.error('NDR_ACTION_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
