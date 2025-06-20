import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Carregando...' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16',
    large: 'h-24 w-24'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        {message && (
          <p className="text-gray-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;