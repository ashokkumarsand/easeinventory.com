import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Public tracking page — no auth required.
 * Returns shipment tracking events by AWB number.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> },
) {
  try {
    const { awb } = await params;

    const shipment = await prisma.shipment.findFirst({
      where: { awbNumber: awb },
      select: {
        shipmentNumber: true,
        awbNumber: true,
        carrierName: true,
        status: true,
        currentEvent: true,
        deliveredAt: true,
        trackingEvents: {
          select: {
            status: true,
            description: true,
            location: true,
            city: true,
            eventAt: true,
          },
          orderBy: { eventAt: 'desc' },
        },
        order: {
          select: {
            orderNumber: true,
            shippingName: true,
            shippingCity: true,
            shippingState: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ message: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json({ shipment });
  } catch (error: any) {
    console.error('PUBLIC_TRACK_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
