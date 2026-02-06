import { authOptions } from '@/lib/auth';
import { ShipmentService } from '@/services/shipment.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Generate shipping label
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
    const shipment = await ShipmentService.generateLabel(id, tenantId);
    return NextResponse.json({ message: 'Label generated', labelUrl: shipment.labelUrl });
  } catch (error: any) {
    console.error('SHIPMENT_LABEL_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
