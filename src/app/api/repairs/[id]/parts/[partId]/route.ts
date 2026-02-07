import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { SparePartsService } from '@/services/spare-parts.service';

/**
 * DELETE /api/repairs/[id]/parts/[partId] — Remove a spare part
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; partId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { partId } = await params;
    await SparePartsService.removePart(partId, tenantId);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error('REPAIR_PARTS_DELETE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ message: error.message || 'Internal error' }, { status });
  }
}
