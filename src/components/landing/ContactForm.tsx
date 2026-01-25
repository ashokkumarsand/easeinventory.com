'use client';

import {
    Button,
    Card,
    CardBody,
    Chip,
    Input,
    Textarea
} from '@heroui/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate sending to enquiry@easeinventory.com
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-cream dark:bg-dark-bg relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
           <Chip 
            variant="flat" 
            color="primary" 
            className="mb-6 font-bold uppercase text-[10px] tracking-widest px-4"
           >
              Get Integrated
           </Chip>
           <h2 className="heading-lg mb-8 text-dark dark:text-white">
             Ready to <span className="text-primary italic">Transform?</span>
           </h2>
           <p className="paragraph-lg opacity-60">
             Whether you have a specific question or want a custom walkthrough, our specialists are ready to help you scale.
           </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-6xl mx-auto">
          {/* Info Side */}
          <div className="space-y-12">
             <div className="grid gap-8">
                {[
                  { 
                    label: 'Sales Inquiry', 
                    email: 'sales@easeinventory.com', 
                    icon: '💼',
                    desc: 'Questions about our plans or custom pricing?' 
                  },
                  { 
                    label: 'General Support', 
                    email: 'contact@easeinventory.com', 
                    icon: '✉️',
                    desc: 'Existing users needing help or technical guidance.' 
                  }
                ].map((item) => (
                  <div key={item.label} className="flex gap-6 p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 group hover:bg-primary/5 transition-colors">
                     <div className="w-14 h-14 rounded-2xl bg-white dark:bg-dark-card flex items-center justify-center text-2xl shadow-sm">
                        {item.icon}
                     </div>
                     <div>
                        <h4 className="text-lg font-black mb-1">{item.label}</h4>
                        <p className="text-sm opacity-50 mb-2">{item.desc}</p>
                        <a href={`mailto:${item.email}`} className="text-primary font-black hover:underline">{item.email}</a>
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-8 rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/20">
                <h4 className="text-xl font-black mb-4">India Headquarters</h4>
                <p className="opacity-80 leading-relaxed mb-6">
                  EaseInventory Technologies Private Limited<br />
                  Business Hub, Sector 62<br />
                  Noida, Uttar Pradesh 201301
                </p>
                <div className="flex items-center gap-2 font-bold">
                   <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                   <span>Supports all Indian languages</span>
                </div>
             </div>
          </div>

          {/* Form Side */}
          <Card className="modern-card p-4 md:p-8" radius="lg">
             <CardBody>
                {isSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 text-white shadow-lg shadow-green-500/20">
                       ✓
                    </div>
                    <h3 className="text-2xl font-black mb-2">Message Received</h3>
                    <p className="opacity-50 font-medium">Our specialists will reach out to you via email shortly.</p>
                    <Button 
                      variant="light" 
                      className="mt-8 font-bold"
                      onClick={() => setIsSent(false)}
                    >
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        placeholder="Ashok Kumar"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        classNames={{
                          label: "font-bold text-dark/70 dark:text-white/70 pb-2",
                          inputWrapper: "bg-black/5 dark:bg-white/5 h-14"
                        }}
                      />
                      <Input
                        label="Work Email"
                        type="email"
                        placeholder="ashok@shop.com"
                        labelPlacement="outside"
                        size="lg"
                        radius="lg"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        classNames={{
                          label: "font-bold text-dark/70 dark:text-white/70 pb-2",
                          inputWrapper: "bg-black/5 dark:bg-white/5 h-14"
                        }}
                      />
                    </div>
                    
                    <Input
                      label="Subject"
                      placeholder="Pricing Inquiry / Demo Request"
                      labelPlacement="outside"
                      size="lg"
                      radius="lg"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      classNames={{
                        label: "font-bold text-dark/70 dark:text-white/70 pb-2",
                        inputWrapper: "bg-black/5 dark:bg-white/5 h-14"
                      }}
                    />

                    <Textarea
                      label="Your Message"
                      placeholder="Tell us about your business needs..."
                      labelPlacement="outside"
                      size="lg"
                      radius="lg"
                      required
                      minRows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      classNames={{
                        label: "font-bold text-dark/70 dark:text-white/70 pb-2",
                        inputWrapper: "bg-black/5 dark:bg-white/5"
                      }}
                    />

                    <Button 
                      color="primary" 
                      size="lg"
                      className="w-full font-black h-16 shadow-xl shadow-primary/20" 
                      radius="full"
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      Process Inquiry
                    </Button>
                    <p className="text-[10px] text-center uppercase tracking-widest font-black opacity-20">
                      Response time typically under 2 hours
                    </p>
                  </form>
                )}
             </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
