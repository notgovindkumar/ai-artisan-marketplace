import React from 'react';
import { InputProps } from '../../types';
import { clsx } from 'clsx';

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
}) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200',
    {
      'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !error,
      'border-red-300 focus:border-red-500 focus:ring-red-500': error,
      'bg-gray-50 cursor-not-allowed': disabled,
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
