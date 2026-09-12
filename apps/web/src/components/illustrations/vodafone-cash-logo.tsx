import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function VodafoneCashLogo({ className = "", size = 48 }: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md shadow-red-600/20 ${className}`}
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
        <rect width="100" height="100" rx="20" fill="url(#vf-grad)" />
        <defs>
          <linearGradient id="vf-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E60000" />
            <stop offset="1" stopColor="#9B0000" />
          </linearGradient>
        </defs>

        {/* Vodafone Speechmark Emblem */}
        <circle cx="50" cy="46" r="28" fill="#FFFFFF" opacity="0.15" />
        <path
          d="M50 26C37.85 26 28 35.85 28 48C28 60.15 37.85 70 50 70C62.15 70 72 60.15 72 48C72 35.85 62.15 26 50 26ZM48.5 35C53.75 35 58 39.25 58 44.5C58 49.75 53.75 54 48.5 54C43.25 54 39 49.75 39 44.5C39 39.25 43.25 35 48.5 35ZM50 63C42.82 63 37 57.18 37 50H43C43 53.87 46.13 57 50 57C53.87 57 57 53.87 57 50C57 46.13 53.87 43 50 43V37C57.18 37 63 42.82 63 50C63 57.18 57.18 63 50 63Z"
          fill="#FFFFFF"
        />

        {/* Cash badge overlay */}
        <rect x="22" y="72" width="56" height="18" rx="9" fill="#111827" stroke="#E60000" strokeWidth="2" />
        <text
          x="50"
          y="84"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.5"
        >
          CASH
        </text>
      </svg>
    </div>
  );
}
