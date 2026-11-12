"use client";

import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse select-none" aria-busy="true" aria-label="Loading admin portal">
      {/* Universal 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-2xl border border-[#E5E3F0] space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-20 h-3 bg-gray-200/80 rounded" />
              <div className="w-8 h-8 rounded-xl bg-purple-100/60" />
            </div>
            <div className="h-6 w-14 bg-gray-200 rounded" />
            <div className="h-2.5 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E3F0] shadow-soft flex items-center justify-between gap-4">
        <div className="h-9 w-64 bg-gray-100 rounded-xl" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-gray-100 rounded-xl" />
          <div className="h-9 w-24 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Main Content Body Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E3F0] space-y-4 shadow-soft">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF8]">
          <div className="h-5 w-44 bg-purple-100/70 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-50/80 rounded-2xl border border-gray-100/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
