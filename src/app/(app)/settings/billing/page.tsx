'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  PlanType,
  PLAN_DETAILS,
  PLAN_HIERARCHY,
  ADD_ON_PRICES,
  formatPrice,
  normalizePlanType,
  canPurchaseAddOns,
  getTrialDaysRemaining,
  isTrialPlan as checkIsTrialPlan,
} from '@/lib/plan-features';
import { Check, CreditCard, Crown, Sparkles, Zap, Building2, ArrowLeft, Clock, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  TRIAL: <Clock className="w-5 h-5" />,
  BASIC: <Zap className="w-5 h-5" />,
  BUSINESS: <Sparkles className="w-5 h-5" />,
  ENTERPRISE: <Crown className="w-5 h-5" />,
};

const DISPLAY_PLANS: PlanType[] = ['BASIC', 'BUSINESS', 'ENTERPRISE'];

interface LimitData {
  resource: string;
  current: number;
  limit: number;
  percentUsed: number;
  allowed: boolean;
}

interface AddOnData {
  id: string;
  type: string;
  quantity: number;
  pricePerUnit: number;
  isActive: boolean;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') as PlanType | null;
  const selectedCycle = searchParams.get('cycle') as 'monthly' | 'yearly' | null;

  const [currentPlan, setCurrentPlan] = useState<PlanType>('TRIAL');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(selectedCycle || 'yearly');
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState<LimitData[]>([]);
  const [activeAddOns, setActiveAddOns] = useState<AddOnData[]>([]);

  const fetchBillingData = () => {
    Promise.all([
      fetch('/api/settings/tenant').then(r => r.json()),
      fetch('/api/plan/limits').then(r => r.json()).catch(() => null),
      fetch('/api/plan/add-ons').then(r => r.json()).catch(() => null),
    ])
      .then(([tenantData, limitsData, addOnsData]) => {
        if (tenantData.tenant?.plan) {
          setCurrentPlan(normalizePlanType(tenantData.tenant.plan));
          setTrialEndsAt(tenantData.tenant.trialEndsAt || null);
        }
        if (limitsData?.limits) setLimits(limitsData.limits);
        if (addOnsData?.addOns) setActiveAddOns(addOnsData.addOns);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBillingData(); }, []);

  const isTrialPlan = checkIsTrialPlan(currentPlan);
  const trialDays = getTrialDaysRemaining(trialEndsAt);
  const isTrialExpired = isTrialPlan && trialDays !== null && trialDays <= 0;
  const showAddOns = canPurchaseAddOns(currentPlan);

  const handleUpgrade = (plan: PlanType) => {
    if (plan === 'ENTERPRISE') {
      window.location.href = '/contact?ref=billing';
      return;
    }
    alert(`Upgrade to ${PLAN_DETAILS[plan].name} (${billingCycle}) — Payment integration coming soon. Contact support@easeinventory.com for manual upgrades.`);
  };

  const handlePurchaseAddOn = async (type: string) => {
    try {
      const res = await fetch('/api/plan/add-ons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, quantity: 1 }),
      });
      if (res.ok) fetchBillingData();
      else {
        const data = await res.json();
        alert(data.error || 'Failed to purchase add-on');
      }
    } catch { alert('Failed to purchase add-on'); }
  };

