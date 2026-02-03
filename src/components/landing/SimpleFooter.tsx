import { Logo } from '@/components/icons/Logo';
import Link from 'next/link';
import React from 'react';

/**
 * A simplified footer component that works in Server Components
 * without requiring any client-side React context.
 */
const SimpleFooter: React.FC = () => {
  return (
    <footer className="bg-background border-t border-foreground/5 text-foreground pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="p-2 bg-foreground/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Logo size={32} />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase text-foreground">
                <span className="italic">Ease</span><span className="text-primary italic">Inventory</span>
              </span>
            </Link>
            <p className="text-foreground/50 text-sm font-medium leading-relaxed">
              India&apos;s most intuitive inventory and service management platform.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground/30">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Features</Link></li>
              <li><Link href="/#pricing" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Pricing</Link></li>
              <li><Link href="/blog" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Blog</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground/30">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Help Center</Link></li>
              <li><Link href="/help/getting-started" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Getting Started</Link></li>
              <li><a href="mailto:support@easeinventory.com" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground/30">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-foreground/50 hover:text-primary transition-colors text-sm font-medium">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/30 text-xs font-medium">
            © 2026 EaseInventory Technologies Private Limited. All rights reserved.
          </p>
          <p className="text-foreground/20 text-xs font-medium">
            Made with 🇮🇳 pride.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
