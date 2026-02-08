import { authOptions } from '@/lib/auth';
import { CustomerService } from '@/services/customer.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// GET - Get customer analytics (segmentation stats, CLV, distribution)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await CustomerService.getAnalytics(tenantId);

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('CUSTOMER_ANALYTICS_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
