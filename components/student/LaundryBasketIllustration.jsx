"use client";

import React from "react";

export default function LaundryBasketIllustration({ className = "w-44 h-36" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="basketBody" x1="40" y1="60" x2="200" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D8B4FE" />
            <stop offset="0.5" stopColor="#C084FC" />
            <stop offset="1" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient id="basketRim" x1="30" y1="55" x2="210" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3E8FF" />
            <stop offset="0.5" stopColor="#E9D5FF" />
            <stop offset="1" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient id="clothBlue" x1="60" y1="20" x2="140" y2="65" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BAE6FD" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="clothPink" x1="120" y1="15" x2="185" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBCFE8" />
            <stop offset="1" stopColor="#F472B6" />
          </linearGradient>

          <linearGradient id="clothYellow" x1="90" y1="25" x2="150" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>

          <linearGradient id="towelDrape" x1="45" y1="60" x2="80" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.6" stopColor="#E0E7FF" />
            <stop offset="1" stopColor="#C7D2FE" />
          </linearGradient>

          <linearGradient id="bubbleGlow" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C084FC" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Soft Shadow underneath */}
        <ellipse cx="120" cy="165" rx="80" ry="12" fill="#0F0926" fillOpacity="0.35" />

        {/* Overhanging Towel / Clothes (Back Layer) */}
        <path
          d="M60 45 C60 30, 85 20, 115 25 C140 29, 145 42, 145 52 L60 52 Z"
          fill="url(#clothBlue)"
        />
        <path
          d="M110 35 C125 18, 160 20, 180 32 C195 42, 190 56, 180 58 L110 58 Z"
          fill="url(#clothPink)"
        />
        <path
          d="M85 38 C100 28, 135 28, 155 38 C165 44, 160 55, 145 56 L85 55 Z"
          fill="url(#clothYellow)"
        />

        {/* Basket Body */}
        <path
          d="M48 65 L66 155 C67 160, 72 164, 78 164 L162 164 C168 164, 173 160, 174 155 L192 65 Z"
          fill="url(#basketBody)"
        />

        {/* Basket Mesh Openings / Diamond Ventilation Holes */}
        <g fill="#7E22CE" fillOpacity="0.45">
          {/* Row 1 */}
          <rect x="75" y="80" width="12" height="7" rx="3.5" />
          <rect x="95" y="80" width="12" height="7" rx="3.5" />
          <rect x="115" y="80" width="12" height="7" rx="3.5" />
          <rect x="135" y="80" width="12" height="7" rx="3.5" />
          <rect x="155" y="80" width="12" height="7" rx="3.5" />

          {/* Row 2 */}
          <rect x="80" y="96" width="12" height="7" rx="3.5" />
          <rect x="100" y="96" width="12" height="7" rx="3.5" />
          <rect x="120" y="96" width="12" height="7" rx="3.5" />
          <rect x="140" y="96" width="12" height="7" rx="3.5" />

          {/* Row 3 */}
          <rect x="85" y="112" width="12" height="7" rx="3.5" />
          <rect x="105" y="112" width="12" height="7" rx="3.5" />
          <rect x="125" y="112" width="12" height="7" rx="3.5" />
          <rect x="145" y="112" width="12" height="7" rx="3.5" />

          {/* Row 4 */}
          <rect x="90" y="128" width="12" height="7" rx="3.5" />
          <rect x="110" y="128" width="12" height="7" rx="3.5" />
          <rect x="130" y="128" width="12" height="7" rx="3.5" />
          <rect x="150" y="128" width="12" height="7" rx="3.5" />

          {/* Row 5 */}
          <rect x="95" y="144" width="12" height="6" rx="3" />
          <rect x="115" y="144" width="12" height="6" rx="3" />
          <rect x="135" y="144" width="12" height="6" rx="3" />
        </g>

        {/* White / Lavender Towel Draped over Basket Front */}
        <path
          d="M52 64 C52 64, 60 75, 62 95 C64 112, 60 125, 63 130 C66 134, 76 133, 78 126 C82 115, 84 88, 86 64 Z"
          fill="url(#towelDrape)"
          filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.15))"
        />
        {/* Towel folds */}
        <path d="M64 85 C67 98, 66 112, 69 126" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M74 80 C76 96, 75 110, 77 122" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" />

        {/* Basket Oval Top Rim */}
        <ellipse cx="120" cy="64" rx="74" ry="11" fill="url(#basketRim)" />
        <ellipse cx="120" cy="64" rx="67" ry="8" fill="#7C3AED" />

        {/* Handle Cutout Left */}
        <rect x="36" y="88" width="6" height="18" rx="3" fill="#E9D5FF" opacity="0.6" />
        {/* Handle Cutout Right */}
        <rect x="198" y="88" width="6" height="18" rx="3" fill="#E9D5FF" opacity="0.6" />

        {/* Cute Floating Clean Laundry Bubbles */}
        <circle cx="32" cy="40" r="9" fill="url(#bubbleGlow)" stroke="#FFFFFF" strokeWidth="1" />
        <ellipse cx="30" cy="37" rx="3" ry="1.5" fill="#FFFFFF" />

        <circle cx="210" cy="45" r="7" fill="url(#bubbleGlow)" stroke="#FFFFFF" strokeWidth="1" />
        <ellipse cx="208" cy="43" rx="2" ry="1" fill="#FFFFFF" />

        <circle cx="195" cy="22" r="12" fill="url(#bubbleGlow)" stroke="#FFFFFF" strokeWidth="1.2" />
        <ellipse cx="192" cy="18" rx="4" ry="2" fill="#FFFFFF" />

        {/* Sparkles */}
        <path d="M42 20 L44 24 L48 26 L44 28 L42 32 L40 28 L36 26 L40 24 Z" fill="#FDE047" />
        <path d="M218 80 L219 83 L222 84 L219 85 L218 88 L217 85 L214 84 L217 83 Z" fill="#FDE047" />
      </svg>
    </div>
  );
}

