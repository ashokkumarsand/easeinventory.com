'use client';

import { Lock, TrendingUp, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

function useCountUp(end: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return value;
}

const AboutUs: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const uptimeValue = useCountUp(999, 1500, isVisible);
  const efficiencyValue = useCountUp(94, 1200, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left: Content (60%) */}
          <div
            className={`lg:col-span-3 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="glass-badge inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                The Antigravity Mission
              </span>
            </div>

            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 max-w-[600px]"
            >
              WE DON&apos;T
              <br />
              JUST MANAGE.
              <br />
              <span className="gradient-text">WE LIFT.</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Gravity is the enemy of progress. In business, it looks like slow data,
              heavy logistics, and the friction of outdated ERPs that drag your growth down.
            </p>
          </div>

          {/* Right: Floating Stats Card (40%) */}
          <div
            className={`lg:col-span-2 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-primary/10 blur-[60px] rounded-full scale-75" aria-hidden="true" />

              {/* Stats Card */}
              <div className="feature-card relative p-8 animate-float">
                <div className="space-y-6">
                  {/* Stat 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">
                        {(uptimeValue / 10).toFixed(1)}%
                      </p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Uptime Guarantee
                      </p>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">Zero</p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Lag Infrastructure
                      </p>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground">Total</p>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Operational Freedom
                      </p>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-foreground/5 pt-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Deployment Efficiency
                      </span>
                      <span className="text-sm font-black text-primary">
                        {efficiencyValue}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-1500 ease-out"
                        style={{
                          width: isVisible ? '94%' : '0%',
                          transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
