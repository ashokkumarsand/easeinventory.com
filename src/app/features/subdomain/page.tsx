'use client';

import FeaturePageTemplate, { FeaturePageConfig } from '@/components/features/FeaturePageTemplate';
import {
  Gift,
  Globe,
  Image,
  Lock,
  Palette,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Tag,
  Upload,
  Zap,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Branding & Identity',
  hero: {
    title: (
      <>
        Your Business.<br />
        <span className="gradient-text italic">Your Identity.</span>
      </>
    ),
    subtitle:
      'Claim your unique .easeinventory.com URL. Add your logo, choose your colors, and create a professional presence that customers remember.',
    trustItems: ['Free with all plans', 'SSL included', 'Setup in 2 minutes'],
  },
  stats: [
    { value: 'Free', label: 'Subdomain Included', icon: Gift },
    { value: 'SSL', label: 'Auto-Provisioned', icon: Lock },
    { value: '2min', label: 'Setup Time', icon: Zap },
    { value: '100%', label: 'Uptime Guaranteed', icon: Shield },
  ],
  coreFeatures: [
    {
      icon: Globe,
      title: 'Free Subdomain',
      tag: 'Essential',
      description:
        'Get your own yourstore.easeinventory.com URL. Claim it during signup—first come, first served.',
      highlights: ['Unique business URL', 'Easy to remember', 'Marketing ready', 'Instant activation'],
    },
    {
      icon: Image,
      title: 'Custom Logo & Favicon',
      tag: 'Brand',
      description:
        'Upload your business logo. It appears on your storefront, invoices, and customer-facing pages.',
      highlights: ['Dashboard branding', 'Invoice headers', 'Custom favicon', 'High-res support'],
    },
    {
      icon: Palette,
      title: 'Brand Colors',
      tag: 'Style',
      description:
        'Choose your primary color to match your brand. Dashboard, buttons, and accents update automatically.',
      highlights: ['Color picker', 'Preset palettes', 'Dark mode ready', 'Consistent theming'],
    },
    {
      icon: Sparkles,
      title: 'Custom Domain',
      tag: 'Pro',
      description:
        'Connect your own domain like inventory.yourbusiness.com via CNAME. Free SSL included.',
      highlights: ['CNAME setup', 'Free SSL certificate', 'SEO friendly', 'Professional look'],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'CLAIM SUBDOMAIN',
      title: 'Claim Subdomain',
      description: 'During registration, enter your preferred subdomain. We check availability instantly.',
      icon: Search,
    },
    {
      number: '02',
      label: 'UPLOAD BRANDING',
      title: 'Upload Branding',
      description: 'Go to Settings → Branding. Upload your logo (PNG or JPG, recommended 200x200px).',
      icon: Upload,
    },
    {
      number: '03',
      label: 'GO LIVE',
      title: 'Go Live',
      description: 'Your branded URL is live. Share it on business cards, social media, and marketing.',
      icon: Rocket,
    },
  ],
  extraFeatures: [
    { icon: Lock, title: 'SSL Certificate', description: 'Free SSL auto-provisioned for all subdomains and custom domains.' },
    { icon: Globe, title: 'Custom Domain', description: 'Connect your own domain via CNAME (Professional plan).' },
    { icon: Palette, title: 'Theme Colors', description: 'Match your brand with custom primary and accent colors.' },
    { icon: Image, title: 'Logo Upload', description: 'Your logo on dashboard, invoices, and customer pages.' },
    { icon: Tag, title: 'White Label', description: 'Remove EaseInventory branding completely (add-on).' },
    { icon: Zap, title: 'Fast CDN', description: 'Global CDN ensures fast loading worldwide.' },
  ],
  faqs: [
    {
      question: 'Can I change my subdomain later?',
      answer: 'Yes, you can change your subdomain once per month via Settings → Domains. Update your marketing materials first.',
    },
    {
      question: 'Is the subdomain included in the free trial?',
      answer: 'Yes! Claim your subdomain during signup and it remains yours throughout the trial and beyond.',
    },
    {
      question: 'How do I set up a custom domain?',
      answer: 'Add a CNAME record at your registrar pointing to custom.easeinventory.com, then enter your domain in our dashboard.',
    },
    {
      question: 'What is white-label branding?',
      answer: 'White-label removes all EaseInventory branding. Your clients see only your company name and logo.',
    },
  ],
  cta: {
    icon: Globe,
    title: (
      <>
        Claim Your <span className="gradient-text">Subdomain</span> Now
      </>
    ),
    subtitle: "Good subdomains are going fast. Secure yours today—it's free with your account.",
  },
};

export default function SubdomainPage() {
  return <FeaturePageTemplate config={config} />;
}
