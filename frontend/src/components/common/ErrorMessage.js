import React from 'react';

const ErrorMessage = ({ error, onClear }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center">
      {error}
      <button onClick={onClear} className="ml-4 underline">Fechar</button>
    </div>
  );
};

export default ErrorMessage;