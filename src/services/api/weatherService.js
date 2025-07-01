// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock weather data generator
const generateWeatherData = (location) => {
  const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    location,
    temperature: Math.floor(Math.random() * 30) + 60, // 60-90°F
    condition: randomCondition,
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
    pressure: (Math.random() * 2 + 29).toFixed(2), // 29-31 inHg
    visibility: Math.floor(Math.random() * 5) + 8, // 8-12 miles
    feelsLike: null // Will be set to temperature + random variation
  };
};

const generateForecast = (location) => {
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];
  const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'rainy'];
  
  return days.map(day => ({
    day,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    high: Math.floor(Math.random() * 20) + 70, // 70-90°F
    low: Math.floor(Math.random() * 20) + 50, // 50-70°F
    precipitation: Math.floor(Math.random() * 100) // 0-100%
  }));
};

const weatherService = {
  async getCurrentWeather(location = 'Main Farm') {
    await delay(500);
    const weather = generateWeatherData(location);
    weather.feelsLike = weather.temperature + Math.floor(Math.random() * 6) - 3; // ±3°F
    return weather;
  },
  
  async getForecast(location = 'Main Farm') {
    await delay(400);
    return generateForecast(location);
  }
};

export default weatherService;