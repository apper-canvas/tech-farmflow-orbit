import React from 'react';
import { useLocation } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const titleMap = {
      '/': 'Dashboard',
      '/farms': 'Farms',
      '/crops': 'Crops',
      '/tasks': 'Tasks',
      '/expenses': 'Expenses',
      '/weather': 'Weather',
    };
    return titleMap[location.pathname] || 'FarmFlow';
  };
  
  const getPageDescription = () => {
    const descriptionMap = {
      '/': 'Overview of your farm operations',
      '/farms': 'Manage your farm properties',
      '/crops': 'Track your planted crops',
      '/tasks': 'Manage farming tasks and activities',
      '/expenses': 'Track farm-related expenses',
      '/weather': 'Weather forecast for your farms',
    };
    return descriptionMap[location.pathname] || '';
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
          >
            <ApperIcon name="Menu" className="w-6 h-6" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            {getPageDescription() && (
              <p className="text-gray-600 mt-1">{getPageDescription()}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-success/10 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
          
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;