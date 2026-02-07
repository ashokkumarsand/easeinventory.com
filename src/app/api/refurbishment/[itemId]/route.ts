import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { RefurbishmentService } from '@/services/refurbishment.service';

/**
 * PUT /api/refurbishment/[itemId] — Update refurbishment status
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { itemId } = await params;
    const body = await req.json();
    const result = await RefurbishmentService.updateStatus(
      tenantId,
      itemId,
      body.status,
      body.cost,
      body.notes,
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REFURBISHMENT_UPDATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
