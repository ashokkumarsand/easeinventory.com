import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { SparePartsService } from '@/services/spare-parts.service';

/**
 * GET /api/spare-parts — Spare parts usage analytics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const result = await SparePartsService.getUsageAnalytics(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SPARE_PARTS_ANALYTICS_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
