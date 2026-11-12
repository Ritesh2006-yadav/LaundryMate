"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function WashingMachineIllustration({ status = "In Washing", className = "w-48 h-56" }) {
  const isWashing = status === "In Washing" || status === "In Process" || status === "In Progress";
  const isDrying = status === "In Drying";
  const isCompleted = status === "Completed" || status === "Delivered" || status === "Ready for Delivery";

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D Washing Machine SVG Graphic */}
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="wmBody" x1="20" y1="20" x2="180" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3E8FF" />
            <stop offset="0.4" stopColor="#E9D5FF" />
            <stop offset="1" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient id="wmTop" x1="20" y1="15" x2="180" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAF5FF" />
            <stop offset="1" stopColor="#E9D5FF" />
          </linearGradient>

          <linearGradient id="drumOuter" x1="50" y1="65" x2="150" y2="165" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.6" stopColor="#DDD6FE" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="drumInner" x1="60" y1="75" x2="140" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1338" />
            <stop offset="1" stopColor="#311B68" />
          </linearGradient>

          <linearGradient id="waterFlow" x1="70" y1="85" x2="130" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="1" stopColor="#6366F1" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Soft Base Shadow */}
        <ellipse cx="100" cy="228" rx="72" ry="10" fill="#17112F" fillOpacity="0.3" />

        {/* Machine Feet */}
        <rect x="36" y="218" width="20" height="8" rx="4" fill="#6B21A8" />
        <rect x="144" y="218" width="20" height="8" rx="4" fill="#6B21A8" />

        {/* Machine Main Body with Rounded Corners */}
        <rect x="24" y="20" width="152" height="200" rx="28" fill="url(#wmBody)" stroke="#FFFFFF" strokeWidth="3" />

        {/* Top Control Panel Header */}
        <path
          d="M26 22 C26 22, 60 20, 100 20 C140 20, 174 22, 174 22 L174 62 L26 62 Z"
          fill="url(#wmTop)"
          stroke="#FFFFFF"
          strokeWidth="1"
        />

        {/* Detergent Drawer Left */}
        <rect x="38" y="32" width="42" height="18" rx="6" fill="#FFFFFF" fillOpacity="0.9" stroke="#D8B4FE" strokeWidth="1" />
        <line x1="44" y1="41" x2="74" y2="41" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />

        {/* Center Cycle Dial */}
        <circle cx="104" cy="41" r="11" fill="#FFFFFF" stroke="#C084FC" strokeWidth="2" />
        <circle cx="104" cy="41" r="5" fill="#7C3AED" />
        <line x1="104" y1="33" x2="104" y2="38" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />

        {/* Digital Status Screen Right */}
        <rect x="124" y="32" width="40" height="18" rx="6" fill="#211747" />
        {/* LED Time text */}
        <circle cx="132" cy="41" r="2.5" fill="#10B981" />
        <rect x="139" y="38" width="18" height="6" rx="2" fill="#38BDF8" fillOpacity="0.8" />

        {/* Porthole Door Rim (Outer Ring) */}
        <circle cx="100" cy="132" r="54" fill="url(#drumOuter)" stroke="#FFFFFF" strokeWidth="3" />
        {/* Porthole Door Glass Border */}
        <circle cx="100" cy="132" r="44" fill="url(#drumInner)" />

        {/* Water / Agitation inside the drum */}
        {isWashing ? (
          <g className="animate-spin" style={{ transformOrigin: "100px 132px", animationDuration: "3s" }}>
            <circle cx="100" cy="132" r="36" fill="url(#waterFlow)" />
            {/* Swirling Waves / Bubbles */}
            <path
              d="M75 132 C75 118, 90 115, 100 125 C110 135, 125 132, 125 132 C125 146, 110 149, 100 139 C90 129, 75 132, 75 132 Z"
              fill="#FFFFFF"
              fillOpacity="0.5"
            />
            <circle cx="88" cy="120" r="3.5" fill="#FFFFFF" fillOpacity="0.8" />
            <circle cx="112" cy="144" r="4" fill="#FFFFFF" fillOpacity="0.8" />
            <circle cx="105" cy="115" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />
          </g>
        ) : isDrying ? (
          <g className="animate-spin" style={{ transformOrigin: "100px 132px", animationDuration: "5s" }}>
            <circle cx="100" cy="132" r="36" fill="#F43F5E" fillOpacity="0.35" />
            <circle cx="92" cy="125" r="5" fill="#FDA4AF" fillOpacity="0.7" />
            <circle cx="110" cy="138" r="4" fill="#FDE047" fillOpacity="0.7" />
          </g>
        ) : (
          <g>
            <circle cx="100" cy="132" r="36" fill="#312E81" fillOpacity="0.4" />
            <path d="M85 142 C90 130, 110 130, 115 142 Z" fill="#818CF8" fillOpacity="0.6" />
          </g>
        )}

        {/* Porthole Door Handle */}
        <rect x="146" y="125" width="5" height="15" rx="2.5" fill="#FFFFFF" stroke="#C084FC" strokeWidth="1" />

        {/* Glass Glare Reflection */}
        <path
          d="M72 104 C80 94, 94 88, 108 88 C112 88, 104 94, 92 100 C80 106, 74 112, 72 104 Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />

        {/* Floating Soap Bubbles */}
        <circle cx="18" cy="80" r="7" fill="#E0F2FE" fillOpacity="0.7" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="178" cy="95" r="9" fill="#E0F2FE" fillOpacity="0.7" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="168" cy="175" r="6" fill="#E0F2FE" fillOpacity="0.7" stroke="#FFFFFF" strokeWidth="1" />
      </svg>
    </div>
  );
}

