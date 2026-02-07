import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DecisionNudgesService } from '@/services/decision-nudges.service';

/**
 * GET /api/decision-nudges — Get all nudges and pipeline for the tenant
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const result = await DecisionNudgesService.getDashboard(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DECISION_NUDGES_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
