import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white bg-transparent',
    ghost: 'text-primary hover:bg-primary/10 bg-transparent',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <ApperIcon name="Loader2" className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <ApperIcon name={icon} className="w-4 h-4 mr-2" />
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <ApperIcon name={icon} className="w-4 h-4 ml-2" />
          )}
        </>
      )}
    </motion.button>
  );
};

export default Button;