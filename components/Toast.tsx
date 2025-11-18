import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-600 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-600 text-red-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-600 text-yellow-100';
      case 'info':
      default:
        return 'bg-blue-900/90 border-blue-600 text-blue-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm ${getTypeStyles()} animate-slide-in-right`}
      role="alert"
    >
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 font-bold">
        {getIcon()}
      </div>
      <div className="flex-1 text-sm">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
