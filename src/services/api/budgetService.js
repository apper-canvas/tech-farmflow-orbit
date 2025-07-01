import budgetsData from '@/services/mockData/budgets.json';

// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let budgets = [...budgetsData];

const budgetService = {
  async getAll() {
    await delay(320);
    return [...budgets];
  },
  
  async getById(id) {
    await delay(200);
    const budget = budgets.find(b => b.Id === id);
    if (!budget) {
      throw new Error('Budget not found');
    }
    return { ...budget };
  },
  
  async create(budgetData) {
    await delay(450);
    const newId = Math.max(...budgets.map(b => b.Id), 0) + 1;
    const newBudget = {
      Id: newId,
      ...budgetData,
      createdAt: new Date().toISOString()
    };
    budgets.push(newBudget);
    return { ...newBudget };
  },
  
  async update(id, budgetData) {
    await delay(380);
    const index = budgets.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error('Budget not found');
    }
    budgets[index] = { ...budgets[index], ...budgetData };
    return { ...budgets[index] };
  },
  
  async delete(id) {
    await delay(280);
    const index = budgets.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error('Budget not found');
    }
    budgets.splice(index, 1);
    return true;
  },
  
  async getBudgetsByFarm(farmId) {
    await delay(250);
    const farmBudgets = budgets.filter(budget => budget.farmId === farmId);
    return [...farmBudgets];
  },
  
  async getBudgetsByPeriod(period, startDate, endDate) {
    await delay(220);
    let filteredBudgets = budgets.filter(budget => budget.period === period);
    
    if (startDate || endDate) {
      filteredBudgets = filteredBudgets.filter(budget => {
        const budgetStart = new Date(budget.startDate);
        if (startDate && budgetStart < new Date(startDate)) return false;
        if (endDate && budgetStart > new Date(endDate)) return false;
        return true;
      });
    }
    
    return [...filteredBudgets];
  }
};

export default budgetService;