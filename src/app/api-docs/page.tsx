'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, Copy } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const endpoints = [
  {
    category: 'Products',
    icon: '📦',
    routes: [
      { method: 'GET', path: '/api/products', description: 'List all products' },
      { method: 'POST', path: '/api/products', description: 'Create a product' },
      { method: 'GET', path: '/api/products/:id', description: 'Get product details' },
      { method: 'PUT', path: '/api/products/:id', description: 'Update a product' },
      { method: 'DELETE', path: '/api/products/:id', description: 'Delete a product' },
    ],
  },
  {
    category: 'Inventory',
    icon: '📊',
    routes: [
      { method: 'GET', path: '/api/inventory', description: 'Get stock levels' },
      { method: 'POST', path: '/api/inventory/adjust', description: 'Adjust stock' },
      { method: 'POST', path: '/api/inventory/transfers', description: 'Transfer stock' },
      { method: 'GET', path: '/api/inventory/low-stock', description: 'Low stock alerts' },
    ],
  },
  {
    category: 'Invoices',
    icon: '🧾',
    routes: [
      { method: 'GET', path: '/api/invoices', description: 'List all invoices' },
      { method: 'POST', path: '/api/invoices', description: 'Create an invoice' },
      { method: 'GET', path: '/api/invoices/:id', description: 'Get invoice details' },
      { method: 'GET', path: '/api/invoices/:id/pdf', description: 'Download invoice PDF' },
    ],
  },
  {
    category: 'Repairs',
    icon: '🔧',
    routes: [
      { method: 'GET', path: '/api/repairs', description: 'List all repair tickets' },
      { method: 'POST', path: '/api/repairs', description: 'Create a ticket' },
      { method: 'PUT', path: '/api/repairs/:id', description: 'Update ticket status' },
      { method: 'POST', path: '/api/repairs/:id/notify', description: 'Send notification' },
    ],
  },
];

const features = [
  { icon: '🔐', title: 'Authentication', description: 'OAuth 2.0 with API keys and bearer tokens' },
  { icon: '📄', title: 'Pagination', description: 'Cursor-based pagination for large datasets' },
  { icon: '🔍', title: 'Filtering', description: 'Rich query parameters for filtering results' },
  { icon: '🪝', title: 'Webhooks', description: 'Real-time event notifications to your server' },
  { icon: '⚡', title: 'Rate Limiting', description: '1000 requests/minute for standard plans' },
  { icon: '📊', title: 'Versioning', description: 'API versioning for backwards compatibility' },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET': return 'bg-success/10 text-success';
    case 'POST': return 'bg-primary/10 text-primary';
    case 'PUT': return 'bg-warning/10 text-warning';
    case 'DELETE': return 'bg-danger/10 text-danger';
    default: return 'bg-foreground/10 text-foreground';
  }
};

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">🔌</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">API Reference</span>
              </div>

              <h1 className="heading-lg mb-8">
                Build with <span className="text-secondary italic">EaseInventory API</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                Integrate EaseInventory with your existing systems. RESTful API with comprehensive
                documentation and code examples.
              </p>

              {/* Base URL */}
              <Card className="modern-card max-w-2xl mx-auto">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-2">Base URL</p>
                    <code className="text-lg font-mono text-secondary">https://api.easeinventory.com/v1</code>
                  </div>
                  <Button size="icon" variant="ghost" className="text-foreground/40">
                    <Copy size={20} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding relative">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="modern-card h-full group hover:border-secondary/30 transition-all duration-500">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="text-3xl">{feature.icon}</div>
                      <div>
                        <h3 className="font-black mb-1">{feature.title}</h3>
                        <p className="text-sm text-foreground/60 italic">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="section-padding bg-foreground/[0.02] relative">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Endpoints</span>
              </div>
              <h2 className="heading-lg mb-6">
                API <span className="text-primary italic">Reference</span>
              </h2>
            </motion.div>

            <div className="max-w-5xl mx-auto space-y-8">
              {endpoints.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 border-b border-foreground/5 flex items-center gap-4">
                        <div className="text-3xl">{category.icon}</div>
                        <h3 className="text-xl font-black uppercase tracking-tight">{category.category}</h3>
                      </div>
                      <div className="divide-y divide-foreground/5">
                        {category.routes.map((route) => (
                          <div key={route.path} className="p-6 flex items-center gap-6 hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                            <span className={`${getMethodColor(route.method)} text-xs font-black px-3 py-1 rounded-full w-20 text-center`}>
                              {route.method}
                            </span>
                            <code className="font-mono text-sm flex-1">{route.path}</code>
                            <span className="text-sm text-foreground/60 italic">{route.description}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <h2 className="heading-lg mb-6">
                Quick <span className="text-warning italic">Example</span>
              </h2>
            </motion.div>

            <Card className="modern-card max-w-4xl mx-auto overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-foreground/5 flex items-center justify-between">
                  <span className="text-sm font-black">JavaScript / Node.js</span>
                  <Button size="icon" variant="ghost" className="text-foreground/40 h-8 w-8">
                    <Copy size={16} />
                  </Button>
                </div>
                <pre className="p-6 overflow-x-auto text-sm">
                  <code className="text-foreground/80">{`const response = await fetch('https://api.easeinventory.com/v1/products', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const products = await response.json();
console.log(products);`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="modern-card bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent border-secondary/20 overflow-hidden">
                <CardContent className="p-12 lg:p-20 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-8">🔑</div>
                    <h2 className="heading-lg mb-6">
                      Ready to <span className="text-secondary italic">Integrate?</span>
                    </h2>
                    <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                      Get your API keys from the dashboard and start building.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button asChild size="lg" className="font-black px-12 h-16 shadow-xl shadow-secondary/30 uppercase tracking-widest rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        <Link href="/register">
                          Get API Keys
                          <ArrowRight size={20} className="ml-2" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10 rounded-full">
                        <Link href="/#contact">
                          Contact Support
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
