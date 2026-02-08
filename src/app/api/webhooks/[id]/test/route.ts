import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { WebhookService } from '@/services/webhook.service';

/**
 * POST /api/webhooks/:id/test — Send test event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    const result = await WebhookService.testEndpoint(id, tenantId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('WEBHOOK_TEST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
