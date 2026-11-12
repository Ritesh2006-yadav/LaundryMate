import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No orders found',
  description = 'Try clearing your filters or checking back in a little while.',
  actionButton = null,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8 shadow-sm">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-base mb-6 leading-relaxed">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
