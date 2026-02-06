import { authOptions } from '@/lib/auth';
import { CycleCountService } from '@/services/cycle-count.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// GET - Get cycle count detail with items
export async function GET(
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
    const cycleCount = await CycleCountService.getById(id, tenantId);

    if (!cycleCount) {
      return NextResponse.json({ message: 'Cycle count not found' }, { status: 404 });
    }

    return NextResponse.json(cycleCount);
  } catch (error: any) {
    console.error('CYCLE_COUNT_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
