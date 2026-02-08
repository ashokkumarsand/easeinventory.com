import Footer from '@/components/landing/Footer';
import { ArrowLeft, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard Overview | Help Center | EaseInventory',
  description: 'Learn about the EaseInventory dashboard, stats overview, low stock alerts, revenue trends, and recent activity.',
};

export default function DashboardPage() {
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
            Dashboard <span className="text-primary italic">Overview</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
            Master your business metrics at a glance
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container-custom max-w-4xl mx-auto space-y-12">
          {/* Dashboard Introduction */}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Welcome to Your Dashboard
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              The EaseInventory dashboard is your command center for monitoring your business. It provides real-time insights into inventory levels, sales performance, and key operational metrics. When you log in, you'll see a comprehensive overview of your business health at a glance.
            </p>
            <p className="text-foreground/60 font-medium leading-relaxed">
              The dashboard is fully customizable - you can rearrange widgets, choose which metrics to display, and set your preferred time periods for analysis.
            </p>
          </div>

          {/* Key Dashboard Sections */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Key Dashboard Sections
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  Stats Overview
                </h3>
                <p className="text-foreground/60 font-medium leading-relaxed mb-4">
                  At the top of your dashboard, you'll find key performance indicators including:
                </p>
                <ul className="space-y-2 text-foreground/60 font-medium">
                  <li>• <strong>Total Revenue:</strong> Your cumulative sales for the selected period</li>
                  <li>• <strong>Orders:</strong> Number of sales orders created and completed</li>
                  <li>• <strong>Inventory Value:</strong> Total value of products in stock</li>
                  <li>• <strong>Gross Profit:</strong> Revenue minus cost of goods sold</li>
                  <li>• <strong>Inventory Turnover:</strong> How quickly your stock is moving</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-primary" />
                  Low Stock Alerts
                </h3>
                <p className="text-foreground/60 font-medium leading-relaxed mb-4">
                  The dashboard highlights products that are running low on inventory. This section shows:
                </p>
                <ul className="space-y-2 text-foreground/60 font-medium">
                  <li>• Products below their reorder point</li>
                  <li>• Items with zero stock</li>
                  <li>• Slow-moving inventory that ties up capital</li>
                  <li>• Seasonal products approaching peak demand</li>
                  <li>• Quick action buttons to create purchase orders</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  Revenue Trends
                </h3>
                <p className="text-foreground/60 font-medium leading-relaxed mb-4">
                  Visual charts display your sales performance over time:
                </p>
                <ul className="space-y-2 text-foreground/60 font-medium">
                  <li>• Daily, weekly, monthly, and yearly revenue trends</li>
                  <li>• Comparison with previous periods</li>
                  <li>• Top-selling products and categories</li>
                  <li>• Customer purchasing patterns</li>
                  <li>• Forecast predictions based on historical data</li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  Recent Activity
                </h3>
                <p className="text-foreground/60 font-medium leading-relaxed mb-4">
                  A feed of recent transactions and actions in your account:
                </p>
                <ul className="space-y-2 text-foreground/60 font-medium">
                  <li>• New orders created by team members</li>
                  <li>• Inventory adjustments and transfers</li>
                  <li>• Customer additions and modifications</li>
                  <li>• Invoices generated and sent</li>
                  <li>• Returns and refunds processed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Customizing Your Dashboard */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Customizing Your Dashboard
            </h2>
            <div className="space-y-4">
              <p className="text-foreground/60 font-medium leading-relaxed">
                Make your dashboard work exactly how you want it:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-foreground/60 font-medium">
                <li>Click the "Edit" button in the top right corner of your dashboard</li>
                <li>Drag and drop widgets to rearrange them</li>
                <li>Click the eye icon on a widget to hide or show it</li>
                <li>Click the settings icon to customize widget parameters</li>
                <li>Choose your preferred date range and time period</li>
                <li>Click "Save" when you're happy with your layout</li>
              </ol>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Date Range Selection
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              All dashboard metrics can be filtered by date range. Use the date picker at the top to:
            </p>
            <div className="space-y-3 text-foreground/60 font-medium">
              <div className="flex gap-3">
                <span className="font-bold text-primary">•</span>
                <span>Compare current month to previous month</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary">•</span>
                <span>View year-to-date performance</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary">•</span>
                <span>Analyze specific quarters or years</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary">•</span>
                <span>Set custom date ranges for detailed analysis</span>
              </div>
            </div>
          </div>

          {/* Dashboard Tips */}
          <div className="border-t border-foreground/5 pt-12 p-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-purple-500">
              Pro Tips for Dashboard Usage
            </h3>
            <ul className="space-y-2 text-foreground/60 font-medium text-sm">
              <li>• Check your dashboard daily to stay on top of business metrics</li>
              <li>• Set low stock alerts to prevent stockouts</li>
              <li>• Review revenue trends weekly to identify patterns</li>
              <li>• Use the dashboard insights to make informed business decisions</li>
              <li>• Share custom dashboard reports with your team for alignment</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
