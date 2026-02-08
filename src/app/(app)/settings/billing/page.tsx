'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlanType,
  PLAN_DETAILS,
  PLAN_HIERARCHY,
  formatPrice,
} from '@/lib/plan-features';
import { Check, CreditCard, Crown, Sparkles, Star, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PLAN_ICONS: Record<PlanType, React.ReactNode> = {
  FREE: <Star className="w-5 h-5" />,
  STARTER: <Zap className="w-5 h-5" />,
  BUSINESS: <Sparkles className="w-5 h-5" />,
  ENTERPRISE: <Crown className="w-5 h-5" />,
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') as PlanType | null;
  const selectedCycle = searchParams.get('cycle') as 'monthly' | 'yearly' | null;

  const [currentPlan, setCurrentPlan] = useState<PlanType>('FREE');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(selectedCycle || 'yearly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/tenant')
      .then(r => r.json())
      .then(data => {
        if (data.tenant?.plan) setCurrentPlan(data.tenant.plan);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const plans: PlanType[] = ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'];

  const handleUpgrade = (plan: PlanType) => {
    // In production, integrate with Razorpay/Stripe
    alert(`Upgrade to ${PLAN_DETAILS[plan].name} (${billingCycle}) — Payment integration coming soon. Contact support@easeinventory.com for manual upgrades.`);
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-muted-foreground">Loading billing info...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-heading flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Billing & Subscription
            </h1>
            <p className="text-sm text-muted-foreground">Manage your plan, billing cycle, and payment method</p>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{PLAN_DETAILS[currentPlan].name}</span>
                <Badge variant="outline" className="text-xs">{currentPlan}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{PLAN_DETAILS[currentPlan].description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{formatPrice(PLAN_DETAILS[currentPlan].price)}</p>
              {PLAN_DETAILS[currentPlan].price > 0 && <p className="text-sm text-muted-foreground">/month</p>}
            </div>
          </div>

          {/* Plan Limits */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Products</p>
              <p className="font-bold">{PLAN_DETAILS[currentPlan].limits.products === -1 ? 'Unlimited' : PLAN_DETAILS[currentPlan].limits.products}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Users</p>
              <p className="font-bold">{PLAN_DETAILS[currentPlan].limits.users === -1 ? 'Unlimited' : PLAN_DETAILS[currentPlan].limits.users}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Locations</p>
              <p className="font-bold">{PLAN_DETAILS[currentPlan].limits.locations === -1 ? 'Unlimited' : PLAN_DETAILS[currentPlan].limits.locations}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Invoices / mo</p>
              <p className="font-bold">{PLAN_DETAILS[currentPlan].limits.invoices === -1 ? 'Unlimited' : PLAN_DETAILS[currentPlan].limits.invoices}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="font-bold">{PLAN_DETAILS[currentPlan].limits.storage} GB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Available Plans</h2>
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
            <TabsList>
              <TabsTrigger value="monthly" className="font-semibold">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="font-semibold">
                Yearly <span className="text-xs text-green-500 ml-1">Save 17%</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(planType => {
            const details = PLAN_DETAILS[planType];
            const isCurrent = currentPlan === planType;
            const isUpgrade = PLAN_HIERARCHY[planType] > PLAN_HIERARCHY[currentPlan];
            const isSelected = selectedPlan === planType;
            const price = billingCycle === 'yearly' ? details.yearlyPrice / 12 : details.price;

            return (
              <Card
                key={planType}
                className={`relative ${isSelected ? 'ring-2 ring-primary' : isCurrent ? 'border-green-500/30 bg-green-500/5' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Current
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {PLAN_ICONS[planType]}
                    </div>
                    <span className="font-bold">{details.name}</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-black">{formatPrice(price)}</span>
                    {price > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatPrice(details.yearlyPrice)} billed yearly
                      </p>
                    )}
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {details.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={isCurrent ? 'secondary' : isUpgrade ? 'default' : 'outline'}
                    disabled={isCurrent || !isUpgrade}
                    onClick={() => handleUpgrade(planType)}
                  >
                    {isCurrent ? 'Current Plan' : isUpgrade ? `Upgrade to ${details.name}` : 'Downgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method (Coming Soon) */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">Payment Method</h3>
          <p className="text-sm text-muted-foreground">
            Online payment via Razorpay is coming soon. For plan upgrades, contact{' '}
            <a href="mailto:support@easeinventory.com" className="text-primary hover:underline">
              support@easeinventory.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
