import Footer from '@/components/landing/Footer';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Billing & Plans | Help Center | EaseInventory',
  description: 'Learn about EaseInventory subscription plans, upgrade options, payment methods, and billing cycles.',
};

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="py-12 md:py-20 border-b border-foreground/5">
        <div className="container-custom max-w-4xl mx-auto">
          <Link
            href="/help/getting-started"
            className="inline-flex items-center gap-2 text-foreground/50 font-bold text-sm uppercase tracking-wider hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Getting Started
          </Link>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Billing & <span className="text-primary italic">Plans</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
            Understand your subscription, upgrade options, and payment methods
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container-custom max-w-4xl mx-auto space-y-12">
          {/* Plans Overview */}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Our Subscription Plans
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Free Plan</h3>
                <p className="text-foreground/60 font-medium mb-4">
                  Perfect for getting started with basic inventory management. Includes limited users, basic reports, and GST compliance features.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Up to 100 products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">1 user account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Basic reports</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-primary">Starter Plan</h3>
                <p className="text-foreground/60 font-medium mb-4">
                  Great for small businesses. Includes unlimited products, multiple users, and advanced inventory features.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Unlimited products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Up to 5 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Advanced analytics</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Business Plan</h3>
                <p className="text-foreground/60 font-medium mb-4">
                  Ideal for growing businesses. Includes multi-location support, custom reports, and supplier management.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Unlimited everything</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Up to 20 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Multi-location support</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">Enterprise Plan</h3>
                <p className="text-foreground/60 font-medium mb-4">
                  For large enterprises. Includes dedicated support, API access, custom integrations, and unlimited everything.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Unlimited users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm font-medium">API access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Upgrade */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              How to Upgrade Your Plan
            </h2>
            <div className="space-y-4">
              <p className="text-foreground/60 font-medium leading-relaxed">
                Upgrading your EaseInventory plan is simple and takes just a few minutes. Here's how to do it:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-foreground/60 font-medium">
                <li>Log in to your EaseInventory account and go to Settings → Billing</li>
                <li>Review the available plans and click "Upgrade" on your desired plan</li>
                <li>Review the billing details and confirm your upgrade</li>
                <li>You'll be redirected to payment processing</li>
                <li>Your plan upgrade will be active immediately after successful payment</li>
              </ol>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Accepted Payment Methods
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="font-bold text-lg mb-3">Razorpay</h3>
                <p className="text-foreground/60 font-medium text-sm leading-relaxed">
                  We accept payments via Razorpay, supporting all major credit cards, debit cards, and digital wallets including Google Pay and PhonePe.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="font-bold text-lg mb-3">UPI</h3>
                <p className="text-foreground/60 font-medium text-sm leading-relaxed">
                  Direct UPI payments are supported for fast and secure transactions. Simply scan the QR code or enter your UPI ID.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="font-bold text-lg mb-3">Bank Transfer</h3>
                <p className="text-foreground/60 font-medium text-sm leading-relaxed">
                  For Enterprise plans, we offer direct bank transfer options. Contact our sales team for more details.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
                <h3 className="font-bold text-lg mb-3">Invoice & Net Terms</h3>
                <p className="text-foreground/60 font-medium text-sm leading-relaxed">
                  Enterprise customers can request invoices with NET 30 payment terms for simplified accounting.
                </p>
              </div>
            </div>
          </div>

          {/* Billing Cycles */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Billing Cycles
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              EaseInventory offers flexible billing options to suit your business needs:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold mb-1">Monthly Billing</h4>
                  <p className="text-foreground/60 font-medium text-sm">
                    Pay month-to-month with full flexibility. You can upgrade, downgrade, or cancel anytime.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold mb-1">Annual Billing</h4>
                  <p className="text-foreground/60 font-medium text-sm">
                    Save 20% with annual plans. Enjoy uninterrupted service with yearly commitment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices & Receipts */}
          <div className="border-t border-foreground/5 pt-12">
            <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4">
              <AlertCircle size={24} className="text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-blue-500">
                  Digital Receipts & Invoices
                </h4>
                <p className="text-foreground/60 font-medium">
                  All billing receipts and invoices are sent to your registered email address. You can also download them anytime from Settings → Billing History.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
