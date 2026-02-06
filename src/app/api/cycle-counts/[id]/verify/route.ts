import { authOptions } from '@/lib/auth';
import { CycleCountService } from '@/services/cycle-count.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// POST - Verify/approve cycle count results
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const cycleCount = await CycleCountService.verify(id, tenantId, userId);
    return NextResponse.json({ message: 'Cycle count verified', cycleCount });
  } catch (error: any) {
    console.error('CYCLE_COUNT_VERIFY_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
