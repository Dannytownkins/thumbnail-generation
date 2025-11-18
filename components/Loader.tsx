
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center py-12">
        <div className="relative">
            <svg
                className="animate-spin h-20 w-20 text-canam-orange"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                ></circle>
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            <div className="absolute inset-0 animate-ping opacity-20">
                <svg
                    className="h-20 w-20 text-canam-orange"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    ></circle>
                </svg>
            </div>
        </div>
        <div>
            <p className="text-white text-xl font-bold mb-2">✨ Generating your masterpiece...</p>
            <p className="text-slate-400 text-sm">AI is working its magic. This may take 10-30 seconds.</p>
        </div>
        <div className="flex gap-2">
            <div className="w-2 h-2 bg-canam-orange rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-canam-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-canam-orange rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
    </div>
  );
};

export default Loader;
