'use client';

import FeaturePageTemplate, {
  type FeaturePageConfig,
} from '@/components/features/FeaturePageTemplate';
import {
  Building2,
  KeyRound,
  Palette,
  Network,
  Fingerprint,
  Webhook,
  Shield,
  FileCheck,
  Clock,
  Headphones,
  Scale,
  Server,
} from 'lucide-react';

const config: FeaturePageConfig = {
  badge: 'Enterprise Suite',
  hero: {
    title: (
      <>
        Enterprise-Grade.
        <br />
        <span className="gradient-text italic">Built for Scale.</span>
      </>
    ),
    subtitle:
      'API access, SSO, white label branding, multi-echelon optimization, lot genealogy, fleet management and SLA management — for businesses that demand more.',
    trustItems: ['99.9% SLA', 'Dedicated support', 'Custom onboarding'],
  },
  stats: [
    { value: '99.9%', label: 'Uptime SLA', icon: Shield },
    { value: '24/7', label: 'Priority Support', icon: Headphones },
    { value: '100%', label: 'White Label', icon: Palette },
    { value: '<1s', label: 'API Response', icon: Server },
  ],
  coreFeatures: [
    {
      icon: Webhook,
      title: 'API Access & Webhooks',
      tag: 'Integration',
      description:
        'Full REST API with authentication, rate limiting and real-time webhooks. Integrate EaseInventory with your ERP, CRM or custom systems.',
      highlights: [
        'RESTful endpoints',
        'API key auth',
        'Rate limiting',
        'Real-time webhooks',
      ],
    },
    {
      icon: KeyRound,
      title: 'SSO & Advanced Auth',
      tag: 'Security',
      description:
        'Single Sign-On via SAML/OAuth, multi-factor authentication and IP whitelisting for enterprise-grade access control.',
      highlights: [
        'SAML / OAuth SSO',
        'MFA support',
        'IP whitelisting',
        'Session management',
      ],
    },
    {
      icon: Palette,
      title: 'White Label Branding',
      tag: 'Branding',
      description:
        'Remove EaseInventory branding entirely. Use your own logo, colors, domain and email templates for a fully branded experience.',
      highlights: [
        'Custom domain',
        'Your logo & colors',
        'Branded emails',
        'Custom login page',
      ],
    },
    {
      icon: Network,
      title: 'Multi-Echelon Optimization',
      tag: 'Advanced',
      description:
        'Optimize inventory across multiple supply chain tiers — from raw materials to distribution centers to retail locations.',
      highlights: [
        'Multi-tier modeling',
        'Echelon safety stock',
        'Network optimization',
        'Scenario planning',
      ],
    },
  ],
  steps: [
    {
      number: '01',
      label: 'Step 1',
      title: 'Contact Sales',
      description:
        'Talk to our enterprise team about your requirements. We will design a tailored solution for your business.',
      icon: Headphones,
    },
    {
      number: '02',
      label: 'Step 2',
      title: 'Custom Setup',
      description:
        'Our team handles SSO integration, white label configuration, API setup and data migration.',
      icon: Scale,
    },
    {
      number: '03',
      label: 'Step 3',
      title: 'Go Live with Support',
      description:
        'Launch with dedicated onboarding, training sessions and 24/7 priority support from day one.',
      icon: Shield,
    },
  ],
  extraFeatures: [
    {
      icon: Fingerprint,
      title: 'Lot Genealogy',
      description: 'Full traceability from raw material to finished product with lot tracking.',
    },
    {
      icon: Clock,
      title: 'SLA Management',
      description: 'Define and monitor service level agreements with automated escalations.',
    },
    {
      icon: FileCheck,
      title: 'Compliance & Audit',
      description: 'SOC 2 readiness, audit trails and data residency controls.',
    },
    {
      icon: Server,
      title: 'Dedicated Infrastructure',
      description: 'Optional dedicated tenancy with isolated databases and compute.',
    },
    {
      icon: Headphones,
      title: 'Priority 24/7 Support',
      description: 'Dedicated account manager with guaranteed response times.',
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Data encryption at rest and in transit, penetration testing and DLP.',
    },
  ],
  faqs: [
    {
      question: 'What is multi-echelon optimization?',
      answer:
        'Multi-echelon optimization considers your entire supply chain network (suppliers, warehouses, stores) and optimizes inventory levels at each tier to minimize total cost while meeting service levels.',
    },
    {
      question: 'Can I fully white label the platform?',
      answer:
        'Yes. Enterprise customers can use their own domain, logo, brand colors, email templates and login page. End users will see your brand, not EaseInventory.',
    },
    {
      question: 'What does lot genealogy cover?',
      answer:
        'Lot genealogy tracks the full lifecycle of a batch — from raw material source through manufacturing, assembly and distribution — enabling complete forward and backward traceability.',
    },
    {
      question: 'How does the SLA work?',
      answer:
        'Enterprise plans include a 99.9% uptime SLA with financial credits for downtime. You also get 24/7 priority support with guaranteed response times.',
    },
  ],
  cta: {
    icon: Building2,
    title: (
      <>
        Ready for{' '}
        <span className="gradient-text">Enterprise Scale</span>?
      </>
    ),
    subtitle:
      'Get a custom plan with dedicated support, advanced security and unlimited capacity.',
  },
};

export default function EnterprisePage() {
  return <FeaturePageTemplate config={config} />;
}
