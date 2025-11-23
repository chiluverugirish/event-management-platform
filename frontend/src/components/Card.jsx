import React from 'react';

/**
 * Reusable Card Component
 * @param {string} title - Card title
 * @param {boolean} hoverable - Add hover effect
 */
const Card = ({ 
  children, 
  title, 
  subtitle,
  hoverable = false,
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6
        ${hoverable ? 'hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
