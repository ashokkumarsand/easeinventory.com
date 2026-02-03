import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GST Billing & Invoicing Software India | E-Invoicing | EaseInventory',
  description: 'Generate GST-compliant invoices in seconds. HSN code mapping, multiple tax rates, e-invoicing, thermal printing, and GSTR-1 export for Indian businesses.',
  keywords: ['GST billing software', 'GST invoice software India', 'e-invoicing software', 'retail billing software', 'HSN code invoice', 'GSTR-1 export', 'thermal billing'],
  openGraph: {
    title: 'GST Billing & Invoicing | EaseInventory',
    description: 'Generate GST-compliant invoices in seconds with automatic tax calculations.',
    type: 'website',
  },
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
