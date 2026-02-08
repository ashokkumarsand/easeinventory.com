'use client';

import { Logo } from '@/components/icons/Logo';
import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const footerLinks = {
  product: [
    { label: 'Capabilities', href: '/#features' },
    { label: 'Investment', href: '/#pricing' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Changelog', href: '/changelog' },
  ],
  company: [
    { label: 'Our Mission', href: '/about' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Contact', href: '/contact' },
    { label: 'Experts', href: '/careers' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'Knowledge Base', href: '/help' },
    { label: 'API Reference', href: '/api-docs' },
    { label: 'System Status', href: '/status' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com/easeinventory', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/easeinventory', icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com/easeinventory', icon: Github },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-foreground/5 bg-[hsl(var(--background-secondary,var(--background)))]">
      <div className="container-custom pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 pb-12 border-b border-foreground/5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Logo size={28} />
              </div>
              <span className="text-xl font-black tracking-tight">
                <span className="italic text-foreground">Ease</span>
                <span className="text-primary italic">Inventory</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Empowering India&apos;s retail revolution with the world&apos;s most precise
              inventory &amp; service engine.
            </p>

            {/* Contact */}
            <div className="space-y-2">
              <a
                href="mailto:contact@easeinventory.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@easeinventory.com
              </a>
              <a
                href="tel:+919411436666"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 94114 36666
              </a>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                GH2, Mahalunge, Pune 411045
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/5 text-xs font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                No Keys Required
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/5 text-xs font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Free Forever Plan
              </span>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-muted-foreground">
            <span>&copy; 2026 EaseInventory Technologies Pvt Ltd</span>
            <span className="hidden sm:inline">&middot;</span>
            <span>Made with pride in India. Hosted on AWS Mumbai.</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary bg-foreground/[0.03] border border-foreground/5 hover:border-primary/20 transition-all"
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
