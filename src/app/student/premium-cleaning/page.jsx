'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Feather,
  Flame,
  ArrowRight,
  Shirt,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { CLOTHING_CATALOG } from '@/lib/pricing';

export default function PremiumCleaningPage() {
  const premiumCategories = [
    {
      title: 'Delicate & Fine Fabrics',
      description: 'Silk, chiffon, embroidered kurtas, linen and satin handled with low-shear gentle cycles and natural fiber conditioners.',
      icon: Feather,
    },
    {
      title: 'Expensive Garments & Blazers',
      description: 'Woolen suits, coats, branded jackets and formal tuxedos cleaned with perchloroethylene-safe eco solvents.',
      icon: ShieldCheck,
    },
    {
      title: 'Heavy Stains & Soil Treatment',
      description: 'Pre-wash enzymatic treatment for coffee, tea, ink, oil, or food spills before standard dry cleaning.',
      icon: Flame,
    },
    {
      title: 'Special Garment Care',
      description: 'Hand-pressed with shape retainers, breathable garment covers, and custom anti-mildew cedar protection.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-2xl border border-amber-200 p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} /> Premium Care Section
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Specialized Dry Cleaning & Garment Care
          </h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Designed for delicate, expensive, or stubborn-stained clothes that require solvent-based cleaning, temperature control, and hand pressing.
          </p>

          <div className="mt-6">
            <Link
              href="/student/new-request?service=premium"
              className="inline-flex items-center gap-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
            >
              <span>Book Premium Cleaning Request</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {premiumCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Pricing Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Premium Dry Cleaning Price List
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Transparent, itemized pricing per garment including inspection and cover packaging
            </p>
          </div>

          <Link
            href="/student/new-request?service=premium"
            className="text-xs font-bold text-[#1b4332] hover:underline inline-flex items-center gap-1"
          >
            Create Order <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-px bg-gray-100">
          {CLOTHING_CATALOG.map((item) => (
            <div key={item.id} className="p-4 bg-white flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-900">{item.name}</p>
                <p className="text-[10px] text-gray-400">Standard wash: ₹{item.defaultPrice}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-amber-900 font-mono">
                  ₹{item.premiumPrice}
                </span>
                <span className="block text-[10px] font-semibold text-amber-800">
                  Dry Clean
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guarantee */}
      <div className="p-4 bg-[#e9f7ee] border border-[#b7e4c7] rounded-xl flex items-center gap-3 text-xs text-[#1b4332]">
        <CheckCircle2 size={20} className="shrink-0" />
        <div>
          <span className="font-bold">LaundryMate Garment Safety Guarantee:</span> Every premium garment is individually tagged, pre-photographed, and checked before return.
        </div>
      </div>
    </div>
  );
}
