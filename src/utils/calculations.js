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

export const calculateBudgetVariance = (budgetAmount, actualAmount) => {
  if (!budgetAmount || budgetAmount === 0) return 0;
  return ((actualAmount - budgetAmount) / budgetAmount) * 100;
};

export const calculateProfitLoss = (projectedRevenue, actualExpenses, budgetExpenses = 0) => {
  return {
    projectedProfit: projectedRevenue - budgetExpenses,
    actualProfit: projectedRevenue - actualExpenses,
    variance: (projectedRevenue - actualExpenses) - (projectedRevenue - budgetExpenses)
  };
};

export const getBudgetUtilization = (budgetAmount, actualAmount) => {
  if (!budgetAmount || budgetAmount === 0) return 0;
  return Math.min((actualAmount / budgetAmount) * 100, 100);
};

export const calculateProjectedProfit = (crops, budgets, currentExpenses) => {
  let totalProjectedRevenue = 0;
  let totalBudgetedExpenses = 0;
  let totalActualExpenses = 0;

  // Calculate projected revenue from crops
  crops.forEach(crop => {
    // Estimate revenue based on crop type (simplified calculation)
    const estimatedYield = getEstimatedYield(crop);
    const estimatedPrice = getEstimatedPrice(crop.name);
    totalProjectedRevenue += estimatedYield * estimatedPrice;
  });

  // Sum up budgeted and actual expenses
  budgets.forEach(budget => {
    totalBudgetedExpenses += budget.budgetAmount;
  });

  totalActualExpenses = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    projectedRevenue: totalProjectedRevenue,
    budgetedExpenses: totalBudgetedExpenses,
    actualExpenses: totalActualExpenses,
    projectedProfit: totalProjectedRevenue - totalBudgetedExpenses,
    actualProfit: totalProjectedRevenue - totalActualExpenses,
    variance: (totalProjectedRevenue - totalActualExpenses) - (totalProjectedRevenue - totalBudgetedExpenses)
  };
};

const getEstimatedYield = (crop) => {
  // Simplified yield estimation based on crop type and status
  const yieldMap = {
    'Tomatoes': 25000, // lbs per acre
    'Corn': 180, // bushels per acre
    'Soybeans': 50, // bushels per acre
    'Wheat': 60, // bushels per acre
    'Potatoes': 400 // cwt per acre
  };
  
  const baseYield = yieldMap[crop.name] || 100;
  const statusMultiplier = crop.status === 'harvesting' ? 1 : 0.8; // Reduce for non-harvest status
  
  return baseYield * statusMultiplier;
};

const getEstimatedPrice = (cropName) => {
  // Simplified price estimation per unit
  const priceMap = {
    'Tomatoes': 1.20, // per lb
    'Corn': 5.50, // per bushel
    'Soybeans': 13.00, // per bushel
    'Wheat': 7.20, // per bushel
    'Potatoes': 12.00 // per cwt
  };
  
  return priceMap[cropName] || 5.00;
};