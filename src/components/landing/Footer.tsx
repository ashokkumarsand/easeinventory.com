'use client';

import { Logo } from '@/components/icons/Logo';
import WaveBackground from '@/components/landing/WaveBackground';
import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Changelog', href: '/changelog' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'API Docs', href: '/api-docs' },
    { label: 'System Status', href: '/status' },
    { label: 'Blog', href: '/blog' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refund' },
  ],
};

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com/easeinventory', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/easeinventory', icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com/easeinventory', icon: Github },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden w-full">
      {/* Wave Background */}
      <WaveBackground variant="minimal" fadeTop />

      <div className="container-custom relative z-10 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 pb-12 border-b border-foreground/5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Logo size={28} />
              </div>
              <span className="text-xl font-black tracking-tight">
                <span className="italic text-foreground">Ease</span>
                <span className="text-primary italic">Inventory</span>
              </span>
            </Link>
            <p className="text-foreground/60 text-sm leading-relaxed max-w-xs">
              Empowering India&apos;s retail revolution with modern inventory
              management, GST invoicing, and repair tracking.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:contact@easeinventory.com"
                className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@easeinventory.com
              </a>
              <a
                href="tel:+919411436666"
                className="flex items-center gap-2 text-sm text-foreground/60 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 94114 36666
              </a>
              <p className="flex items-start gap-2 text-sm text-foreground/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>GH2, Mahalunge, Pune 411045</span>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground/50 hover:text-primary transition-all dark:hover:shadow-[0_0_20px_rgba(132,204,22,0.15)]"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-foreground/40">
            <span>© 2026 EaseInventory Technologies Pvt. Ltd.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <span className="text-red-500">❤</span> in India 🇮🇳
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-foreground/40">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
