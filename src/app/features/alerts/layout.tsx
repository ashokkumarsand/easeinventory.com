import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Alerts & Notifications | Low Stock WhatsApp Alerts | EaseInventory',
  description: 'Automated notifications for low stock, repair updates, supplier reminders via WhatsApp, Email, and SMS. Never miss critical business events.',
  keywords: ['inventory alerts', 'low stock notification', 'WhatsApp business alerts', 'automated notifications retail', 'stock alert software India'],
  openGraph: {
    title: 'Smart Alerts & Notifications | EaseInventory',
    description: 'Automated WhatsApp, Email, and SMS alerts for your retail business.',
    type: 'website',
  },
};

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
