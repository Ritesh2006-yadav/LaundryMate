import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading details...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-8 h-8 text-[#B95E19] animate-spin mb-3" />
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );
}
