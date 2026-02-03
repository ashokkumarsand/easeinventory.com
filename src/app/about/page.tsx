'use client';

import { Button, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';

const values = [
  { icon: '🎯', title: 'Precision First', description: 'Every feature we build focuses on accuracy. Zero tolerance for inventory errors or data loss.' },
  { icon: '🇮🇳', title: 'Made for India', description: 'Built specifically for Indian retail—GST compliance, UPI, WhatsApp, and local business practices.' },
  { icon: '⚡', title: 'Speed Matters', description: 'Fast interfaces, instant syncing, real-time updates. We optimize for every millisecond.' },
  { icon: '🤝', title: 'Partner Success', description: 'Your growth is our growth. We succeed only when our retailers succeed.' },
];

const timeline = [
  { year: '2024', title: 'The Beginning', description: 'Founded with a mission to digitize India\'s retail sector with affordable, powerful tools.' },
  { year: '2025', title: 'Product Launch', description: 'Launched EaseInventory with core inventory, billing, and repair modules for mobile retailers.' },
  { year: '2026', title: 'Rapid Growth', description: 'Expanded to 1000+ retailers across India with new features like multi-location and WhatsApp integration.' },
];

const team = [
  { emoji: '👨‍💻', role: 'Engineering', description: 'Building robust, scalable systems' },
  { emoji: '🎨', role: 'Design', description: 'Crafting beautiful, intuitive interfaces' },
  { emoji: '🤝', role: 'Customer Success', description: 'Ensuring every retailer thrives' },
  { emoji: '📈', role: 'Growth', description: 'Reaching retailers who need us' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] pt-32 pb-20 lg:pt-40 lg:pb-32 flex items-center">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2 rounded-full mb-8">
                <span className="text-xl">🚀</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Our Mission</span>
              </div>

              <h1 className="heading-lg mb-8">
                Empowering India's<br />
                <span className="text-primary italic">Retail Revolution</span>
              </h1>

              <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                We're building the most precise inventory and service management platform
                for India's 15 million retailers. Our mission: make enterprise-grade tools
                accessible to every shop owner.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-secondary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Our Values</span>
              </div>
              <h2 className="heading-lg mb-6">
                What <span className="text-secondary italic">Drives Us</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card h-full group hover:border-secondary/30 transition-all duration-500">
                    <CardBody className="p-8 text-center">
                      <div className="w-20 h-20 rounded-[28px] bg-secondary/10 flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{value.title}</h3>
                      <p className="text-foreground/60 italic">{value.description}</p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-padding bg-foreground/[0.02] relative">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Our Journey</span>
              </div>
              <h2 className="heading-lg mb-6">
                Building the <span className="text-primary italic">Future</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card className="modern-card">
                    <CardBody className="p-8 flex gap-8 items-center">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-2xl font-black text-primary">{item.year}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{item.title}</h3>
                        <p className="text-foreground/60 italic">{item.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding relative">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <div className="inline-flex items-center gap-3 bg-warning/10 border border-warning/20 px-4 py-2 rounded-full mb-6">
                <div className="w-2 h-2 bg-warning animate-pulse rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-warning">Our Team</span>
              </div>
              <h2 className="heading-lg mb-6">
                Passionate <span className="text-warning italic">Builders</span>
              </h2>
              <p className="paragraph-lg">
                A diverse team of engineers, designers, and retail experts building for India.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.role}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="modern-card h-full group hover:border-warning/30 transition-all duration-500">
                    <CardBody className="p-8 text-center">
                      <div className="text-6xl mb-6">{member.emoji}</div>
                      <h3 className="text-lg font-black mb-2 uppercase tracking-tight">{member.role}</h3>
                      <p className="text-sm text-foreground/60 italic">{member.description}</p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="modern-card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
                <CardBody className="p-12 lg:p-20 text-center relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-8">🤝</div>
                    <h2 className="heading-lg mb-6">
                      Join Our <span className="text-primary italic">Mission</span>
                    </h2>
                    <p className="paragraph-lg mb-10 max-w-2xl mx-auto">
                      Be part of India's retail transformation. Start your free trial today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button as={Link} href="/register" color="primary" size="lg" className="font-black px-12 h-16 shadow-xl shadow-primary/30 uppercase tracking-widest" radius="full">
                        Start Free Trial
                        <ArrowRight size={20} />
                      </Button>
                      <Button as={Link} href="/#contact" variant="bordered" size="lg" className="font-black px-12 h-16 uppercase tracking-widest border-foreground/10" radius="full">
                        Contact Us
                      </Button>
                    </div>
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
