import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const QuickAction = ({ title, description, icon, onClick, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/20',
    secondary: 'from-secondary/10 to-primary/10 hover:from-secondary/20 hover:to-primary/20 border-secondary/20',
    accent: 'from-accent/10 to-warning/10 hover:from-accent/20 hover:to-warning/20 border-accent/20',
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} border-2 transition-all duration-200 text-left hover:shadow-elevated`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-card">
          <ApperIcon name={icon} className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        <ApperIcon name="ChevronRight" className="w-5 h-5 text-gray-400" />
      </div>
    </motion.button>
  );
};

export default QuickAction;