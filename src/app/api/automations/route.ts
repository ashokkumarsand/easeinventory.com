import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { AutomationService } from '@/services/automation.service';

/**
 * GET /api/automations — List all automation rules for tenant
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const rules = await AutomationService.list(tenantId);
    return NextResponse.json({ rules });
  } catch (error: any) {
    console.error('AUTOMATIONS_LIST_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/automations — Create new automation rule
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.name || !body.triggerType || !body.actionType) {
      return NextResponse.json(
        { error: 'name, triggerType, and actionType are required' },
        { status: 400 },
      );
    }

    const rule = await AutomationService.create(tenantId, {
      name: body.name,
      triggerType: body.triggerType,
      conditionJson: body.conditionJson,
      actionType: body.actionType,
      actionConfigJson: body.actionConfigJson,
      cronExpression: body.cronExpression,
      createdById: userId,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    console.error('AUTOMATIONS_CREATE_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 400 });
  }
}
