import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { AutomationService } from '@/services/automation.service';

/**
 * GET /api/automations/[id] — Get rule by ID with logs
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const rule = await AutomationService.getById(id, tenantId);

    return NextResponse.json(rule);
  } catch (error: any) {
    console.error('AUTOMATION_GET_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message || 'Internal error' }, { status });
  }
}

/**
 * PATCH /api/automations/[id] — Update rule
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();

    // Handle toggle separately
    if (body.toggleActive === true) {
      const rule = await AutomationService.toggleActive(id, tenantId);
      return NextResponse.json(rule);
    }

    const rule = await AutomationService.update(id, tenantId, body);
    return NextResponse.json(rule);
  } catch (error: any) {
    console.error('AUTOMATION_UPDATE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: error.message || 'Internal error' }, { status });
  }
}

/**
 * DELETE /api/automations/[id] — Delete rule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    await AutomationService.delete(id, tenantId);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error('AUTOMATION_DELETE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error.message || 'Internal error' }, { status });
  }
}
