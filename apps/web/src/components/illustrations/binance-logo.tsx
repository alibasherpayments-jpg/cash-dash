import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function BinanceLogo({ className = "", size = 48 }: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md shadow-amber-500/20 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <rect width="100" height="100" rx="20" fill="#181A20" />
        
        {/* Binance Yellow Diamond Emblem */}
        <g transform="translate(10, 10) scale(0.8)">
          {/* Center diamond */}
          <polygon points="50,38 62,50 50,62 38,50" fill="#F0B90B" />
          
          {/* Top diamond */}
          <polygon points="50,14 62,26 50,38 38,26" fill="#F0B90B" />
          
          {/* Bottom diamond */}
          <polygon points="50,62 62,74 50,86 38,74" fill="#F0B90B" />
          
          {/* Left diamond */}
          <polygon points="26,38 38,50 26,62 14,50" fill="#F0B90B" />
          
          {/* Right diamond */}
          <polygon points="74,38 86,50 74,62 62,50" fill="#F0B90B" />
        </g>

        {/* Subtle border */}
        <rect x="0.5" y="0.5" width="99" height="99" rx="19.5" stroke="#F0B90B" strokeOpacity="0.25" />
      </svg>
    </div>
  );
}
