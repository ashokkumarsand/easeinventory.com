import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Management & Payroll Software | Attendance Tracking | EaseInventory',
  description: 'Track staff attendance, manage payroll, assign roles, and monitor performance. Complete HR solution for retail businesses in India.',
  keywords: ['staff management software', 'retail payroll software India', 'attendance tracking', 'employee management', 'role-based access retail'],
  openGraph: {
    title: 'Staff Management & Payroll | EaseInventory',
    description: 'Complete HR solution for retail—attendance, payroll, and performance tracking.',
    type: 'website',
  },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return children;
}
