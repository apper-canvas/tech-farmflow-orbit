import tasksData from '@/services/mockData/tasks.json';

// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let tasks = [...tasksData];

const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },
  
  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },
  
  async create(taskData) {
    await delay(400);
    const newId = Math.max(...tasks.map(t => t.Id), 0) + 1;
    const newTask = {
      Id: newId,
      ...taskData,
      completed: false
    };
    tasks.push(newTask);
    return { ...newTask };
  },
  
  async update(id, taskData) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks[index] = { ...tasks[index], ...taskData };
    return { ...tasks[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = tasks.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    tasks.splice(index, 1);
    return true;
  }
};

export default taskService;