import expensesData from '@/services/mockData/expenses.json';

// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let expenses = [...expensesData];

const expenseService = {
  async getAll() {
    await delay(280);
    return [...expenses];
  },
  
  async getById(id) {
    await delay(200);
    const expense = expenses.find(e => e.Id === id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return { ...expense };
  },
  
  async create(expenseData) {
    await delay(400);
    const newId = Math.max(...expenses.map(e => e.Id), 0) + 1;
    const newExpense = {
      Id: newId,
      ...expenseData
    };
    expenses.push(newExpense);
    return { ...newExpense };
  },
  
  async update(id, expenseData) {
    await delay(350);
    const index = expenses.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error('Expense not found');
    }
    expenses[index] = { ...expenses[index], ...expenseData };
    return { ...expenses[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = expenses.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error('Expense not found');
    }
    expenses.splice(index, 1);
    return true;
  }
};

export default expenseService;