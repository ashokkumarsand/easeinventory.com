import { authOptions } from '@/lib/auth';
import { CustomerService } from '@/services/customer.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// POST - Run auto-segmentation
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await CustomerService.segmentAll(tenantId);

    return NextResponse.json({
      message: `Segmentation complete. ${result.segmented} customers updated.`,
      ...result,
    });
  } catch (error: any) {
    console.error('CUSTOMER_SEGMENT_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
