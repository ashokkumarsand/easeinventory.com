import { Logo } from '@/components/icons/Logo';
import Link from 'next/link';
import React from 'react';

const footerLinks = {
  product: [
    { label: 'Capabilities', href: '#features' }, // instead of Features
    { label: 'Investment', href: '#pricing' }, // instead of Pricing
    { label: 'Integrations', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  company: [
    { label: 'Our Mission', href: '#' },
    { label: 'Press Kit', href: '#' },
    { label: 'Contact Experts', href: '#contact' },
  ],
  support: [
    { label: 'Knowledge Base', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'System Status', href: '#' },
  ],
  legal: [
    { label: 'Privacy Protocol', href: '#' },
    { label: 'Terms of Growth', href: '#' },
  ],
};

const socialLinks = [
  {
    label: 'X (Twitter)',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white border-t border-white/5">
      <div className="container-custom py-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-16 mb-20">
          {/* Brand Column */}
          <div className="col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4">
              <Logo size={48} />
              <span className="text-2xl font-black tracking-tight uppercase">
                Ease<span className="text-primary italic">Inventory</span>
              </span>
            </Link>
            <p className="text-white/40 text-lg leading-relaxed max-w-sm">
              The premium operating system for modern retail and service empires in India.
            </p>
            <div className="space-y-4">
               <div className="flex flex-col gap-2">
                 <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Strategic Support</span>
                 <a href="mailto:contact@easeinventory.com" className="text-white/80 font-bold hover:text-primary transition-colors">contact@easeinventory.com</a>
               </div>
               <div className="flex flex-col gap-2">
                 <span className="text-[10px] uppercase tracking-widest font-black opacity-30">Sales & Growth</span>
                 <a href="mailto:sales@easeinventory.com" className="text-white/80 font-bold hover:text-primary transition-colors">sales@easeinventory.com</a>
               </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">The Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-primary transition-colors font-bold text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Trust & Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-primary transition-colors font-bold text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-primary transition-colors font-bold text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-primary transition-colors font-bold text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
             <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
                © 2026 EaseInventory Technologies Private Limited.
             </p>
             <p className="text-white/10 text-[10px] font-medium">
                Engineered with precision for the Indian market.
             </p>
          </div>
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-white/30 hover:text-primary transition-all duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
