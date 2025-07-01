import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Error = ({ message = "Something went wrong", onRetry, showRetry = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <div className="card-elevated max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Oops! Something went wrong
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4" />
            Try Again
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Error;