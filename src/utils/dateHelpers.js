import { format, isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';

export const formatDate = (date, formatString = 'MMM d, yyyy') => {
  try {
    return format(new Date(date), formatString);
  } catch (error) {
    console.warn('Invalid date format:', date);
    return 'Invalid Date';
  }
};

export const isDateInRange = (date, startDate, endDate) => {
  const checkDate = startOfDay(new Date(date));
  const start = startDate ? startOfDay(new Date(startDate)) : null;
  const end = endDate ? endOfDay(new Date(endDate)) : null;
  
  if (start && isBefore(checkDate, start)) return false;
  if (end && isAfter(checkDate, end)) return false;
  
  return true;
};

export const isOverdue = (dueDate) => {
  return isBefore(new Date(dueDate), startOfDay(new Date()));
};

export const getDaysUntilDue = (dueDate) => {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

export const getUpcomingTasks = (tasks, days = 7) => {
  const today = startOfDay(new Date());
  const futureDate = addDays(today, days);
  
  return tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return !task.completed && 
           isAfter(dueDate, today) && 
           isBefore(dueDate, futureDate);
  });
};