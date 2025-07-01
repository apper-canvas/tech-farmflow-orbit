import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import StatCard from '@/components/molecules/StatCard';
import QuickAction from '@/components/molecules/QuickAction';
import WeatherCard from '@/components/molecules/WeatherCard';
import TaskItem from '@/components/molecules/TaskItem';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';
import taskService from '@/services/api/taskService';
import expenseService from '@/services/api/expenseService';
import weatherService from '@/services/api/weatherService';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Dashboard data states
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Supporting data
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [farmsData, cropsData, tasksData, expensesData, weatherData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        expenseService.getAll(),
        weatherService.getCurrentWeather('Main Farm')
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
      
      // Calculate stats
      const activeCrops = cropsData.filter(crop => crop.status === 'growing').length;
      const pendingTasks = tasksData.filter(task => !task.completed).length;
      const monthlyExpenses = expensesData
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          const currentMonth = new Date();
          return expenseDate.getMonth() === currentMonth.getMonth() && 
                 expenseDate.getFullYear() === currentMonth.getFullYear();
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      setStats({
        totalFarms: farmsData.length,
        activeCrops,
        pendingTasks,
        monthlyExpenses
      });
      
      // Get recent tasks (due within 7 days or overdue)
      const upcomingTasks = tasksData
        .filter(task => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return dueDate <= sevenDaysFromNow && !task.completed;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
      
      setRecentTasks(upcomingTasks);
      setWeather(weatherData);
      
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTaskToggle = async (taskId) => {
    try {
      const task = recentTasks.find(t => t.Id === taskId);
      if (!task) return;
      
      await taskService.update(taskId, { ...task, completed: !task.completed });
      setRecentTasks(prev => prev.map(t => 
        t.Id === taskId ? { ...t, completed: !t.completed } : t
      ));
      
      if (stats) {
        setStats(prev => ({
          ...prev,
          pendingTasks: prev.pendingTasks + (task.completed ? 1 : -1)
        }));
      }
      
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  if (loading) return <Loading rows={6} />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to FarmFlow
            </h2>
            <p className="text-gray-600">
              Here's an overview of your farm operations today.
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              🌱
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farms"
          value={stats?.totalFarms || 0}
          icon="MapPin"
          color="primary"
          onClick={() => navigate('/farms')}
        />
        <StatCard
          title="Active Crops"
          value={stats?.activeCrops || 0}
          icon="Sprout"
          color="secondary"
          onClick={() => navigate('/crops')}
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          icon="CheckSquare"
          color="warning"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${stats?.monthlyExpenses?.toLocaleString() || '0'}`}
          icon="DollarSign"
          color="accent"
          onClick={() => navigate('/expenses')}
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          
          <div className="space-y-4">
            <QuickAction
              title="Add New Farm"
              description="Register a new farm property"
              icon="MapPin"
              onClick={() => navigate('/farms')}
              color="primary"
            />
            <QuickAction
              title="Plant New Crop"
              description="Record a new crop planting"
              icon="Sprout"
              onClick={() => navigate('/crops')}
              color="secondary"
            />
            <QuickAction
              title="Create Task"
              description="Schedule farming activities"
              icon="Plus"
              onClick={() => navigate('/tasks')}
              color="accent"
            />
          </div>
          
          {/* Weather Card */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Weather</h3>
            <WeatherCard weather={weather} location="Main Farm" />
          </div>
        </motion.div>
        
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Upcoming Tasks</h3>
            <button
              onClick={() => navigate('/tasks')}
              className="text-primary hover:text-primary/80 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <Empty
                title="No upcoming tasks"
                description="You're all caught up! Create a new task to get started."
                icon="CheckCircle"
                actionLabel="Create Task"
                onAction={() => navigate('/tasks')}
              />
            ) : (
              recentTasks.map((task, index) => (
                <motion.div
                  key={task.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TaskItem
                    task={task}
                    onToggle={handleTaskToggle}
                    onEdit={() => navigate('/tasks')}
                    onDelete={() => navigate('/tasks')}
                    crops={crops}
                    farms={farms}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;