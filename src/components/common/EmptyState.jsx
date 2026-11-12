import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
      <div className="w-12 h-12 rounded-full bg-[#FFF1E5] text-[#B95E19] flex items-center justify-center mb-3">
        <PackageOpen size={24} />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
