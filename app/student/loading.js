"use client";

import React from "react";

export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none" aria-busy="true" aria-label="Loading page content">
      {/* Top action/info bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-purple-100/70 rounded-lg" />
          <div className="h-4 w-72 bg-purple-50 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-purple-100/60 rounded-xl hidden sm:block" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-[#E5E3F0] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-gray-200/80 rounded" />
              <div className="w-8 h-8 rounded-xl bg-purple-50" />
            </div>
            <div className="h-6 w-12 bg-purple-100/80 rounded" />
            <div className="h-2.5 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E3F0] space-y-4 shadow-soft">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF8]">
          <div className="h-5 w-40 bg-purple-100/70 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-gray-50/80 rounded-2xl border border-gray-100/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
