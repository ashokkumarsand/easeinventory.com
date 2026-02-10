import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { recalculateEffectiveLimits } from '@/lib/plan-limits';
import { ADD_ON_PRICES, canPurchaseAddOns, normalizePlanType } from '@/lib/plan-features';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/plan/add-ons — List active add-ons for the tenant
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = (session.user as any).tenantId;
  if (!tenantId || tenantId === 'system') {
    return NextResponse.json({ error: 'No tenant' }, { status: 400 });
  }

  const addOns = await prisma.planAddOn.findMany({
    where: { tenantId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ addOns, availableAddOns: ADD_ON_PRICES });
}

/**
 * POST /api/plan/add-ons — Purchase an add-on (Business plan only)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const tenantId = user.tenantId;
  if (!tenantId || tenantId === 'system') {
    return NextResponse.json({ error: 'No tenant' }, { status: 400 });
  }

  // Only owners can purchase add-ons
  if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only owners can purchase add-ons' }, { status: 403 });
  }

  const plan = normalizePlanType(user.plan);
  if (!canPurchaseAddOns(plan)) {
    return NextResponse.json(
      { error: 'Add-ons are only available on the Business plan. Please upgrade first.' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { type, quantity } = body;

  if (!type || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'Invalid add-on type or quantity' }, { status: 400 });
  }

  const addOnConfig = ADD_ON_PRICES.find((a) => a.type === type);
  if (!addOnConfig) {
    return NextResponse.json({ error: 'Unknown add-on type' }, { status: 400 });
  }

  // Create the add-on
  const addOn = await prisma.planAddOn.create({
    data: {
      tenantId,
      type,
      quantity,
      pricePerUnit: addOnConfig.pricePerUnit * 100, // Convert to paise
    },
  });

  // Recalculate effective limits
  await recalculateEffectiveLimits(tenantId);

  return NextResponse.json({ addOn }, { status: 201 });
}

/**
 * DELETE /api/plan/add-ons — Cancel an add-on
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const tenantId = user.tenantId;
  if (!tenantId || tenantId === 'system') {
    return NextResponse.json({ error: 'No tenant' }, { status: 400 });
  }

  if (user.role !== 'OWNER' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only owners can manage add-ons' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const addOnId = searchParams.get('id');
  if (!addOnId) {
    return NextResponse.json({ error: 'Add-on ID required' }, { status: 400 });
  }

  // Verify ownership
  const addOn = await prisma.planAddOn.findFirst({
    where: { id: addOnId, tenantId },
  });

  if (!addOn) {
    return NextResponse.json({ error: 'Add-on not found' }, { status: 404 });
  }

  await prisma.planAddOn.update({
    where: { id: addOnId },
    data: { isActive: false },
  });

  await recalculateEffectiveLimits(tenantId);

  return NextResponse.json({ success: true });
}
