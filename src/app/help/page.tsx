'use client';

import Footer from '@/components/landing/Footer';
import { Chip } from '@heroui/react';
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    FileText,
    HelpCircle,
    Package,
    Receipt,
    Settings,
    Truck,
    Users,
    Wrench
} from 'lucide-react';
import Link from 'next/link';

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Set up your account and learn the basics',
    icon: BookOpen,
    href: '/help/getting-started',
    articles: ['Account Setup', 'Dashboard Overview', 'First Invoice'],
  },
  {
    title: 'Inventory Management',
    description: 'Track products, stock, and locations',
    icon: Package,
    href: '/help/inventory',
    articles: ['Adding Products', 'Stock Tracking', 'Categories'],
  },
  {
    title: 'GST & Invoicing',
    description: 'Create compliant invoices and manage billing',
    icon: Receipt,
    href: '/help/invoicing',
    articles: ['GST Configuration', 'Invoice Templates', 'E-invoicing'],
  },
  {
    title: 'Repair Management',
    description: 'Handle service tickets and job cards',
    icon: Wrench,
    href: '/help/repairs',
    articles: ['Creating Tickets', 'Status Updates', 'Warranty Tracking'],
  },
  {
    title: 'Team & Permissions',
    description: 'Manage users, roles, and access',
    icon: Users,
    href: '/help/team',
    articles: ['Adding Users', 'Role Permissions', 'Activity Logs'],
  },
  {
    title: 'Reports & Analytics',
    description: 'Understand your business data',
    icon: BarChart3,
    href: '/help/reports',
    articles: ['Sales Reports', 'Stock Analysis', 'GST Returns'],
  },
];

const quickLinks = [
  { label: 'API Documentation', href: '/docs/api', icon: FileText },
  { label: 'System Status', href: 'https://status.easeinventory.com', icon: Settings },
  { label: 'Contact Support', href: 'mailto:support@easeinventory.com', icon: HelpCircle },
  { label: 'Shipping Guide', href: '/help/shipping', icon: Truck },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <HelpCircle size={28} className="text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
              Help <span className="text-primary italic">Center</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
              Everything you need to master EaseInventory
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full h-14 md:h-16 px-6 pr-12 rounded-full bg-foreground/5 border border-foreground/10 font-bold text-lg placeholder:text-foreground/30 focus:border-primary/50 focus:outline-none transition-colors"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="pb-20 md:pb-32">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category) => (
              <Link key={category.title} href={category.href}>
                <div className="h-full p-6 md:p-8 rounded-[2rem] bg-foreground/[0.02] border border-foreground/5 hover:border-primary/30 transition-all duration-300 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                      <category.icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight mb-1">
                        {category.title}
                      </h3>
                      <p className="text-sm font-bold text-foreground/50">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 pl-16">
                    {category.articles.map((article) => (
                      <li key={article} className="flex items-center gap-2 text-sm font-medium text-foreground/40">
                        <ArrowRight size={12} className="text-primary" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-20 md:pb-32">
        <div className="container-custom">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-center">
            Quick Links
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <Chip
                  startContent={<link.icon size={14} />}
                  variant="flat"
                  className="font-bold text-sm cursor-pointer hover:bg-primary/20 transition-colors px-4 py-2"
                >
                  {link.label}
                </Chip>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="pb-20 md:pb-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-[2.5rem] bg-primary/5 border border-primary/20">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
              Still Need Help?
            </h2>
            <p className="text-foreground/50 font-bold mb-6">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <Link
              href="mailto:support@easeinventory.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-black font-black uppercase text-sm tracking-wider rounded-full hover:bg-primary/90 transition-colors"
            >
              Contact Support
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
