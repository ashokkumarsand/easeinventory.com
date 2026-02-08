import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { AutomationService } from '@/services/automation.service';

/**
 * POST /api/automations/evaluate — Trigger evaluation run for all active rules
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const result = await AutomationService.evaluate(tenantId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AUTOMATION_EVALUATE_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
