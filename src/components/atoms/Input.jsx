import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  className = '',
  accept,
  multiple = false,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
<input
          type={type}
          placeholder={placeholder}
          value={type === 'file' ? undefined : value}
          onChange={onChange}
          accept={type === 'file' ? accept : undefined}
          multiple={type === 'file' ? multiple : undefined}
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error flex items-center gap-1">
          <ApperIcon name="AlertCircle" className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;