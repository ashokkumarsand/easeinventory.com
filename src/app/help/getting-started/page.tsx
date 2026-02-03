import Footer from '@/components/landing/Footer';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Getting Started | Help Center | EaseInventory',
  description: 'Learn how to set up your EaseInventory account and start managing your business efficiently.',
};

const steps = [
  {
    title: 'Create Your Account',
    content: 'Visit easeinventory.com/register and enter your business details including GST number, business name, and contact information. Choose the plan that fits your needs - we offer a free tier for small businesses.',
  },
  {
    title: 'Verify Your Business',
    content: 'We automatically validate your GSTIN against government records. This ensures all your invoices are compliant from day one. You will receive an OTP on your registered mobile number for verification.',
  },
  {
    title: 'Add Your Products',
    content: 'Navigate to Inventory → Add Product. Enter product details including serial number, cost price, sale price, and category. You can also bulk import using a CSV file.',
  },
  {
    title: 'Create Your First Invoice',
    content: 'Go to Invoices → New Invoice. Select a customer (or add a new one), add products, apply discounts if needed, and generate your first GST-compliant invoice.',
  },
  {
    title: 'Invite Your Team',
    content: 'Navigate to Settings → Team. Add team members with appropriate roles (Admin, Manager, or Staff). Each role has different permissions to ensure data security.',
  },
];

const articles = [
  { title: 'Dashboard Overview', href: '/help/getting-started/dashboard' },
  { title: 'Account Settings', href: '/help/getting-started/settings' },
  { title: 'Billing & Plans', href: '/help/getting-started/billing' },
  { title: 'Mobile App Setup', href: '/help/getting-started/mobile' },
];

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="py-12 md:py-20 border-b border-foreground/5">
        <div className="container-custom max-w-4xl mx-auto">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-foreground/50 font-bold text-sm uppercase tracking-wider hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Help Center
          </Link>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Getting <span className="text-primary italic">Started</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
            Set up your EaseInventory account in 5 simple steps
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 md:py-20">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-black text-lg">
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-foreground/10 mx-auto mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                    {step.title}
                  </h3>
                  <p className="text-foreground/60 font-medium leading-relaxed">
                    {step.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Success Message */}
          <div className="mt-12 p-6 md:p-8 rounded-[2rem] bg-green-500/10 border border-green-500/20 flex items-start gap-4">
            <CheckCircle2 size={24} className="text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-green-500">
                You&apos;re All Set!
              </h4>
              <p className="text-foreground/60 font-medium">
                After completing these steps, you&apos;ll have a fully functional EaseInventory account ready to manage your business operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-12 md:py-20 border-t border-foreground/5">
        <div className="container-custom max-w-4xl mx-auto">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6">
            Related Articles
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Link key={article.title} href={article.href}>
                <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5 hover:border-primary/30 transition-colors flex items-center gap-3 group">
                  <FileText size={18} className="text-primary" />
                  <span className="font-bold flex-1">{article.title}</span>
                  <ArrowRight size={16} className="text-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
