import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { WebhookService } from '@/services/webhook.service';

/**
 * GET /api/webhooks — List webhook endpoints
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const endpoints = await WebhookService.list(tenantId);
    return NextResponse.json({ endpoints });
  } catch (error: any) {
    console.error('WEBHOOK_LIST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/webhooks — Create webhook endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const body = await req.json();

    if (!body.url) {
      return NextResponse.json({ message: 'URL is required' }, { status: 400 });
    }
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json({ message: 'At least one event is required' }, { status: 400 });
    }

    const endpoint = await WebhookService.create({
      url: body.url,
      secret: body.secret,
      events: body.events,
      createdById: userId,
      tenantId,
    });

    return NextResponse.json(endpoint, { status: 201 });
  } catch (error: any) {
    console.error('WEBHOOK_CREATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
