import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Precision Inventory Management System | Track Stock in Real-Time | EaseInventory',
  description: 'Track every unit with serial numbers, barcodes, and batch tracking. Automated profit analysis, low stock alerts, and multi-location inventory management for Indian retail businesses.',
  keywords: ['inventory management', 'stock tracking', 'serial number tracking', 'barcode scanner', 'inventory software India', 'retail inventory', 'warehouse management'],
  openGraph: {
    title: 'Precision Inventory Management | EaseInventory',
    description: 'Real-time stock tracking with serial numbers, barcode scanning, and automated profit analysis.',
    type: 'website',
  },
};

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
