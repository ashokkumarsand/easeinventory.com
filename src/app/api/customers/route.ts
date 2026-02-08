import { authOptions } from '@/lib/auth';
import { CustomerService } from '@/services/customer.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List customers with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const options = {
      segment: (searchParams.get('segment') as any) || undefined,
      tier: (searchParams.get('tier') as any) || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',')
        : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    const result = await CustomerService.list(tenantId, options);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CUSTOMERS_GET_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}

// POST - Create customer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 },
      );
    }

    const customer = await CustomerService.create({
      ...body,
      tenantId,
    });

    return NextResponse.json(
      { message: 'Customer created', customer },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('CUSTOMERS_POST_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 },
    );
  }
}
