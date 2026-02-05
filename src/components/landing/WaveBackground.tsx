'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface WaveBackgroundProps {
  variant?: 'hero' | 'features' | 'testimonials' | 'cta' | 'minimal';
  fadeTop?: boolean;
  fadeBottom?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Gravitational orbs that float around
const FloatingOrb = ({
  size,
  color,
  initialX,
  initialY,
  duration,
  delay,
}: {
  size: number;
  color: 'green' | 'cyan' | 'purple';
  initialX: string;
  initialY: string;
  duration: number;
  delay: number;
}) => {
  const colorMap = {
    green: 'rgba(132, 204, 22, 0.08)',
    cyan: 'rgba(34, 211, 238, 0.06)',
    purple: 'rgba(168, 85, 247, 0.05)',
  };

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: `radial-gradient(circle at 30% 30%, ${colorMap[color]}, transparent 70%)`,
        filter: 'blur(2px)',
      }}
      animate={{
        x: [0, 50, -30, 20, 0],
        y: [0, -40, 20, -60, 0],
        scale: [1, 1.1, 0.9, 1.05, 1],
        opacity: [0.6, 0.8, 0.5, 0.7, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// Ripple effect emanating from center
const Ripple = ({ delay, size }: { delay: number; size: string }) => (
  <motion.div
    className="absolute rounded-full border border-primary/10 pointer-events-none"
    style={{
      left: '50%',
      top: '50%',
    }}
    initial={{
      width: 0,
      height: 0,
      x: '-50%',
      y: '-50%',
      opacity: 0.5,
    }}
    animate={{
      width: size,
      height: size,
      opacity: 0,
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

// Horizontal wave line
const WaveLine = ({ y, delay }: { y: string; delay: number }) => (
  <motion.div
    className="absolute left-0 right-0 h-px pointer-events-none"
    style={{ top: y }}
    initial={{ x: '-100%', opacity: 0, scaleY: 1 }}
    animate={{
      x: ['−100%', '0%', '100%'],
      opacity: [0, 0.8, 0],
      scaleY: [1, 1.5, 1],
    }}
    transition={{
      duration: 15,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <div
      className="w-full h-full"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(132, 204, 22, 0.15) 20%, rgba(132, 204, 22, 0.25) 50%, rgba(132, 204, 22, 0.15) 80%, transparent)',
      }}
    />
  </motion.div>
);

// Gravity distortion blob
const GravityBlob = ({
  size,
  x,
  y,
  color,
  duration,
}: {
  size: number;
  x: string;
  y: string;
  color: string;
  duration: number;
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: `radial-gradient(ellipse at center, ${color}, transparent 70%)`,
      filter: 'blur(60px)',
    }}
    animate={{
      borderRadius: [
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '30% 60% 70% 40% / 50% 60% 30% 60%',
        '50% 60% 30% 60% / 30% 50% 70% 40%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
      ],
      scale: [1, 1.1, 0.95, 1],
      rotate: [0, 90, 180, 360],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Animated grid with perspective distortion
const PerspectiveGrid = ({ opacity = 0.03 }: { opacity?: number }) => (
  <div
    className="absolute inset-0 overflow-hidden pointer-events-none"
    style={{ perspective: '1000px' }}
  >
    <motion.div
      className="absolute inset-[-50%] w-[200%] h-[200%]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: [2, 4, 1, 3, 2],
        y: [0, -20, -5, -15, 0],
        scale: [1, 1.02, 0.98, 1.01, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

// Bubble particles rising up
const BubbleParticle = ({
  size,
  x,
  delay,
  duration,
}: {
  size: number;
  x: string;
  delay: number;
  duration: number;
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      bottom: '-5%',
      background:
        'radial-gradient(circle at 30% 30%, rgba(132, 204, 22, 0.2), rgba(132, 204, 22, 0.05) 50%, transparent 70%)',
      boxShadow: 'inset 0 0 10px rgba(132, 204, 22, 0.1)',
    }}
    initial={{ y: 0, opacity: 0, scale: 0 }}
    animate={{
      y: [0, -800],
      opacity: [0, 0.8, 0.6, 0],
      scale: [0, 1, 0.8],
      x: [0, 20, -15, 10, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

export const WaveBackground: React.FC<WaveBackgroundProps> = ({
  variant = 'hero',
  fadeTop = false,
  fadeBottom = false,
  className = '',
  children,
}) => {
  const renderVariant = () => {
    switch (variant) {
      case 'hero':
        return (
          <>
            <PerspectiveGrid opacity={0.025} />

            {/* Gravity blobs */}
            <GravityBlob
              size={600}
              x="-10%"
              y="-20%"
              color="rgba(132, 204, 22, 0.08)"
              duration={25}
            />
            <GravityBlob
              size={500}
              x="60%"
              y="50%"
              color="rgba(34, 211, 238, 0.06)"
              duration={30}
            />

            {/* Floating orbs */}
            <FloatingOrb size={200} color="green" initialX="10%" initialY="20%" duration={18} delay={0} />
            <FloatingOrb size={150} color="cyan" initialX="70%" initialY="30%" duration={22} delay={3} />
            <FloatingOrb size={100} color="purple" initialX="30%" initialY="60%" duration={15} delay={6} />
            <FloatingOrb size={180} color="green" initialX="80%" initialY="70%" duration={20} delay={2} />

            {/* Ripples */}
            <Ripple delay={0} size="120%" />
            <Ripple delay={2} size="100%" />
            <Ripple delay={4} size="140%" />

            {/* Wave lines */}
            <WaveLine y="25%" delay={0} />
            <WaveLine y="50%" delay={5} />
            <WaveLine y="75%" delay={10} />
          </>
        );

      case 'features':
        return (
          <>
            <PerspectiveGrid opacity={0.02} />

            {/* Subtle gravity distortions */}
            <GravityBlob
              size={400}
              x="0%"
              y="30%"
              color="rgba(132, 204, 22, 0.05)"
              duration={30}
            />
            <GravityBlob
              size={350}
              x="70%"
              y="60%"
              color="rgba(34, 211, 238, 0.04)"
              duration={35}
            />

            {/* Bubbles rising */}
            <BubbleParticle size={8} x="10%" delay={0} duration={12} />
            <BubbleParticle size={12} x="25%" delay={2} duration={15} />
            <BubbleParticle size={6} x="40%" delay={4} duration={10} />
            <BubbleParticle size={10} x="60%" delay={1} duration={14} />
            <BubbleParticle size={8} x="75%" delay={3} duration={11} />
            <BubbleParticle size={14} x="90%" delay={5} duration={16} />

            {/* Floating orbs */}
            <FloatingOrb size={120} color="green" initialX="5%" initialY="40%" duration={20} delay={0} />
            <FloatingOrb size={80} color="cyan" initialX="90%" initialY="20%" duration={18} delay={4} />
          </>
        );

      case 'testimonials':
        return (
          <>
            <PerspectiveGrid opacity={0.015} />

            {/* Central gravity well */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: 800,
                height: 800,
                background: 'radial-gradient(circle, rgba(132, 204, 22, 0.03), transparent 60%)',
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.2, 0.9, 1.1, 1],
                opacity: [0.5, 0.8, 0.4, 0.6, 0.5],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Ripples from center */}
            <Ripple delay={0} size="80%" />
            <Ripple delay={3} size="100%" />
            <Ripple delay={6} size="60%" />

            {/* Sparse floating orbs */}
            <FloatingOrb size={100} color="green" initialX="15%" initialY="25%" duration={25} delay={0} />
            <FloatingOrb size={80} color="cyan" initialX="85%" initialY="65%" duration={22} delay={5} />
          </>
        );

      case 'cta':
        return (
          <>
            <PerspectiveGrid opacity={0.03} />

            {/* Intense gravity blobs */}
            <GravityBlob
              size={500}
              x="20%"
              y="20%"
              color="rgba(132, 204, 22, 0.1)"
              duration={20}
            />
            <GravityBlob
              size={400}
              x="60%"
              y="50%"
              color="rgba(34, 211, 238, 0.08)"
              duration={25}
            />

            {/* More ripples for energy */}
            <Ripple delay={0} size="150%" />
            <Ripple delay={1.5} size="120%" />
            <Ripple delay={3} size="180%" />
            <Ripple delay={4.5} size="100%" />

            {/* Multiple floating orbs */}
            <FloatingOrb size={150} color="green" initialX="5%" initialY="30%" duration={15} delay={0} />
            <FloatingOrb size={120} color="cyan" initialX="85%" initialY="20%" duration={18} delay={2} />
            <FloatingOrb size={100} color="purple" initialX="50%" initialY="70%" duration={12} delay={4} />
            <FloatingOrb size={80} color="green" initialX="20%" initialY="80%" duration={16} delay={1} />

            {/* Wave lines */}
            <WaveLine y="30%" delay={0} />
            <WaveLine y="60%" delay={3} />
          </>
        );

      case 'minimal':
      default:
        return (
          <>
            <PerspectiveGrid opacity={0.015} />
            <FloatingOrb size={100} color="green" initialX="10%" initialY="50%" duration={25} delay={0} />
            <FloatingOrb size={80} color="cyan" initialX="80%" initialY="40%" duration={30} delay={5} />
          </>
        );
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.12] contrast-150 brightness-50 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      {/* Variant-specific effects */}
      {renderVariant()}

      {/* Fade overlays */}
      {fadeTop && (
        <div
          className="absolute top-0 left-0 right-0 h-32 md:h-48 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, #030407, transparent)',
          }}
        />
      )}
      {fadeBottom && (
        <div
          className="absolute bottom-0 left-0 right-0 h-32 md:h-48 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, #030407, transparent)',
          }}
        />
      )}

      {children}
    </div>
  );
};

export default WaveBackground;
