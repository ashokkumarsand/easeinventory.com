import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ActivityService } from '@/services/activity.service';

/**
 * GET /api/activity — List activity events (paginated, filterable)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get('entityType') || undefined;
    const type = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await ActivityService.list(tenantId, {
      entityType,
      type,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('ACTIVITY_LIST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/activity — Log a new activity event
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) return NextResponse.json({ message: 'No tenant found' }, { status: 404 });

    const body = await req.json();

    if (!body.type || !body.entityType || !body.entityId) {
      return NextResponse.json(
        { message: 'type, entityType, and entityId are required' },
        { status: 400 },
      );
    }

    const event = await ActivityService.log({
      tenantId,
      type: body.type,
      entityType: body.entityType,
      entityId: body.entityId,
      entityName: body.entityName,
      description: body.description,
      userId,
      metadata: body.metadata,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('ACTIVITY_LOG_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
