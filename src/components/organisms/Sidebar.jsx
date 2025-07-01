import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'Home' },
    { name: 'Farms', href: '/farms', icon: 'MapPin' },
    { name: 'Crops', href: '/crops', icon: 'Sprout' },
    { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
    { name: 'Expenses', href: '/expenses', icon: 'DollarSign' },
    { name: 'Weather', href: '/weather', icon: 'CloudSun' },
  ];
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-elevated lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <ApperIcon name="Sprout" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900">FarmFlow</h1>
              <p className="text-xs text-gray-500">Agriculture Management</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <ApperIcon name={item.icon} className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;