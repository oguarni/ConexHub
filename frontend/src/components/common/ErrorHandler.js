import React from 'react';

const ErrorHandler = ({ error, className = '' }) => {
  if (!error) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded ${className}`}>
      {error}
    </div>
  );
};

export default ErrorHandler;