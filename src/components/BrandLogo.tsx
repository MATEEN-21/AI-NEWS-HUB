import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  className = '',
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  };

  const pillSizes = {
    sm: 'text-[8px] px-1.5 py-0.2',
    md: 'text-[9px] sm:text-[10px] px-2 py-0.5',
    lg: 'text-[10px] px-2.5 py-0.5',
  };

  return (
    <div className={`flex items-center space-x-2.5 sm:space-x-3 select-none ${className}`}>
      {/* Custom Blue Logo Icon with Futuristic Letter 'A' and Glowing Cyan Circuit Nodes */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-1 shadow-md flex items-center justify-center shrink-0 border border-blue-400/40 group-hover:border-cyan-400/70 transition-all duration-300`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            {/* Linear gradient for metallic / high-tech letter 'A' */}
            <linearGradient id="cyberLetterA" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e0f2fe" />
              <stop offset="0.35" stopColor="#38bdf8" />
              <stop offset="0.75" stopColor="#0284c7" />
              <stop offset="1" stopColor="#0369a1" />
            </linearGradient>

            {/* Glowing cyan circuit filter */}
            <filter id="circuitCyanGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Circuit bus traces in background */}
          <path
            d="M 6 30 L 12 30 L 15 24"
            stroke="#22d3ee"
            strokeWidth="1.25"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <path
            d="M 34 30 L 28 30 L 25 24"
            stroke="#22d3ee"
            strokeWidth="1.25"
            strokeOpacity="0.7"
            strokeLinecap="round"
          />
          <path
            d="M 20 4 L 20 8"
            stroke="#22d3ee"
            strokeWidth="1.25"
            strokeOpacity="0.8"
            strokeLinecap="round"
          />

          {/* Futuristic Angular Letter A */}
          <path
            d="M 20 7.5 L 9 32.5 H 14.5 L 17.2 25.5 H 22.8 L 25.5 32.5 H 31 L 20 7.5 Z M 20 14.5 L 21.8 21.2 H 18.2 L 20 14.5 Z"
            fill="url(#cyberLetterA)"
            stroke="#0284c7"
            strokeWidth="0.5"
          />

          {/* Glowing Cyan Circuit Nodes / Terminals */}
          {/* Apex Node */}
          <circle cx="20" cy="7.5" r="2.2" fill="#22d3ee" filter="url(#circuitCyanGlow)" />
          <circle cx="20" cy="7.5" r="1.1" fill="#ffffff" />

          {/* Base Nodes */}
          <circle cx="9" cy="32.5" r="1.8" fill="#22d3ee" filter="url(#circuitCyanGlow)" />
          <circle cx="9" cy="32.5" r="0.9" fill="#ffffff" />

          <circle cx="31" cy="32.5" r="1.8" fill="#22d3ee" filter="url(#circuitCyanGlow)" />
          <circle cx="31" cy="32.5" r="0.9" fill="#ffffff" />

          {/* Crossbar Circuit Nodes */}
          <circle cx="17.2" cy="25.5" r="1.4" fill="#67e8f9" filter="url(#circuitCyanGlow)" />
          <circle cx="22.8" cy="25.5" r="1.4" fill="#67e8f9" filter="url(#circuitCyanGlow)" />

          {/* Core Central Micro-Node */}
          <circle cx="20" cy="21.2" r="1.3" fill="#a5f3fc" />
        </svg>
      </div>

      {/* Brand Text: AI TECH in bold typography, with HUB styled inside a rounded blue badge/pill underneath */}
      <div className="flex flex-col justify-center items-start leading-none">
        <span
          className={`font-black ${textSizes[size]} tracking-tight transition-colors duration-200 ${
            isDark
              ? 'text-white group-hover:text-blue-400'
              : 'text-slate-900 group-hover:text-blue-600'
          }`}
        >
          AI TECH
        </span>
        <span
          className={`mt-0.5 inline-flex items-center justify-center font-black tracking-widest uppercase rounded-full bg-blue-600 text-white shadow-xs leading-none transition-transform group-hover:scale-105 ${pillSizes[size]}`}
        >
          HUB
        </span>
      </div>
    </div>
  );
};
