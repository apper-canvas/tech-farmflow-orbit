import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import PhotoUpload from '@/components/molecules/PhotoUpload';
import cropService from '@/services/api/cropService';
import farmService from '@/services/api/farmService';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Form state
const [formData, setFormData] = useState({
    farmId: '',
    name: '',
    variety: '',
    plantingDate: '',
    expectedHarvest: '',
    location: '',
    status: 'planted',
    photos: []
  });
  
  const cropStatuses = [
    { value: 'planted', label: 'Planted' },
    { value: 'germinating', label: 'Germinating' },
    { value: 'growing', label: 'Growing' },
    { value: 'flowering', label: 'Flowering' },
    { value: 'harvesting', label: 'Harvesting' },
    { value: 'harvested', label: 'Harvested' }
  ];
  
  const filterOptions = [
    { value: 'all', label: 'All Crops' },
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'harvesting', label: 'Ready to Harvest' },
    { value: 'harvested', label: 'Harvested' }
  ];
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load crops. Please try again.');
      console.error('Crops loading error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.name || !formData.plantingDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
const cropData = {
        ...formData,
        farmId: parseInt(formData.farmId),
        photos: formData.photos || []
      };
      if (editingCrop) {
        await cropService.update(editingCrop.Id, cropData);
        setCrops(prev => prev.map(crop => 
          crop.Id === editingCrop.Id ? { ...crop, ...cropData } : crop
        ));
        toast.success('Crop updated successfully');
      } else {
        const newCrop = await cropService.create(cropData);
        setCrops(prev => [...prev, newCrop]);
        toast.success('Crop added successfully');
      }
      
      resetForm();
    } catch (err) {
      toast.error('Failed to save crop');
      console.error('Crop save error:', err);
    }
  };
  
  const handleEdit = (crop) => {
    setEditingCrop(crop);
setFormData({
      farmId: crop.farmId.toString(),
      name: crop.name,
      variety: crop.variety || '',
      plantingDate: crop.plantingDate,
      expectedHarvest: crop.expectedHarvest || '',
      location: crop.location || '',
      status: crop.status,
      photos: crop.photos || []
    });
    setShowForm(true);
  };
  
  const handleDelete = async (cropId) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    
    try {
      await cropService.delete(cropId);
      setCrops(prev => prev.filter(crop => crop.Id !== cropId));
      toast.success('Crop deleted successfully');
    } catch (err) {
      toast.error('Failed to delete crop');
      console.error('Crop delete error:', err);
    }
  };
  
  const resetForm = () => {
setFormData({
      farmId: '',
      name: '',
      variety: '',
      plantingDate: '',
      expectedHarvest: '',
      location: '',
      status: 'planted',
      photos: []
    });
    setShowForm(false);
    setEditingCrop(null);
  };
  
  const getStatusColor = (status) => {
    const colorMap = {
      planted: 'info',
      germinating: 'warning',
      growing: 'success',
      flowering: 'secondary',
      harvesting: 'accent',
      harvested: 'default'
    };
    return colorMap[status] || 'default';
  };
  
  const filteredCrops = crops.filter(crop => {
    if (filter === 'all') return true;
    return crop.status === filter;
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={loadData} />;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Management</h1>
          <p className="text-gray-600 mt-2">Track your planted crops and their growth stages</p>
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
            Add Crop
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
                  {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Farm"
                  options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
                  value={formData.farmId}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmId: e.target.value }))}
                  placeholder="Select a farm"
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Crop Name"
                    placeholder="e.g., Tomatoes"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Variety"
                    placeholder="e.g., Cherry"
                    value={formData.variety}
                    onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                  />
                </div>
                
                <Input
                  label="Location on Farm"
                  placeholder="e.g., North Field"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Planting Date"
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Expected Harvest"
                    type="date"
                    value={formData.expectedHarvest}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedHarvest: e.target.value }))}
                  />
                </div>
                
                <Select
                  label="Status"
                  options={cropStatuses}
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
/>
                
                <PhotoUpload
                  label="Crop Photos (Optional)"
                  value={formData.photos}
                  onChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
                  maxFiles={5}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingCrop ? 'Update Crop' : 'Add Crop'}
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
      
      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <Empty
          title={filter === 'all' ? 'No crops planted' : `No crops with status: ${filter}`}
          description={filter === 'all' 
            ? 'Start by planting your first crop to begin tracking your agricultural production.' 
            : 'Try adjusting your filter or add a new crop.'}
          icon="Sprout"
          actionLabel="Add Crop"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => {
            const farm = farms.find(f => f.Id === crop.farmId);
            
            return (
              <motion.div
                key={crop.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Sprout" className="w-6 h-6 text-secondary" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(crop.status)} size="sm">
                      {crop.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(crop)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(crop.Id)}
                        className="p-2 text-gray-400 hover:text-error transition-colors rounded-lg hover:bg-error/10"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{crop.name}</h3>
                {crop.variety && (
                  <p className="text-gray-600 mb-3">{crop.variety}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  {farm && (
                    <div className="flex items-center gap-2">
                      <ApperIcon name="MapPin" className="w-4 h-4" />
                      <span>{farm.name}</span>
                    </div>
                  )}
                  
                  {crop.location && (
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Navigation" className="w-4 h-4" />
                      <span>{crop.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Calendar" className="w-4 h-4" />
                    <span>Planted {format(new Date(crop.plantingDate), 'MMM d, yyyy')}</span>
                  </div>
                  
                  {crop.expectedHarvest && (
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Scissors" className="w-4 h-4" />
                      <span>Harvest {format(new Date(crop.expectedHarvest), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Crops;