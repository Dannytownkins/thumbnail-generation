import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
        {/* Spinning loader with cyan glow */}
        <div className="relative">
            <svg
                className="animate-spin h-20 w-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(0,217,255,0.8)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                ></circle>
                <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 animate-ping opacity-20">
                <svg
                    className="h-20 w-20 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                    ></circle>
                </svg>
            </div>
        </div>

        {/* Loading text with gradient */}
        <div className="space-y-2">
            <p className="text-xl font-black bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                Generating Your Masterpiece...
            </p>
            <p className="text-sm text-gray-500 font-medium animate-pulse">
                AI is cooking up something sick 🔥
            </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
    </div>
  );
};

export default Loader;