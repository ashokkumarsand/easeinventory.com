import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { WebhookService } from '@/services/webhook.service';

/**
 * GET /api/webhooks/:id — Get endpoint with recent deliveries
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    const endpoint = await WebhookService.getById(id, tenantId);

    if (!endpoint) {
      return NextResponse.json({ message: 'Webhook endpoint not found' }, { status: 404 });
    }

    return NextResponse.json(endpoint);
  } catch (error: any) {
    console.error('WEBHOOK_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * PATCH /api/webhooks/:id — Update endpoint
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    const body = await req.json();

    const endpoint = await WebhookService.update(id, tenantId, {
      url: body.url,
      events: body.events,
      isActive: body.isActive,
    });

    return NextResponse.json(endpoint);
  } catch (error: any) {
    console.error('WEBHOOK_UPDATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}

/**
 * DELETE /api/webhooks/:id — Delete endpoint
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const { id } = await params;
    await WebhookService.delete(id, tenantId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('WEBHOOK_DELETE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
