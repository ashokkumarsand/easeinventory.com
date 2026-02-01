'use client';

import { Accordion, AccordionItem } from '@heroui/react';
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
    answer: (
      <>
        Yes! While every business gets a free .<span className="italic">ease</span><span className="text-primary italic">inventory</span>.com link, you can easily map your own domain (e.g., portal.yourbrand.com) in the settings.
      </>
    ),
  },
  {
    question: 'What about data privacy?',
    answer: 'We use enterprise-grade AES-256 encryption. Your data is your own. We do not share or sell business metrics to any third parties.',
  },
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="section-padding bg-background relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container-custom relative z-10 flex flex-col lg:flex-row gap-24 lg:gap-32">
        
        {/* Left Side: Text */}
        <div className="lg:w-1/3">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="sticky top-40"
           >
              <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Intelligence Hub</span>
              </div>
              <h2 className="heading-lg mb-10">Got <span className="text-primary italic">Questions?</span></h2>
              <p className="paragraph-lg mb-12 italic">Everything you need to know about scaling operations with <span className="italic">Ease</span><span className="text-primary italic">Inventory</span>. Still stuck? Reach out to our 24/7 command center.</p>
              
              <div className="p-10 rounded-[40px] bg-foreground/5 border border-foreground/5 hover:bg-foreground/[0.08] transition-all duration-500 shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-6 underline underline-offset-8">Direct Access</p>
                 <a href="mailto:help@easeinventory.com" className="text-2xl font-black mb-2 block hover:text-primary transition-colors text-foreground tracking-tight">help@easeinventory.com</a>
                 <p className="text-lg font-bold opacity-60 text-foreground">+91 94114 36666</p>
              </div>
           </motion.div>
        </div>

        {/* Right Side: Accordion */}
        <div className="lg:w-2/3">
           <Accordion 
             variant="splitted"
             itemClasses={{
               base: "px-8 mb-6 !shadow-none border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/5 hover:border-primary/20 rounded-[32px] overflow-hidden transition-all duration-500",
               title: "font-black text-2xl py-8 text-foreground uppercase tracking-tight",
               content: "pb-10 opacity-70 font-medium leading-relaxed italic text-lg text-foreground",
               indicator: "text-primary text-2xl",
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
