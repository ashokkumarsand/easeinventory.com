import { authOptions } from '@/lib/auth';
import { CycleCountService } from '@/services/cycle-count.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// POST - Start cycle count (populate items)
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
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const cycleCount = await CycleCountService.start(id, tenantId);
    return NextResponse.json({ message: 'Cycle count started', cycleCount });
  } catch (error: any) {
    console.error('CYCLE_COUNT_START_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
