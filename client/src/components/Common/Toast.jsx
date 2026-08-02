import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce sm:animate-none">
      <div className={`
        flex items-center space-x-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 max-w-sm
        ${isSuccess 
          ? 'bg-emerald-50/95 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50/95 border-rose-100 text-rose-800'}
      `}>
        {isSuccess ? (
          <FiCheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
        ) : (
          <FiAlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
        )}
        
        <p className="text-sm font-medium pr-2">{message}</p>
        
        <button
          onClick={onClose}
          className={`
            ml-auto flex h-6 w-6 items-center justify-center rounded-lg hover:bg-white/50 transition-colors
            ${isSuccess ? 'text-emerald-500 hover:text-emerald-700' : 'text-rose-500 hover:text-rose-700'}
          `}
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
