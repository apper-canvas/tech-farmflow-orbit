import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  className = '',
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
        <select
          value={value}
          onChange={onChange}
          className={`input-field appearance-none pr-10 ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ApperIcon name="ChevronDown" className="w-5 h-5 text-gray-400" />
        </div>
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

export default Select;