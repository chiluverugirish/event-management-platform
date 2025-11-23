import React from 'react';

/**
 * Input Field Component
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} type - Input type
 */
const Input = ({ 
  label, 
  error, 
  type = 'text',
  placeholder,
  className = '',
  required = false,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 border rounded-lg transition-all
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
