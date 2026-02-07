import { authOptions } from '@/lib/auth';
import { BOMService } from '@/services/bom.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - Check component availability for assembly
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
    const url = req.nextUrl;
    const quantity = parseInt(url.searchParams.get('quantity') || '1');
    const locationId = url.searchParams.get('locationId') || undefined;

    const result = await BOMService.checkAvailability(id, quantity, tenantId, locationId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('BOM_AVAILABILITY_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
