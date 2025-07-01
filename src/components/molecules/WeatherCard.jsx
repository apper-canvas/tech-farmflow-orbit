import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const WeatherCard = ({ weather, location }) => {
  const getWeatherIcon = (condition) => {
    const iconMap = {
      sunny: 'Sun',
      cloudy: 'Cloud',
      rainy: 'CloudRain',
      stormy: 'CloudLightning',
      snowy: 'CloudSnow',
      partly_cloudy: 'CloudSun',
    };
    return iconMap[condition] || 'Sun';
  };
  
  const getWeatherGradient = (condition) => {
    const gradientMap = {
      sunny: 'from-yellow-400 to-orange-500',
      cloudy: 'from-gray-400 to-gray-600',
      rainy: 'from-blue-400 to-blue-600',
      stormy: 'from-purple-500 to-gray-700',
      snowy: 'from-blue-200 to-white',
      partly_cloudy: 'from-yellow-300 to-blue-400',
    };
    return gradientMap[condition] || 'from-yellow-400 to-orange-500';
  };
  
  if (!weather) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-4 w-32 rounded"></div>
          <div className="skeleton h-16 w-full rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Current Weather</h3>
          <p className="text-sm text-gray-600">{location}</p>
        </div>
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getWeatherGradient(weather.condition)} flex items-center justify-center`}>
          <ApperIcon name={getWeatherIcon(weather.condition)} className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-gray-900">{weather.temperature}°F</p>
          <p className="text-sm text-gray-600 capitalize">{weather.condition.replace('_', ' ')}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <ApperIcon name="Droplets" className="w-4 h-4 text-blue-500" />
            <span>{weather.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Wind" className="w-4 h-4 text-gray-500" />
            <span>{weather.windSpeed} mph</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;