import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item.", 
  icon = "Inbox",
  actionLabel = "Add New",
  onAction 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name={icon} className="w-10 h-10 text-primary" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>
        
        {onAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Empty;