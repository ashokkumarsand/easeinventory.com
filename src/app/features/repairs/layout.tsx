import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Repair & Service Management Software | Ticket Tracking System | EaseInventory',
  description: 'Complete repair ticketing system for mobile, electronics, and appliance service centers. Track repairs, manage technicians, auto-notify customers via WhatsApp.',
  keywords: ['repair management software', 'service center software', 'repair ticketing system', 'mobile repair software India', 'electronics repair tracking', 'technician management'],
  openGraph: {
    title: 'Repair & Service Management | EaseInventory',
    description: 'Track repairs, manage technicians, and notify customers automatically.',
    type: 'website',
  },
};

export default function RepairsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
