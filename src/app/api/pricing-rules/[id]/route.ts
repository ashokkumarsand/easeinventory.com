import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DynamicPricingService } from '@/services/dynamic-pricing.service';

/**
 * GET /api/pricing-rules/[id] — Get a single pricing rule
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const rule = await DynamicPricingService.getById(id, tenantId);
    if (!rule) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error: any) {
    console.error('PRICING_RULE_GET_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * PUT /api/pricing-rules/[id] — Update a pricing rule
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const rule = await DynamicPricingService.update(id, tenantId, body);
    return NextResponse.json(rule);
  } catch (error: any) {
    console.error('PRICING_RULE_UPDATE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 400;
    return NextResponse.json({ message: error.message || 'Internal error' }, { status });
  }
}

/**
 * DELETE /api/pricing-rules/[id] — Delete a pricing rule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const { id } = await params;
    await DynamicPricingService.delete(id, tenantId);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: any) {
    console.error('PRICING_RULE_DELETE_ERROR:', error);
    const status = error.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ message: error.message || 'Internal error' }, { status });
  }
}
