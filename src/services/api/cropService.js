import cropsData from '@/services/mockData/crops.json';

// Simulate API delay for realistic loading states
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let crops = [...cropsData];

const cropService = {
  async getAll() {
    await delay(250);
    return [...crops];
  },
  
  async getById(id) {
    await delay(200);
    const crop = crops.find(c => c.Id === id);
    if (!crop) {
      throw new Error('Crop not found');
    }
    return { ...crop };
  },
  
  async create(cropData) {
    await delay(400);
    const newId = Math.max(...crops.map(c => c.Id), 0) + 1;
    const newCrop = {
      Id: newId,
      ...cropData,
      status: cropData.status || 'planted'
    };
    crops.push(newCrop);
    return { ...newCrop };
  },
  
  async update(id, cropData) {
    await delay(350);
    const index = crops.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error('Crop not found');
    }
    crops[index] = { ...crops[index], ...cropData };
    return { ...crops[index] };
  },
  
  async delete(id) {
    await delay(250);
    const index = crops.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error('Crop not found');
    }
    crops.splice(index, 1);
    return true;
  }
};

export default cropService;