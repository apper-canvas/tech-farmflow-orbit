import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const TaskItem = ({ task, onToggle, onEdit, onDelete, crops, farms }) => {
  const crop = crops.find(c => c.Id === task.cropId);
  const farm = farms.find(f => f.Id === task.farmId);
  
  const getTaskTypeIcon = (type) => {
    const iconMap = {
      watering: 'Droplets',
      fertilizing: 'Leaf',
      harvesting: 'Scissors',
      planting: 'Sprout',
      weeding: 'Trash2',
      inspection: 'Eye',
    };
    return iconMap[type] || 'CheckCircle';
  };
  
  const getTaskTypeColor = (type) => {
    const colorMap = {
      watering: 'info',
      fertilizing: 'success',
      harvesting: 'warning',
      planting: 'secondary',
      weeding: 'error',
      inspection: 'primary',
    };
    return colorMap[type] || 'default';
  };
  
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${task.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-l-4 border-error' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggle(task.Id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed 
              ? 'bg-success border-success text-white' 
              : 'border-gray-300 hover:border-success'
          }`}
        >
          {task.completed && <ApperIcon name="Check" className="w-3 h-3" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getTaskTypeColor(task.type)} size="sm">
                  <ApperIcon name={getTaskTypeIcon(task.type)} className="w-3 h-3 mr-1" />
                  {task.type}
                </Badge>
                {isOverdue && (
                  <Badge variant="error" size="sm">
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              >
                <ApperIcon name="Edit2" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.Id)}
                className="p-2 text-gray-400 hover:text-error transition-colors rounded-lg hover:bg-error/10"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ApperIcon name="Calendar" className="w-4 h-4" />
              <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            </div>
            
            {crop && (
              <div className="flex items-center gap-2">
                <ApperIcon name="Sprout" className="w-4 h-4" />
                <span>{crop.name} - {crop.variety}</span>
              </div>
            )}
            
            {farm && (
              <div className="flex items-center gap-2">
                <ApperIcon name="MapPin" className="w-4 h-4" />
                <span>{farm.name}</span>
              </div>
            )}
            
            {task.notes && (
              <div className="flex items-start gap-2">
                <ApperIcon name="FileText" className="w-4 h-4 mt-0.5" />
                <span>{task.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;