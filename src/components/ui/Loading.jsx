import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ rows = 3, showHeader = true }) => {
  return (
    <div className="animate-fade-in">
      {showHeader && (
        <div className="mb-8">
          <div className="skeleton h-8 w-64 rounded-lg mb-4"></div>
          <div className="skeleton h-4 w-96 rounded"></div>
        </div>
      )}
      
      <div className="grid gap-6">
        {Array.from({ length: rows }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton h-6 w-48 rounded"></div>
              <div className="skeleton h-8 w-20 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-4 w-3/4 rounded"></div>
              <div className="skeleton h-4 w-1/2 rounded"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Loading;