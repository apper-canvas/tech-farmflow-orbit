import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import weatherService from '@/services/api/weatherService';
import farmService from '@/services/api/farmService';

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('Main Farm');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [weatherData, forecastData, farmsData] = await Promise.all([
        weatherService.getCurrentWeather(selectedFarm),
        weatherService.getForecast(selectedFarm),
        farmService.getAll()
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load weather data. Please try again.');
      console.error('Weather loading error:', err);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const getConditionColor = (condition) => {
    const colorMap = {
      sunny: 'text-yellow-600',
      cloudy: 'text-gray-600',
      rainy: 'text-blue-600',
      stormy: 'text-purple-600',
      snowy: 'text-blue-400',
      partly_cloudy: 'text-orange-500',
    };
    return colorMap[condition] || 'text-yellow-600';
  };
  
  useEffect(() => {
    loadWeatherData();
  }, [selectedFarm]);
  
  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={loadWeatherData} />;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weather Forecast</h1>
          <p className="text-gray-600 mt-2">Stay informed about weather conditions for your farms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Location:</label>
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="input-field w-48"
          >
            <option value="Main Farm">Main Farm</option>
            {farms.map(farm => (
              <option key={farm.Id} value={farm.name}>{farm.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Current Weather */}
      {currentWeather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getWeatherGradient(currentWeather.condition)} flex items-center justify-center shadow-elevated`}>
                <ApperIcon name={getWeatherIcon(currentWeather.condition)} className="w-12 h-12 text-white" />
              </div>
              
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {currentWeather.temperature}°F
                </h2>
                <p className={`text-lg font-medium capitalize mb-1 ${getConditionColor(currentWeather.condition)}`}>
                  {currentWeather.condition.replace('_', ' ')}
                </p>
                <p className="text-gray-600">
                  Feels like {currentWeather.feelsLike || currentWeather.temperature}°F
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Droplets" className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Humidity</p>
                    <p className="font-semibold text-gray-900">{currentWeather.humidity}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Wind" className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wind Speed</p>
                    <p className="font-semibold text-gray-900">{currentWeather.windSpeed} mph</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Gauge" className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pressure</p>
                    <p className="font-semibold text-gray-900">{currentWeather.pressure || '30.12'} inHg</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Eye" className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Visibility</p>
                    <p className="font-semibold text-gray-900">{currentWeather.visibility || '10'} mi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 5-Day Forecast */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">5-Day Forecast</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card text-center"
            >
              <h3 className="font-semibold text-gray-900 mb-4">{day.day}</h3>
              
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getWeatherGradient(day.condition)} flex items-center justify-center`}>
                <ApperIcon name={getWeatherIcon(day.condition)} className="w-8 h-8 text-white" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-center gap-2">
                  <span className="font-bold text-gray-900">{day.high}°</span>
                  <span className="text-gray-500">{day.low}°</span>
                </div>
                
                <p className={`text-sm capitalize ${getConditionColor(day.condition)}`}>
                  {day.condition.replace('_', ' ')}
                </p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <ApperIcon name="Droplets" className="w-4 h-4" />
                  <span>{day.precipitation || 0}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Weather Alerts & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-elevated"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Weather Alerts</h3>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <ApperIcon name="CloudRain" className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Rain Expected</span>
              </div>
              <p className="text-sm text-blue-700">
                Rain forecasted for tomorrow. Consider delaying any scheduled irrigation.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <ApperIcon name="Sun" className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Perfect Growing Weather</span>
              </div>
              <p className="text-sm text-green-700">
                Ideal conditions for crop growth over the next few days.
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-elevated"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Lightbulb" className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Farming Tips</h3>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <ApperIcon name="Droplets" className="w-4 h-4 text-blue-500 mt-0.5" />
              <p>Current humidity levels are ideal for most crops. Monitor for fungal issues if humidity rises above 80%.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <ApperIcon name="Wind" className="w-4 h-4 text-gray-500 mt-0.5" />
              <p>Light winds are perfect for natural pollination. Consider protective measures if winds exceed 15 mph.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <ApperIcon name="Sun" className="w-4 h-4 text-yellow-500 mt-0.5" />
              <p>Sunny conditions are great for photosynthesis. Ensure adequate water supply during hot periods.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Weather;