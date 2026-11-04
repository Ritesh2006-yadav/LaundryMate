import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading details...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
      <p className="text-gray-600 text-base font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
