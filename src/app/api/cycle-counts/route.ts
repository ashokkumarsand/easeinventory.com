import { authOptions } from '@/lib/auth';
import { CycleCountService } from '@/services/cycle-count.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List cycle counts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filter = {
      status: searchParams.get('status') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      search: searchParams.get('search') || undefined,
    };
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const result = await CycleCountService.list(tenantId, filter, page, pageSize);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CYCLE_COUNTS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new cycle count
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.locationId) {
      return NextResponse.json({ message: 'locationId is required' }, { status: 400 });
    }

    const cycleCount = await CycleCountService.create(body, tenantId, userId);
    return NextResponse.json({ message: 'Cycle count created', cycleCount }, { status: 201 });
  } catch (error: any) {
    console.error('CYCLE_COUNTS_POST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}
