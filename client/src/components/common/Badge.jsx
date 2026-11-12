import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Coloured badges with explicit text labels.
 * Strictly adheres to UI Rules:
 * Placed = grey, Collected = blue, Washing = orange, Ready = purple, Delivered = green
 * Premium = gold badge
 */

export const StatusBadge = ({ status }) => {
  const styles = {
    Placed: 'bg-gray-100 text-gray-800 border-gray-300',
    Collected: 'bg-blue-100 text-blue-800 border-blue-300',
    Washing: 'bg-orange-100 text-orange-800 border-orange-300',
    Ready: 'bg-purple-100 text-purple-800 border-purple-300',
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const styleClass = styles[status] || 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${styleClass}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
      {status || 'Unknown'}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const map = {
    'Unpaid': { label: 'Not paid', cls: 'bg-red-50 text-red-700 border-red-300' },
    'Partly Paid': { label: 'Partly paid', cls: 'bg-amber-50 text-amber-800 border-amber-300' },
    'Paid': { label: 'Paid in full', cls: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  };

  const current = map[status] || { label: status || 'Not paid', cls: 'bg-gray-100 text-gray-700 border-gray-300' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${current.cls}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
      {current.label}
    </span>
  );
};

export const PremiumBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-amber-950 border border-amber-500 shadow-sm">
      <Sparkles size={13} className="fill-amber-950" />
      PREMIUM
    </span>
  );
};

export const ComplaintBadge = ({ status }) => {
  const styles = {
    'Open': 'bg-red-100 text-red-800 border-red-300',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
    'Resolved': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  const cls = styles[status] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cls}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};
