import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { LostSalesService } from '@/services/lost-sales.service';

/**
 * GET /api/lost-sales — Lost sales analytics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '90');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await LostSalesService.getAnalytics(tenantId, days, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('LOST_SALES_ANALYTICS_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/lost-sales — Record a lost sale event
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const body = await req.json();
    const result = await LostSalesService.record(tenantId, userId, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('LOST_SALES_RECORD_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
