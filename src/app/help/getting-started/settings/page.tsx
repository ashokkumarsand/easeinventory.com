import Footer from '@/components/landing/Footer';
import { ArrowLeft, Shield, Building2, Users, CreditCard } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Account Settings | Help Center | EaseInventory',
  description: 'Learn how to manage your account settings, business info, payment details, currency settings, and team management in EaseInventory.',
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="py-12 md:py-20 border-b border-foreground/5">
        <div className="container-custom max-w-4xl mx-auto">
          <Link
            href="/help/getting-started"
            className="inline-flex items-center gap-2 text-foreground/50 font-bold text-sm uppercase tracking-wider hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Getting Started
          </Link>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Account <span className="text-primary italic">Settings</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
            Manage your profile, business details, and team access
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container-custom max-w-4xl mx-auto space-y-12">
          {/* Settings Overview */}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Settings Overview
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              The Settings section in EaseInventory allows you to customize your account, manage your business information, configure payment methods, and control team access. All settings are organized into intuitive tabs for easy navigation.
            </p>
            <p className="text-foreground/60 font-medium leading-relaxed">
              Access Settings by clicking the Settings icon in your dashboard sidebar, or by clicking your profile avatar and selecting "Settings."
            </p>
          </div>

          {/* Profile Settings */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Shield size={28} className="text-primary" />
              Profile Settings
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Manage your personal account information:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Personal Information</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Update your name, email address, phone number, and profile picture. Your email is used for login and notifications.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Password & Security</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Change your password regularly to keep your account secure. Enable two-factor authentication (2FA) for additional security.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Login Preferences</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Choose whether to log in with email/password or Google OAuth. Update your default workspace on login.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Notification Preferences</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Control which emails you receive - low stock alerts, invoice reminders, billing notifications, and team updates.
                </p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Building2 size={28} className="text-primary" />
              Business Information
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Configure your business details and compliance information:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Business Details</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Update your company name, GST number (GSTIN), business address, phone, and email. These details appear on all invoices.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Business Branding</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Upload your company logo and customize the branding on invoices and documents. Set your company tagline and description.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Banking Details</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Add your bank account details for COD collections and refund processing. This is required for certain payment methods.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">HSN & Tax Settings</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Configure your default HSN code, tax classification, and GST registration type (Regular/Composition).
                </p>
              </div>
            </div>
          </div>

          {/* Currency & Localization */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Currency & Localization
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Customize how EaseInventory displays information for your region:
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Currency</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Select your primary currency (INR, USD, EUR, etc.) for all transactions and reporting.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Language</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Choose from English, Hindi, Arabic, or Portuguese for the interface.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Date Format</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Choose your preferred date format (DD-MM-YYYY, MM-DD-YYYY, or YYYY-MM-DD).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Time Zone</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Set your time zone for accurate reporting and scheduled tasks.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <CreditCard size={28} className="text-primary" />
              Payment & Billing
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Manage your payment methods and billing preferences:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Payment Methods</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Add and manage credit cards, debit cards, and UPI accounts for subscription billing.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Billing Address</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Update your billing address for invoices and receipts.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Billing History</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  View all past invoices and receipts. Download or resend receipts to your email.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Subscription Plan</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  View your current plan, upgrade to a higher tier, or downgrade. See your renewal date and next billing amount.
                </p>
              </div>
            </div>
          </div>

          {/* Team Management */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Users size={28} className="text-primary" />
              Team Management
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Invite and manage team members with role-based access control:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Invite Team Members</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Click "Invite User" to add team members. Enter their email address and select their role.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">User Roles</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Assign roles to control what team members can do: Owner (full access), Manager (most features), Accountant (accounting only), Technician (repair module), Sales Staff (sales module), and Viewer (read-only).
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Manage Users</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  View all active users, their roles, and last login. Update roles, resend invitations, or deactivate users.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Permissions</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Each role has specific permissions. You can customize role permissions for your business needs.
                </p>
              </div>
            </div>
          </div>

          {/* API & Integrations */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              API & Integrations
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Available on Business and Enterprise plans:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">API Keys</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Generate and manage API keys for programmatic access to your EaseInventory data.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Webhooks</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Set up webhooks to receive notifications when important events occur in your account.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Third-party Integrations</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Connect with other business tools like accounting software, CRM systems, and shipping providers.
                </p>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Data & Privacy
            </h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Export Data</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Download all your business data in CSV or Excel format for backup or analysis.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Account Deletion</h4>
                <p className="text-foreground/60 font-medium text-sm mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Privacy Policy</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Review our privacy policy and data handling practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
