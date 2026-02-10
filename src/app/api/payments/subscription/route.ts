import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Razorpay subscription plans - configured in dashboard
const RAZORPAY_PLANS = {
  basic_monthly: process.env.RAZORPAY_PLAN_BASIC_MONTHLY || 'plan_basic_monthly',
  basic_annual: process.env.RAZORPAY_PLAN_BASIC_ANNUAL || 'plan_basic_annual',
  // Legacy keys for backward compat
  starter_monthly: process.env.RAZORPAY_PLAN_BASIC_MONTHLY || 'plan_basic_monthly',
  starter_annual: process.env.RAZORPAY_PLAN_BASIC_ANNUAL || 'plan_basic_annual',
  business_monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY || 'plan_business_monthly',
  business_annual: process.env.RAZORPAY_PLAN_BUSINESS_ANNUAL || 'plan_business_annual',
  professional_monthly: process.env.RAZORPAY_PLAN_ENTERPRISE_MONTHLY || 'plan_enterprise_monthly',
  professional_annual: process.env.RAZORPAY_PLAN_ENTERPRISE_ANNUAL || 'plan_enterprise_annual',
  enterprise_monthly: process.env.RAZORPAY_PLAN_ENTERPRISE_MONTHLY || 'plan_enterprise_monthly',
  enterprise_annual: process.env.RAZORPAY_PLAN_ENTERPRISE_ANNUAL || 'plan_enterprise_annual',
};

// Plan pricing in paise (for verification)
const PLAN_PRICING = {
  basic_monthly: 59900, // ₹599
  basic_annual: 599000, // ₹5,990
  starter_monthly: 59900, // backward compat
  starter_annual: 599000,
  business_monthly: 399900, // ₹3,999
  business_annual: 3999000, // ₹39,990
  professional_monthly: 0, // Contact sales
  professional_annual: 0,
  enterprise_monthly: 0,
  enterprise_annual: 0,
};

// POST - Create Razorpay Subscription
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;

    const body = await req.json();
    const { planId, billingCycle, gstin, customerDetails } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json({ message: 'Plan and billing cycle are required' }, { status: 400 });
    }

    // Validate plan
    const planKey = `${planId}_${billingCycle}` as keyof typeof RAZORPAY_PLANS;
    if (!RAZORPAY_PLANS[planKey]) {
      return NextResponse.json({ message: 'Invalid plan' }, { status: 400 });
    }

    // Get tenant and user info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, email: true, phone: true, gstNumber: true }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true }
    });

    if (!tenant || !user) {
      return NextResponse.json({ message: 'Tenant or user not found' }, { status: 404 });
    }

    // Update GST if provided
    if (gstin) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { gstNumber: gstin }
      });
    }

    // Create Razorpay customer (or get existing)
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ message: 'Payment gateway not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    // Create customer in Razorpay
    const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: customerDetails?.name || user.name || tenant.name,
        email: customerDetails?.email || user.email || tenant.email,
        contact: customerDetails?.phone || user.phone || tenant.phone,
        gstin: gstin || tenant.gstNumber,
        notes: {
          tenant_id: tenantId,
          user_id: userId,
        }
      })
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.json();
      console.error('Razorpay customer creation failed:', error);
      return NextResponse.json({ message: 'Failed to create customer' }, { status: 500 });
    }

    const customer = await customerResponse.json();

    // Create subscription
    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: RAZORPAY_PLANS[planKey],
        total_count: billingCycle === 'annual' ? 1 : 12, // 1 year or 12 months
        quantity: 1,
        customer_notify: 1,
        customer_id: customer.id,
        notes: {
          tenant_id: tenantId,
          plan_name: planId,
          billing_cycle: billingCycle,
          gstin: gstin || tenant.gstNumber || '',
          sac_code: '998314', // Cloud computing services
        }
      })
    });

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.json();
      console.error('Razorpay subscription creation failed:', error);
      return NextResponse.json({ message: 'Failed to create subscription' }, { status: 500 });
    }

    const subscription = await subscriptionResponse.json();

    // Store subscription reference in tenant settings
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          subscription: {
            razorpay_subscription_id: subscription.id,
            razorpay_customer_id: customer.id,
            plan_id: planId,
            billing_cycle: billingCycle,
            status: subscription.status,
            created_at: new Date().toISOString(),
          }
        }
      }
    });

    return NextResponse.json({
      subscription_id: subscription.id,
      short_url: subscription.short_url,
      status: subscription.status,
      razorpay_key: razorpayKeyId,
    });

  } catch (error: any) {
    console.error('PAYMENT_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// GET - Get subscription status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { 
        plan: true, 
        planExpiresAt: true, 
        settings: true,
        gstNumber: true 
      }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    const subscription = (tenant.settings as any)?.subscription;

    return NextResponse.json({
      plan: tenant.plan,
      expiresAt: tenant.planExpiresAt,
      gstNumber: tenant.gstNumber,
      subscription: subscription ? {
        id: subscription.razorpay_subscription_id,
        plan_id: subscription.plan_id,
        billing_cycle: subscription.billing_cycle,
        status: subscription.status,
      } : null
    });

  } catch (error: any) {
    console.error('PAYMENT_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
