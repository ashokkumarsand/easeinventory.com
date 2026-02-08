import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { AutomationService } from '@/services/automation.service';

/**
 * GET /api/automations/presets — List available automation presets
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const presets = AutomationService.getReorderPresets();
    return NextResponse.json(presets);
  } catch (error: any) {
    console.error('AUTOMATION_PRESETS_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/automations/presets — Create automation rule from preset
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    const body = await request.json();
    const { presetId } = body;

    if (!presetId) {
      return NextResponse.json({ error: 'presetId is required' }, { status: 400 });
    }

    const rule = await AutomationService.createFromPreset(
      tenantId,
      presetId,
      (session.user as any).id,
    );

    return NextResponse.json(rule, { status: 201 });
  } catch (error: any) {
    console.error('AUTOMATION_PRESET_CREATE_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