  const handleCancelAddOn = async (id: string) => {
    try {
      const res = await fetch(`/api/plan/add-ons?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchBillingData();
    } catch { alert('Failed to cancel add-on'); }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center text-muted-foreground">Loading billing info...</div>;
  }

  const planDetails = PLAN_DETAILS[currentPlan];

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
            <p className="text-sm text-muted-foreground">Manage your plan, billing cycle, and add-ons</p>
          </div>
        </div>
      </div>

      {/* Trial Banner */}
      {isTrialPlan && (
        <Card className={`border ${isTrialExpired ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className={`w-6 h-6 ${isTrialExpired ? 'text-destructive' : 'text-primary'}`} />
                <div>
                  <p className="font-bold">
                    {isTrialExpired
                      ? 'Your free trial has ended'
                      : `${trialDays} day${trialDays !== 1 ? 's' : ''} remaining in your free trial`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isTrialExpired
                      ? 'Subscribe to continue using EaseInventory'
                      : 'Subscribe before your trial ends to keep all your data'}
                  </p>
                </div>
              </div>
              <Button variant={isTrialExpired ? 'destructive' : 'default'} onClick={() => handleUpgrade('BASIC')}>
                Subscribe Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{planDetails.name}</span>
                <Badge variant="outline" className="text-xs">{currentPlan}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{planDetails.description}</p>
            </div>
            <div className="text-right">
              {planDetails.price > 0 ? (
                <>
                  <p className="text-3xl font-black">{formatPrice(planDetails.price)}</p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </>
              ) : isTrialPlan ? (
                <p className="text-2xl font-black text-primary">Free Trial</p>
              ) : (
                <p className="text-2xl font-black">Custom</p>
              )}
            </div>
          </div>

          {/* Plan Limits with Progress Bars */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            {limits.length > 0 ? (
              limits.map((l) => (
                <div key={l.resource}>
                  <p className="text-xs text-muted-foreground capitalize">{l.resource}</p>
                  <p className="font-bold">
                    {l.current} / {l.limit === -1 ? '∞' : l.limit}
                  </p>
                  {l.limit !== -1 && (
                    <Progress
                      value={l.percentUsed}
                      className={`h-1.5 mt-1 ${
                        l.percentUsed >= 90 ? '[&>div]:bg-destructive' : l.percentUsed >= 70 ? '[&>div]:bg-amber-500' : ''
                      }`}
                    />
                  )}
                </div>
              ))
            ) : (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Products</p>
                  <p className="font-bold">{planDetails.limits.products === -1 ? 'Unlimited' : planDetails.limits.products}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="font-bold">{planDetails.limits.users === -1 ? 'Unlimited' : planDetails.limits.users}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Locations</p>
                  <p className="font-bold">{planDetails.limits.locations === -1 ? 'Unlimited' : planDetails.limits.locations}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Invoices / mo</p>
                  <p className="font-bold">{planDetails.limits.invoices === -1 ? 'Unlimited' : planDetails.limits.invoices}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="font-bold">{planDetails.limits.storage} GB</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add-on Management (Business only) */}
      {showAddOns && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add-on Credits
            </h3>

            {/* Active Add-ons */}
            {activeAddOns.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Active Add-ons</p>
                <div className="space-y-2">
                  {activeAddOns.map((addOn) => {
                    const config = ADD_ON_PRICES.find((a) => a.type === addOn.type);
                    return (
                      <div key={addOn.id} className="flex items-center justify-between p-3 rounded-lg bg-foreground/5">
                        <div>
                          <p className="font-medium text-sm">{config?.name || addOn.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {addOn.quantity} × ₹{addOn.pricePerUnit / 100}/mo
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleCancelAddOn(addOn.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Add-ons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ADD_ON_PRICES.map((addOn) => (
                <div key={addOn.type} className="p-4 rounded-lg border border-foreground/10 text-center">
                  <p className="text-sm font-bold mb-1">{addOn.name}</p>
                  <p className="text-xl font-black text-primary">₹{addOn.pricePerUnit}</p>
                  <p className="text-xs text-muted-foreground mb-3">{addOn.unit}</p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handlePurchaseAddOn(addOn.type)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DISPLAY_PLANS.map(planType => {
            const details = PLAN_DETAILS[planType];
            const isCurrent = currentPlan === planType || (isTrialPlan && planType === 'BASIC');
            const isUpgrade = PLAN_HIERARCHY[planType] > PLAN_HIERARCHY[currentPlan];
            const isSelected = selectedPlan === planType;
            const isEnterprise = planType === 'ENTERPRISE';
            const price = isEnterprise ? 0 : billingCycle === 'yearly' ? details.yearlyPrice / 12 : details.price;

            return (
              <Card
                key={planType}
                className={`relative ${isSelected ? 'ring-2 ring-primary' : isCurrent ? 'border-green-500/30 bg-green-500/5' : ''}`}
              >
                {isCurrent && !isTrialPlan && (
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
                    {isEnterprise ? (
                      <span className="text-2xl font-black">Contact Sales</span>
                    ) : (
                      <>
                        <span className="text-2xl font-black">{formatPrice(price)}</span>
                        <span className="text-muted-foreground text-sm">/mo</span>
                        {billingCycle === 'yearly' && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatPrice(details.yearlyPrice)} billed yearly
                          </p>
                        )}
                      </>
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
                    variant={isCurrent && !isTrialPlan ? 'secondary' : isUpgrade || isTrialPlan ? 'default' : 'outline'}
                    disabled={isCurrent && !isTrialPlan}
                    onClick={() => handleUpgrade(planType)}
                  >
                    {isCurrent && !isTrialPlan
                      ? 'Current Plan'
                      : isEnterprise
                        ? 'Contact Sales'
                        : isUpgrade || isTrialPlan
                          ? `${isTrialPlan ? 'Subscribe to' : 'Upgrade to'} ${details.name}`
                          : 'Downgrade'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
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
