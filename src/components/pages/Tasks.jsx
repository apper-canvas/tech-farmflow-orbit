import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import TaskItem from '@/components/molecules/TaskItem';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import taskService from '@/services/api/taskService';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  
// Form state
  const [formData, setFormData] = useState({
    farmId: '',
    cropId: '',
    title: '',
    type: '',
    dueDate: '',
    notes: '',
    notificationPreferences: {
      emailEnabled: false,
      inAppEnabled: true,
      reminderTime: '24' // hours before due date
    }
  });
  
  const taskTypes = [
    { value: 'watering', label: 'Watering' },
    { value: 'fertilizing', label: 'Fertilizing' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'planting', label: 'Planting' },
    { value: 'weeding', label: 'Weeding' },
    { value: 'inspection', label: 'Inspection' }
  ];
  
  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      setTasks(tasksData);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Tasks loading error:', err);
    } finally {
      setLoading(false);
    }
  };
  
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.title || !formData.type || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.notificationPreferences.reminderTime && 
        (isNaN(formData.notificationPreferences.reminderTime) || 
         formData.notificationPreferences.reminderTime < 0)) {
      toast.error('Please enter a valid reminder time');
      return;
    }
    
try {
      const taskData = {
        ...formData,
        farmId: parseInt(formData.farmId),
        cropId: formData.cropId ? parseInt(formData.cropId) : null,
        completed: false,
        notificationPreferences: {
          ...formData.notificationPreferences,
          reminderTime: parseInt(formData.notificationPreferences.reminderTime)
        }
      };
      
      if (editingTask) {
        await taskService.update(editingTask.Id, { ...taskData, completed: editingTask.completed });
        setTasks(prev => prev.map(task => 
          task.Id === editingTask.Id ? { ...task, ...taskData, completed: editingTask.completed } : task
        ));
        toast.success('Task updated successfully');
      } else {
        const newTask = await taskService.create(taskData);
        setTasks(prev => [...prev, newTask]);
        toast.success('Task created successfully');
      }
      
      resetForm();
    } catch (err) {
      toast.error('Failed to save task');
      console.error('Task save error:', err);
    }
  };
  
  const handleToggle = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;
      
      const updatedTask = { ...task, completed: !task.completed };
      await taskService.update(taskId, updatedTask);
      setTasks(prev => prev.map(t => 
        t.Id === taskId ? updatedTask : t
      ));
      
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };
  
const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      farmId: task.farmId.toString(),
      cropId: task.cropId ? task.cropId.toString() : '',
      title: task.title,
      type: task.type,
      dueDate: task.dueDate,
      notes: task.notes || '',
      notificationPreferences: {
        emailEnabled: task.notificationPreferences?.emailEnabled || false,
        inAppEnabled: task.notificationPreferences?.inAppEnabled || true,
        reminderTime: task.notificationPreferences?.reminderTime?.toString() || '24'
      }
    });
    setShowForm(true);
  };
  
  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
      console.error('Task delete error:', err);
    }
  };
  
const resetForm = () => {
    setFormData({
      farmId: '',
      cropId: '',
      title: '',
      type: '',
      dueDate: '',
      notes: '',
      notificationPreferences: {
        emailEnabled: false,
        inAppEnabled: true,
        reminderTime: '24'
      }
    });
    setShowForm(false);
    setEditingTask(null);
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'overdue') {
      return !task.completed && new Date(task.dueDate) < new Date();
    }
    return true;
  });
  
  const availableCrops = crops.filter(crop => 
    formData.farmId ? crop.farmId === parseInt(formData.farmId) : true
  );
  
  useEffect(() => {
    loadData();
  }, []);
  
  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={loadData} />;
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">Schedule and track your farming activities</p>
        </div>
        
        <div className="flex gap-3">
          <Select
            options={filterOptions}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40"
          />
          <Button
            onClick={() => setShowForm(true)}
            icon="Plus"
            variant="primary"
          >
            Add Task
          </Button>
        </div>
      </div>
      
      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-elevated w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Task Title"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Farm"
                    options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
                    value={formData.farmId}
                    onChange={(e) => setFormData(prev => ({ ...prev, farmId: e.target.value, cropId: '' }))}
                    placeholder="Select a farm"
                    required
                  />
                  
                  <Select
                    label="Crop (Optional)"
                    options={availableCrops.map(crop => ({ 
                      value: crop.Id.toString(), 
                      label: `${crop.name} ${crop.variety ? `- ${crop.variety}` : ''}` 
                    }))}
                    value={formData.cropId}
                    onChange={(e) => setFormData(prev => ({ ...prev, cropId: e.target.value }))}
                    placeholder="Select a crop"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Task Type"
                    options={taskTypes}
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="Select task type"
                    required
                  />
                  
                  <Input
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
</div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Add any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field min-h-[100px] resize-vertical"
                  />
                </div>
                
                {/* Notification Preferences */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="inAppEnabled"
                        checked={formData.notificationPreferences.inAppEnabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            inAppEnabled: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="inAppEnabled" className="text-sm text-gray-700 flex items-center gap-2">
                        <ApperIcon name="Bell" className="w-4 h-4" />
                        In-app notifications
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="emailEnabled"
                        checked={formData.notificationPreferences.emailEnabled}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            emailEnabled: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="emailEnabled" className="text-sm text-gray-700 flex items-center gap-2">
                        <ApperIcon name="Mail" className="w-4 h-4" />
                        Email notifications
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 flex items-center gap-2">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        Remind me
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={formData.notificationPreferences.reminderTime}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            reminderTime: e.target.value
                          }
                        }))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm"
                      />
                      <span className="text-sm text-gray-600">hours before due date</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Empty
            title={filter === 'all' ? 'No tasks created' : `No ${filter} tasks`}
            description={filter === 'all' 
              ? 'Start by creating your first farming task to stay organized.' 
              : `No tasks match the ${filter} filter. Try adjusting your filter or create a new task.`}
            icon="CheckSquare"
            actionLabel="Create Task"
            onAction={() => setShowForm(true)}
          />
        ) : (
          filteredTasks
            .sort((a, b) => {
              // Sort by: incomplete first, then by due date
              if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
              }
              return new Date(a.dueDate) - new Date(b.dueDate);
            })
            .map((task, index) => (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <TaskItem
                  task={task}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  crops={crops}
                  farms={farms}
                />
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
};

export default Tasks;