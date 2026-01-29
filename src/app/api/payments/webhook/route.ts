import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Razorpay Webhook Handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || !signature) {
      console.error('Webhook secret or signature missing');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event);

    const { event: eventType, payload } = event;

    switch (eventType) {
      case 'subscription.authenticated':
        await handleSubscriptionAuthenticated(payload);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(payload);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload);
        break;

      case 'subscription.completed':
        await handleSubscriptionCompleted(payload);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(payload);
        break;

      case 'subscription.pending':
        await handleSubscriptionPending(payload);
        break;

      case 'subscription.halted':
        await handleSubscriptionHalted(payload);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload);
        break;

      case 'payment.authorized':
      case 'payment.captured':
        await handlePaymentSuccess(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('WEBHOOK_ERROR:', error);
    return NextResponse.json({ message: 'Webhook error' }, { status: 500 });
  }
}

// Helper functions for each event type
async function handleSubscriptionAuthenticated(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId) {
    await updateTenantSubscriptionStatus(tenantId, 'authenticated', subscription);
  }
}

async function handleSubscriptionActivated(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;
  const planName = subscription.notes?.plan_name;
  const billingCycle = subscription.notes?.billing_cycle;

  if (tenantId) {
    // Map plan name to PlanType enum
    const planMap: Record<string, 'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE'> = {
      'starter': 'STARTER',
      'business': 'BUSINESS',
      'professional': 'ENTERPRISE',
    };

    const plan = planMap[planName] || 'STARTER';
    const expiresAt = billingCycle === 'annual' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Determine feature flags based on plan
    const planFeatures = {
      customDomainAllowed: plan === 'BUSINESS' || plan === 'ENTERPRISE',
      apiAccessAllowed: plan === 'ENTERPRISE',
      whatsappLimit: plan === 'STARTER' ? 100 : plan === 'BUSINESS' ? 500 : 2000,
      storageLimit: plan === 'STARTER' ? 500 : plan === 'BUSINESS' ? 5120 : 25600, // MB
    };

    // Get current tenant settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    });

    const currentSettings = (tenant?.settings as any) || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan,
        planExpiresAt: expiresAt,
        settings: {
          ...currentSettings,
          paymentPending: false,
          planFeatures,
          subscription: {
            razorpay_subscription_id: subscription.id,
            plan_id: planName,
            billing_cycle: billingCycle,
            status: 'active',
            activated_at: new Date().toISOString(),
          }
        }
      }
    });

    console.log(`Subscription activated for tenant ${tenantId}: ${plan}, features:`, planFeatures);
  }
}

async function handleSubscriptionCharged(payload: any) {
  const subscription = payload.subscription.entity;
  const payment = payload.payment?.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId && payment) {
    const billingCycle = subscription.notes?.billing_cycle;
    const expiresAt = billingCycle === 'annual'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        planExpiresAt: expiresAt,
      }
    });

    // Log payment for records
    console.log(`Payment received for tenant ${tenantId}: ${payment.amount / 100} INR`);
  }
}

async function handleSubscriptionCompleted(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId) {
    await updateTenantSubscriptionStatus(tenantId, 'completed', subscription);
  }
}

async function handleSubscriptionUpdated(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId) {
    await updateTenantSubscriptionStatus(tenantId, subscription.status, subscription);
  }
}

async function handleSubscriptionPending(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId) {
    await updateTenantSubscriptionStatus(tenantId, 'pending', subscription);
  }
}

async function handleSubscriptionHalted(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId) {
    // Downgrade to FREE plan
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan: 'FREE',
        planExpiresAt: null,
      }
    });

    await updateTenantSubscriptionStatus(tenantId, 'halted', subscription);
  }
}

async function handleSubscriptionCancelled(payload: any) {
  const subscription = payload.subscription.entity;
  const tenantId = subscription.notes?.tenant_id;

  if (tenantId) {
    // Mark as cancelled but don't downgrade immediately
    await updateTenantSubscriptionStatus(tenantId, 'cancelled', subscription);
  }
}

async function handlePaymentSuccess(payload: any) {
  const payment = payload.payment?.entity;
  console.log('Payment successful:', payment?.id, 'Amount:', payment?.amount / 100, 'INR');
}

async function handlePaymentFailed(payload: any) {
  const payment = payload.payment?.entity;
  console.log('Payment failed:', payment?.id, 'Error:', payment?.error_description);
}

async function updateTenantSubscriptionStatus(tenantId: string, status: string, subscription: any) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  });

  if (tenant) {
    const currentSettings = (tenant.settings as any) || {};
    const currentSubscription = currentSettings.subscription || {};

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...currentSettings,
          subscription: {
            ...currentSubscription,
            status,
            updated_at: new Date().toISOString(),
          }
        }
      }
    });
  }
}
