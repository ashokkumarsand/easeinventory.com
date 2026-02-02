'use client';

import { motion } from 'framer-motion';
import { Rocket, Zap } from 'lucide-react';
import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <section id="about" className="section-padding bg-background relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full w-fit">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary pt-0.5">The Antigravity Mission</span>
                        </div>
                        <h2 className="heading-lg uppercase">
                            We don&apos;t just manage. <br />
                            <span className="text-primary italic">We Lift.</span>
                        </h2>
                        <div className="space-y-6 text-xl font-medium text-foreground/60 leading-relaxed italic">
                            <p>
                                Gravity is the enemy of progress. In business, it looks like slow data, heavy logistics, and the friction of outdated ERPs that drag your growth down.
                            </p>
                            <p>
                                At <span className="text-foreground font-black italic">Ease</span><span className="text-primary font-black italic">Inventory</span>, we engineered the **Antigravity Protocol**. Our mission is to remove the physical and digital burdens of inventory management, allowing your operations to achieve zero-friction velocity.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-foreground/5">
                            <div className="space-y-2">
                                <span className="text-3xl font-black text-primary italic">Zero</span>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Lag Infrastructure</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-3xl font-black text-primary italic">Total</span>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Freedom</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative"
                    >
                        <div className="aspect-square bg-foreground/5 rounded-[4rem] flex items-center justify-center p-12 overflow-hidden group">
                           {/* Abstract Visual Representation of "Lifting" */}
                            <motion.div 
                                animate={{ 
                                    y: [-20, 20, -20],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-full h-full border-2 border-primary/20 rounded-[3rem] flex items-center justify-center relative bg-gradient-to-br from-primary/5 to-transparent"
                            >
                                <Rocket size={120} className="text-primary opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 bg-primary/10 blur-[80px] rounded-full animate-pulse" />
                                </div>
                                <div className="absolute inset-0 border-[20px] border-primary/5 rounded-[3rem] scale-110 opacity-50" />
                            </motion.div>
                            
                            {/* Stats Overlay */}
                            <div className="absolute bottom-8 right-8 bg-card border border-foreground/10 p-6 rounded-3xl shadow-2xl space-y-2 backdrop-blur-xl">
                                <Zap className="text-primary mb-2" size={24} />
                                <div className="text-2xl font-black">99.9%</div>
                                <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Deployment Efficiency</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
