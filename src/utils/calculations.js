export const calculateTotalExpenses = (expenses, filters = {}) => {
  let filteredExpenses = [...expenses];
  
  // Apply date filters
  if (filters.startDate || filters.endDate) {
    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      if (filters.startDate && expenseDate < new Date(filters.startDate)) return false;
      if (filters.endDate && expenseDate > new Date(filters.endDate)) return false;
      return true;
    });
  }
  
  // Apply category filter
  if (filters.category) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.category === filters.category
    );
  }
  
  // Apply farm filter
  if (filters.farmId) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.farmId === filters.farmId
    );
  }
  
  return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
};

export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
        expenses: []
      };
    }
    acc[category].total += expense.amount;
    acc[category].count += 1;
    acc[category].expenses.push(expense);
    return acc;
  }, {});
};

export const calculateCropGrowthDays = (plantingDate, currentDate = new Date()) => {
  const planted = new Date(plantingDate);
  const current = new Date(currentDate);
  const diffTime = Math.abs(current - planted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateDaysToHarvest = (expectedHarvest, currentDate = new Date()) => {
  const harvest = new Date(expectedHarvest);
  const current = new Date(currentDate);
  const diffTime = harvest - current;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getTaskCompletionRate = (tasks) => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
};