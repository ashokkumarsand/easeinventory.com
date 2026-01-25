'use client';

import React, { useEffect, useState } from 'react';

interface LoaderProps {
  onComplete?: () => void;
  duration?: number;
}

export const ScatterLoader: React.FC<LoaderProps> = ({ 
  onComplete, 
  duration = 2000 
}) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // 4 boxes that scatter and come together
  const boxes = [
    { id: 1, delay: 0, startX: -120, startY: -100, startRotate: 45, finalX: -22, finalY: -22 },
    { id: 2, delay: 0.1, startX: 120, startY: -100, startRotate: -30, finalX: 22, finalY: -22 },
    { id: 3, delay: 0.2, startX: -120, startY: 100, startRotate: 60, finalX: -22, finalY: 22 },
    { id: 4, delay: 0.25, startX: 120, startY: 100, startRotate: -45, finalX: 22, finalY: 22 },
  ];

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark">
      <div className="relative w-40 h-40">
        {/* Purple background square that fades in */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl"
          style={{
            width: '100px',
            height: '100px',
            background: '#6A3BF6',
            opacity: isComplete ? 1 : 0,
            transform: isComplete 
              ? 'translate(-50%, -50%) scale(1)'
              : 'translate(-50%, -50%) scale(0.8)',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Scattered boxes that animate into the logo */}
        {boxes.map((box) => (
          <div
            key={box.id}
            className="absolute rounded-lg"
            style={{
              width: '32px',
              height: '32px',
              background: '#EDE8D0',
              left: '50%',
              top: '50%',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              transform: isComplete 
                ? `translate(calc(-50% + ${box.finalX}px), calc(-50% + ${box.finalY}px)) rotate(0deg)`
                : `translate(calc(-50% + ${box.startX}px), calc(-50% + ${box.startY}px)) rotate(${box.startRotate}deg)`,
              opacity: 1,
              transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${box.delay}s`,
            }}
          />
        ))}

        {/* Pulse ring effect */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl border-2"
          style={{
            borderColor: '#6A3BF6',
            animation: 'pulse-ring 1.5s ease-out infinite',
            opacity: isComplete ? 0 : 0.5,
          }}
        />
      </div>

      {/* Loading text */}
      <div 
        className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: isComplete ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <p className="text-gray-400 text-sm font-medium tracking-wider animate-pulse">
          Loading...
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Alternative simpler loader with bouncing boxes
export const SimpleLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark">
      <div className="relative">
        {/* Grid of 4 boxes */}
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded"
              style={{
                background: '#EDE8D0',
                animation: `bounce-box 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>
        
        <style jsx>{`
          @keyframes bounce-box {
            0% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ScatterLoader;
