import { authOptions } from '@/lib/auth';
import { checkAllLimits } from '@/lib/plan-limits';
import { normalizePlanType, PLAN_DETAILS, getTrialDaysRemaining } from '@/lib/plan-features';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * GET /api/plan/limits — Current usage vs plan limits
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

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      plan: true,
      trialEndsAt: true,
      planExpiresAt: true,
      planAddOns: {
        where: { isActive: true },
        select: { type: true, quantity: true, pricePerUnit: true },
      },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const plan = normalizePlanType(tenant.plan as string);
  const limits = await checkAllLimits(tenantId);
  const trialDaysRemaining = getTrialDaysRemaining(tenant.trialEndsAt);
  const planDetails = PLAN_DETAILS[plan];

  return NextResponse.json({
    plan,
    planDetails: {
      name: planDetails.name,
      price: planDetails.price,
      yearlyPrice: planDetails.yearlyPrice,
    },
    trialEndsAt: tenant.trialEndsAt,
    trialDaysRemaining,
    planExpiresAt: tenant.planExpiresAt,
    limits,
    addOns: tenant.planAddOns,
  });
}
