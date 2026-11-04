import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    'Request Submitted': 'bg-blue-50 text-blue-700 border-blue-200',
    'Placed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Pickup Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
    'Clothes Collected': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Collected': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Processing': 'bg-purple-50 text-purple-700 border-purple-200',
    'Washing': 'bg-purple-50 text-purple-700 border-purple-200',
    'Ready for Delivery': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Ready': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Out for Delivery': 'bg-teal-50 text-teal-700 border-teal-200',
    'Delivered': 'bg-[#e9f7ee] text-[#1b4332] border-[#b7e4c7]',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  };

  const currentStyle = styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};

export const PaymentBadge = ({ status }) => {
  const styles = {
    'Paid': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Partially Paid': 'bg-amber-50 text-amber-800 border-amber-200',
    'Pending': 'bg-gray-100 text-gray-700 border-gray-300',
    'Unpaid': 'bg-red-50 text-red-700 border-red-200',
    'Failed': 'bg-red-100 text-red-800 border-red-300',
  };

  const currentStyle = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {status}
    </span>
  );
};

export const ServiceBadge = ({ isPremium }) => {
  if (isPremium) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
        ✨ Premium Dry Clean
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      Regular Wash
    </span>
  );
};
