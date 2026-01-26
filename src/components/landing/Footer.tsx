import { Logo } from '@/components/icons/Logo';
import Link from 'next/link';
import React from 'react';

const footerLinks = {
  product: [
    { label: 'Capabilities', href: '#features' },
    { label: 'Investment', href: '#pricing' },
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
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030407] text-white pt-32 pb-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-12 gap-y-20 mb-32">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-10">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                <Logo size={40} />
              </div>
              <span className="text-3xl font-black tracking-tighter uppercase">
                Ease<span className="text-primary italic">Inventory</span>
              </span>
            </Link>
            <p className="text-white/60 text-xl font-medium leading-relaxed max-w-sm italic">
              Empowering India&apos;s retail revolution with the world&apos;s most precise inventory & service engine.
            </p>
            <div className="flex flex-col gap-6 pt-4 border-l-2 border-primary/20 pl-6">
                <div>
                   <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary mb-2 block">Connect directly</span>
                   <a href="mailto:contact@easeinventory.com" className="text-lg font-bold hover:text-primary transition-colors block text-white/90">contact@easeinventory.com</a>
                </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-3 py-1 border border-white/10 rounded-full inline-block">Product</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-white transition-colors font-bold text-base hover:translate-x-2 inline-block duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-3 py-1 border border-white/10 rounded-full inline-block">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-white transition-colors font-bold text-base hover:translate-x-2 inline-block duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-3 py-1 border border-white/10 rounded-full inline-block">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-white transition-colors font-bold text-base hover:translate-x-2 inline-block duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 px-3 py-1 border border-white/10 rounded-full inline-block">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 hover:text-white transition-colors font-bold text-base hover:translate-x-2 inline-block duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-16 border-t border-white/5 gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
             <div className="flex items-center gap-4">
                <span className="text-white/40 text-xs font-black uppercase tracking-widest">
                   © 2026 EaseInventory Technologies Private Limited.
                </span>
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span className="text-white/60 text-xs font-black italic">Made with 🇮🇳 pride.</span>
             </div>
             <p className="text-white/15 text-[10px] font-medium tracking-tight">
                All rights reserved. Secure Cloud Hosting by AWS Mumbai (ap-south-1).
             </p>
          </div>
          <div className="flex gap-8">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-white/20 hover:text-primary transition-all duration-500 hover:scale-125"
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
