import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  onClick 
}) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/10 text-primary',
    secondary: 'from-secondary/20 to-secondary/10 text-secondary',
    accent: 'from-accent/20 to-accent/10 text-accent',
    success: 'from-success/20 to-success/10 text-success',
    warning: 'from-warning/20 to-warning/10 text-warning',
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`card cursor-pointer ${onClick ? 'hover:shadow-elevated' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-gray-500'}`}>
              <ApperIcon 
                name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                className="w-4 h-4" 
              />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <ApperIcon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;