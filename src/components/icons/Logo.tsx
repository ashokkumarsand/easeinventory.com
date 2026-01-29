import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradients for faces */}
        <linearGradient id="top-grad" x1="120" y1="40" x2="120" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A3E635" />
          <stop offset="100%" stopColor="#65A30D" />
        </linearGradient>
        <linearGradient id="left-grad" x1="55" y1="75" x2="120" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="right-grad-top" x1="120" y1="110" x2="185" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="right-grad-bottom" x1="120" y1="140" x2="185" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="swoosh-grad" x1="40" y1="180" x2="200" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* CUBE LAYERS (Aligned Heights) */}
      <g>
        {/* Top Face */}
        <path d="M120 40L185 75L120 110L55 75L120 40Z" fill="url(#top-grad)" />
        
        {/* Left Side (Blue - 60px height) */}
        <path d="M55 75L120 110V170L55 135V75Z" fill="url(#left-grad)" />
        
        {/* Right Side (Total 60px height: 30px Cyan + 30px Orange) */}
        <path d="M120 110L185 75V105L120 140V110Z" fill="url(#right-grad-top)" />
        <path d="M120 140L185 105V135L120 170V140Z" fill="url(#right-grad-bottom)" />
      </g>

      {/* BASE SWOOSH ELEMENTS (Reduced Space) */}
      <g transform="translate(0, -6)">
        {/* Outer Glow/Layer */}
        <path
          d="M35 185C35 185 75 225 120 225C165 225 205 185 205 185C205 185 165 212 120 212C75 212 35 185 35 185Z"
          fill="url(#swoosh-grad)"
          fillOpacity="0.2"
        />
        {/* Main Solid Swoosh */}
        <path
          d="M45 180C45 180 80 215 120 215C160 215 195 180 195 180C195 180 160 205 120 205C80 205 45 180 45 180Z"
          fill="url(#swoosh-grad)"
        />
      </g>
    </svg>
  );
};

export const LogoWithText: React.FC<LogoProps & { showText?: boolean }> = ({
  size = 40,
  className = '',
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-black tracking-tight flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#A3E635] to-[#65A30D]">
              EASE
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] ml-1">
              INVENTORY
            </span>
          </span>
          <span className="text-[10px] font-bold text-[#1E3A8A]/30 tracking-[0.25em] uppercase mt-0.5">
            Smart ERP Solutions
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
