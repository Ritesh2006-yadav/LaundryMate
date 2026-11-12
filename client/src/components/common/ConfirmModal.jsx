import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Please Confirm',
  message = 'Are you sure you want to make this change?',
  confirmText = 'Yes, Continue',
  cancelText = 'Cancel',
  confirmStyle = 'primary', // 'primary' | 'danger'
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <AlertCircle size={26} />
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-base mb-8 leading-relaxed">{message}</p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-1/2 py-3 px-5 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-1/2 py-3 px-5 text-base font-semibold text-white rounded-xl shadow-md transition-colors ${
              confirmStyle === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {loading ? 'Updating...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
