'use client';

import { Accordion, AccordionItem, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import React from 'react';

const faqs = [
  {
    question: 'Where is my data stored?',
    answer: 'We prioritize data residency. All business data is stored in AWS Mumbai and Azure Central India regions, ensuring highest speeds and compliance with Indian regulations.',
  },
  {
    question: 'How do I manage multiple branches?',
    answer: 'Our Enterprise plan allows you to add multiple locations. You can track stock transfers, centralized analytics, and branch-specific staff roles from one master admin panel.',
  },
  {
    question: 'Is there a limit on transactions?',
    answer: 'None at all. Whether you generate 10 or 10,000 invoices a day, our infrastructure scales automatically to handle your business volume.',
  },
  {
    question: 'Can I use a custom domain?',
    answer: 'Yes! While every business gets a free .easeinventory.com link, you can easily map your own domain (e.g., portal.yourbrand.com) in the settings.',
  },
  {
    question: 'What about data privacy?',
    answer: 'We use enterprise-grade AES-256 encryption. Your data is your own. We do not share or sell business metrics to any third parties.',
  },
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="section-padding bg-background relative">
      <div className="container-custom relative z-10 flex flex-col lg:flex-row gap-20">
        
        {/* Left Side: Text */}
        <div className="lg:w-1/3">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <Chip variant="flat" color="primary" className="mb-6 font-bold uppercase text-xs">
                 Support Lab
              </Chip>
              <h2 className="heading-lg mb-8">Got <span className="text-primary italic">Questions?</span></h2>
              <p className="paragraph-lg mb-10 text-sm">Everything you need to know about setting up and scaling with EaseInventory. Still stuck? Reach out to our 24/7 support.</p>
              
              <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10">
                 <p className="text-sm font-bold opacity-60 mb-4 uppercase tracking-[0.2em]">Contact Us</p>
                 <p className="text-xl font-black mb-1">help@ease.in</p>
                 <p className="text-sm font-medium opacity-50">+91 98765 43210</p>
              </div>
           </motion.div>
        </div>

        {/* Right Side: Accordion */}
        <div className="lg:w-2/3">
           <Accordion 
             variant="splitted"
             itemClasses={{
               base: "px-6 mb-4 !shadow-none border border-black/5 dark:border-white/5 !bg-foreground/[0.02] rounded-[24px] overflow-hidden",
               title: "font-black text-lg py-6",
               content: "pb-8 opacity-60 font-medium leading-relaxed",
               indicator: "text-primary text-xl",
               trigger: "py-0 h-auto"
             }}
           >
             {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  aria-label={faq.question}
                  title={faq.question}
                >
                  {faq.answer}
                </AccordionItem>
             ))}
           </Accordion>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
