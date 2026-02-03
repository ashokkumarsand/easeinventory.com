'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const services = [
  { name: 'Web Application', status: 'operational', uptime: '99.99%' },
  { name: 'API Services', status: 'operational', uptime: '99.98%' },
  { name: 'Database Cluster', status: 'operational', uptime: '99.99%' },
  { name: 'WhatsApp Integration', status: 'operational', uptime: '99.95%' },
  { name: 'Payment Gateway', status: 'operational', uptime: '99.99%' },
  { name: 'File Storage (S3)', status: 'operational', uptime: '99.99%' },
];

const incidents = [
  {
    date: 'Jan 28, 2026',
    title: 'Scheduled Maintenance',
    status: 'Completed',
    description: 'Database optimization and security updates. No service interruption.',
    type: 'maintenance',
  },
  {
    date: 'Jan 15, 2026',
    title: 'API Latency Issue',
    status: 'Resolved',
    description: 'Brief period of increased latency on product API endpoints. Resolved within 15 minutes.',
    type: 'incident',
  },
  {
    date: 'Jan 5, 2026',
    title: 'Infrastructure Upgrade',
    status: 'Completed',
    description: 'Migrated to new server infrastructure for improved performance.',
    type: 'maintenance',
  },
];

const metrics = [
  { label: 'Current Uptime', value: '99.97%', icon: '⬆️' },
  { label: 'Last 30 Days', value: '99.95%', icon: '📅' },
  { label: 'Response Time', value: '145ms', icon: '⚡' },
  { label: 'Active Users', value: '2,847', icon: '👥' },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'operational':
      return { bg: 'bg-success', text: 'Operational', dot: 'bg-success' };
    case 'degraded':
      return { bg: 'bg-warning', text: 'Degraded', dot: 'bg-warning' };
    case 'outage':
      return { bg: 'bg-danger', text: 'Outage', dot: 'bg-danger' };
    default:
      return { bg: 'bg-foreground/20', text: 'Unknown', dot: 'bg-foreground/20' };
  }
};

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-success/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-success/10 border border-success/20 px-5 py-2 rounded-full mb-8">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-success">System Status</span>
              </div>

              <h1 className="heading-lg mb-8">
                {allOperational ? (
                  <>All Systems <span className="text-success italic">Operational</span></>
                ) : (
                  <>System Status <span className="text-warning italic">Check</span></>
                )}
              </h1>

              <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                Real-time status of EaseInventory services. We monitor 24/7 to ensure
                maximum uptime for your business.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Metrics */}
        <section className="section-padding relative">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card group hover:scale-105 transition-transform duration-500">
                    <CardBody className="p-8 text-center">
                      <div className="text-4xl mb-4">{metric.icon}</div>
                      <div className="text-4xl font-black text-success mb-2">{metric.value}</div>
                      <div className="text-sm font-bold text-foreground/50">{metric.label}</div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section-padding bg-foreground/[0.02] relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <h2 className="heading-lg mb-6">
                Service <span className="text-primary italic">Status</span>
              </h2>
            </motion.div>

            <Card className="modern-card max-w-4xl mx-auto overflow-hidden">
              <CardBody className="p-0 divide-y divide-foreground/5">
                {services.map((service, index) => {
                  const styles = getStatusStyles(service.status);
                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${styles.dot} animate-pulse`} />
                        <span className="font-bold">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-foreground/40">Uptime: {service.uptime}</span>
                        <span className={`text-xs font-black ${styles.bg === 'bg-success' ? 'text-success' : styles.bg === 'bg-warning' ? 'text-warning' : 'text-danger'}`}>
                          {styles.text}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Incidents */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Recent Activity</span>
              </div>
              <h2 className="heading-lg mb-6">
                Incident <span className="text-secondary italic">History</span>
              </h2>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-6">
              {incidents.map((incident, index) => (
                <motion.div
                  key={incident.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card">
                    <CardBody className="p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <span className={`text-xs font-black px-3 py-1 rounded-full ${
                            incident.type === 'maintenance' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                          }`}>
                            {incident.type === 'maintenance' ? 'Maintenance' : 'Incident'}
                          </span>
                          <h3 className="font-black">{incident.title}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-foreground/40">{incident.date}</span>
                          <span className="text-xs font-black text-success bg-success/10 px-3 py-1 rounded-full">
                            {incident.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-foreground/60 italic">{incident.description}</p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscribe */}
        <section className="section-padding relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-success/5 to-transparent pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="modern-card bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 overflow-hidden">
                <CardBody className="p-12 lg:p-20 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-8">🔔</div>
                    <h2 className="heading-lg mb-6">
                      Get <span className="text-success italic">Notified</span>
                    </h2>
                    <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                      Subscribe to receive notifications about scheduled maintenance and service disruptions.
                    </p>
                    <Button as={Link} href="/#contact" color="success" size="lg" className="font-black px-12 h-16 shadow-xl shadow-success/30 uppercase tracking-widest" radius="full">
                      Subscribe to Updates
                      <ArrowRight size={20} />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
