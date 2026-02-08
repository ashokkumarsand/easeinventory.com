import Footer from '@/components/landing/Footer';
import { ArrowLeft, Smartphone, Share2, Zap, Globe } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mobile App Setup | Help Center | EaseInventory',
  description: 'Learn how to set up and use EaseInventory on mobile devices, PWA installation, responsive design, and mobile-optimized features.',
};

export default function MobilePage() {
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
            Mobile App <span className="text-primary italic">Setup</span>
          </h1>
          <p className="text-lg md:text-xl font-bold text-foreground/50 italic">
            Access EaseInventory on the go with full mobile support
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container-custom max-w-4xl mx-auto space-y-12">
          {/* Mobile Overview */}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Mobile Access
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              EaseInventory is fully responsive and optimized for mobile devices. Access your inventory, create orders, process returns, and manage your business from anywhere with our mobile-friendly web application.
            </p>
            <p className="text-foreground/60 font-medium leading-relaxed">
              There's no need to download a separate app - simply use your mobile browser to access easeinventory.com. For even faster access, you can add EaseInventory to your home screen as a Progressive Web App (PWA).
            </p>
          </div>

          {/* Browser Compatibility */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Smartphone size={28} className="text-primary" />
              Browser Compatibility
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              EaseInventory works on all modern mobile browsers:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">iOS</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Safari (iOS 13+), Chrome for iOS, Firefox for iOS, and other WebKit-based browsers
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Android</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Chrome for Android, Firefox for Android, Samsung Internet, and other Chromium-based browsers
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Tablets</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Full support for iPads and Android tablets with optimized layouts
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Desktop</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Also fully responsive on desktop browsers for the best experience
                </p>
              </div>
            </div>
          </div>

          {/* PWA Installation */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Share2 size={28} className="text-primary" />
              How to Install as PWA (App-like Experience)
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              Add EaseInventory to your home screen for quick access and an app-like experience:
            </p>

            <div className="space-y-8">
              {/* iPhone Instructions */}
              <div>
                <h3 className="text-lg font-bold mb-4 border-b border-foreground/10 pb-3">iOS (iPhone/iPad)</h3>
                <ol className="list-decimal list-inside space-y-3 text-foreground/60 font-medium">
                  <li>Open easeinventory.com in Safari</li>
                  <li>Tap the Share icon at the bottom of the screen</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Give it a name (e.g., "EaseInventory") and tap "Add"</li>
                  <li>The app will now appear on your home screen</li>
                  <li>Tap the icon to open EaseInventory in full-screen mode</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div>
                <h3 className="text-lg font-bold mb-4 border-b border-foreground/10 pb-3">Android</h3>
                <ol className="list-decimal list-inside space-y-3 text-foreground/60 font-medium">
                  <li>Open easeinventory.com in Chrome or your default browser</li>
                  <li>Tap the three-dot menu icon at the top right</li>
                  <li>Select "Install app" or "Add to Home screen"</li>
                  <li>Confirm when prompted</li>
                  <li>The app will be added to your home screen and app drawer</li>
                  <li>Tap to open EaseInventory as a standalone app</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Responsive Design */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Zap size={28} className="text-primary" />
              Mobile-Optimized Features
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              EaseInventory automatically adapts to your device screen size for the best experience:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-bold mb-1">Responsive Layouts</h4>
                  <p className="text-foreground/60 font-medium text-sm">
                    Menus collapse into hamburger navigation, tables become scrollable cards, and buttons resize appropriately for touch.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-bold mb-1">Touch-Friendly Interface</h4>
                  <p className="text-foreground/60 font-medium text-sm">
                    All buttons and form fields are sized for easy tapping. No hover states required - everything works with taps and swipes.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-bold mb-1">Offline Support</h4>
                  <p className="text-foreground/60 font-medium text-sm">
                    Some features work offline and sync when you reconnect. Your changes are automatically saved to the server.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-bold mb-1">Fast Loading</h4>
                  <p className="text-foreground/60 font-medium text-sm">
                    Optimized assets and caching ensure quick loading times even on slower mobile networks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Key Mobile Features
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              EaseInventory on mobile includes all the essential features you need to manage your business:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Create Orders</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Create sales orders and invoices on the go using simplified mobile forms
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">View Inventory</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Check stock levels, search products, and view product details instantly
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Quick Stats</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  View your dashboard with key metrics optimized for mobile viewing
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Notifications</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Receive push notifications for low stock, orders, and important events
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">QR Code Scanning</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Scan product barcodes using your device camera (iOS 15+, Android)
                </p>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <h4 className="font-bold mb-2">Print Documents</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Print invoices and reports directly from your mobile device
                </p>
              </div>
            </div>
          </div>

          {/* Screen Size Optimization */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Globe size={28} className="text-primary" />
              Screen Size Optimization
            </h2>
            <p className="text-foreground/60 font-medium leading-relaxed mb-6">
              EaseInventory detects your device and optimizes the interface accordingly:
            </p>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Small Phones (&lt; 375px)</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Minimal layout with stacked sections and single-column design
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Standard Phones (375px - 767px)</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Optimized single-column layout with readable text and touch-friendly controls
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Tablets (768px - 1024px)</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Two-column layouts with sidebar navigation for better space utilization
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Large Tablets &amp; Desktops (&gt; 1024px)</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Full-featured interface with all options visible and data grids with multiple columns
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Tips */}
          <div className="border-t border-foreground/5 pt-12 p-6 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-orange-500">
              Mobile Usage Tips
            </h3>
            <ul className="space-y-2 text-foreground/60 font-medium text-sm">
              <li>• Install as PWA for app-like experience and faster access</li>
              <li>• Enable notifications for low stock and order alerts</li>
              <li>• Use the simplified forms on mobile for faster data entry</li>
              <li>• Keep your browser updated for the best experience</li>
              <li>• Use mobile hotspot if WiFi is unavailable</li>
              <li>• Bookmark important pages for quick access</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="border-t border-foreground/5 pt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              Mobile Troubleshooting
            </h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-2">App Not Installing?</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Ensure you're using a modern browser (Chrome, Safari, Firefox). Some browsers may not support PWA installation.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Page Looks Broken?</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Try rotating your device, clearing browser cache, or closing and reopening the app.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Slow Performance?</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Check your internet connection, close unnecessary browser tabs, and restart the app.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Can't Login?</h4>
                <p className="text-foreground/60 font-medium text-sm">
                  Clear cookies and cache in your browser settings, or try using a different browser.
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
