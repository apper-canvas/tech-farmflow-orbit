import farmsData from '@/services/mockData/farms.json';

// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let farms = [...farmsData];

const farmService = {
  async getAll() {
    await delay(300);
    return [...farms];
  },
  
  async getById(id) {
    await delay(200);
    const farm = farms.find(f => f.Id === id);
    if (!farm) {
      throw new Error('Farm not found');
    }
    return { ...farm };
  },
  
  async create(farmData) {
    await delay(400);
    const newId = Math.max(...farms.map(f => f.Id), 0) + 1;
    const newFarm = {
      Id: newId,
      ...farmData,
      createdAt: new Date().toISOString()
    };
    farms.push(newFarm);
    return { ...newFarm };
  },
  
  async update(id, farmData) {
    await delay(350);
    const index = farms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error('Farm not found');
    }
    farms[index] = { ...farms[index], ...farmData };
    return { ...farms[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = farms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error('Farm not found');
    }
    farms.splice(index, 1);
    return true;
  }
};

export default farmService;