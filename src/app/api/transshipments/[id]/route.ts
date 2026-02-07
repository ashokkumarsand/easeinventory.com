import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { TransshipmentService } from '@/services/transshipment.service';

/**
 * PUT /api/transshipments/[id] — Approve or reject a transshipment
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    const body = await req.json();
    const action = body.action as 'approve' | 'reject';

    if (action === 'approve') {
      const result = await TransshipmentService.approve(tenantId, userId, id);
      return NextResponse.json(result);
    } else if (action === 'reject') {
      const result = await TransshipmentService.reject(tenantId, userId, id, body.reason);
      return NextResponse.json(result);
    }

    return NextResponse.json({ message: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
  } catch (error: any) {
    console.error('TRANSSHIPMENT_ACTION_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
