import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { PlacementOptimizerService } from '@/services/placement-optimizer.service';

/**
 * GET /api/analytics/placement-optimizer — Get placement recommendations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const lookbackDays = parseInt(req.nextUrl.searchParams.get('lookbackDays') || '90');
    const result = await PlacementOptimizerService.getDashboard(tenantId, lookbackDays);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PLACEMENT_OPTIMIZER_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
