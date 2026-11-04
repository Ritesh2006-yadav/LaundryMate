import React from 'react';
import {
  FileText,
  CalendarCheck,
  PackageCheck,
  RotateCw,
  CheckCircle,
  Truck,
  Sparkles,
  XCircle,
} from 'lucide-react';

const STEPS = [
  { key: 'Request Submitted', label: 'Request Submitted', icon: FileText },
  { key: 'Pickup Scheduled', label: 'Pickup Scheduled', icon: CalendarCheck },
  { key: 'Clothes Collected', label: 'Clothes Collected', icon: PackageCheck },
  { key: 'Processing', label: 'Processing', icon: RotateCw },
  { key: 'Ready for Delivery', label: 'Ready for Delivery', icon: Sparkles },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackingTimeline({ status, estimatedDelivery, statusHistory = [] }) {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Order Cancelled</h4>
          <p className="text-xs text-red-600 mt-0.5">
            This laundry request was cancelled. Contact the hostel laundry staff for inquiries.
          </p>
        </div>
      </div>
    );
  }

  // Normalize legacy statuses
  let normalizedStatus = status;
  if (status === 'Placed') normalizedStatus = 'Request Submitted';
  if (status === 'Collected') normalizedStatus = 'Clothes Collected';
  if (status === 'Washing') normalizedStatus = 'Processing';
  if (status === 'Ready') normalizedStatus = 'Ready for Delivery';

  const currentIndex = STEPS.findIndex((s) => s.key === normalizedStatus);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Order Progress
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Stage {Math.max(currentIndex + 1, 1)} of {STEPS.length}
          </p>
        </div>
        {estimatedDelivery && (
          <div className="inline-flex items-center gap-2 bg-[#e9f7ee] text-[#1b4332] px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span>Estimated Delivery:</span>
            <span className="font-bold underline">{estimatedDelivery}</span>
          </div>
        )}
      </div>

      {/* Horizontal Desktop / Vertical Mobile Timeline */}
      <div className="hidden lg:grid grid-cols-7 gap-2 relative">
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-1 -z-10 transition-colors ${
                    idx <= currentIndex ? 'bg-[#1b4332]' : 'bg-gray-200'
                  }`}
                />
              )}

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#1b4332] text-white ring-4 ring-[#b7e4c7] shadow-sm'
                    : isDone
                    ? 'bg-[#1b4332] text-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                <Icon size={16} />
              </div>

              <span
                className={`text-xs mt-2 font-medium leading-tight ${
                  isCurrent
                    ? 'text-[#1b4332] font-bold'
                    : isDone
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical Mobile Timeline */}
      <div className="lg:hidden space-y-4">
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          // Find timestamp if in history
          const historyItem = statusHistory.find((h) => h.newStatus === step.key);

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-[#1b4332] text-white ring-4 ring-[#b7e4c7]'
                    : isDone
                    ? 'bg-[#1b4332] text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-[#1b4332] font-bold'
                        : isDone
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {historyItem && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(historyItem.changedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                {isCurrent && (
                  <p className="text-[11px] text-[#1b4332] font-medium mt-0.5">
                    Currently in progress
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
