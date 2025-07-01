import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import farmService from '@/services/api/farmService';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    sizeUnit: 'acres'
  });
  
  const sizeUnits = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'square_feet', label: 'Square Feet' },
    { value: 'square_meters', label: 'Square Meters' }
  ];
  
  const loadFarms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await farmService.getAll();
      setFarms(data);
    } catch (err) {
      setError('Failed to load farms. Please try again.');
      console.error('Farms loading error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.size) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const farmData = {
        ...formData,
        size: parseFloat(formData.size),
        createdAt: new Date().toISOString()
      };
      
      if (editingFarm) {
        await farmService.update(editingFarm.Id, farmData);
        setFarms(prev => prev.map(farm => 
          farm.Id === editingFarm.Id ? { ...farm, ...farmData } : farm
        ));
        toast.success('Farm updated successfully');
      } else {
        const newFarm = await farmService.create(farmData);
        setFarms(prev => [...prev, newFarm]);
        toast.success('Farm added successfully');
      }
      
      resetForm();
    } catch (err) {
      toast.error('Failed to save farm');
      console.error('Farm save error:', err);
    }
  };
  
  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      sizeUnit: farm.sizeUnit
    });
    setShowForm(true);
  };
  
  const handleDelete = async (farmId) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;
    
    try {
      await farmService.delete(farmId);
      setFarms(prev => prev.filter(farm => farm.Id !== farmId));
      toast.success('Farm deleted successfully');
    } catch (err) {
      toast.error('Failed to delete farm');
      console.error('Farm delete error:', err);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      size: '',
      sizeUnit: 'acres'
    });
    setShowForm(false);
    setEditingFarm(null);
  };
  
  useEffect(() => {
    loadFarms();
  }, []);
  
  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={loadFarms} />;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
          <p className="text-gray-600 mt-2">Manage your farm properties and locations</p>
        </div>
        
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          variant="primary"
        >
          Add Farm
        </Button>
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
              className="bg-white rounded-xl shadow-elevated w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFarm ? 'Edit Farm' : 'Add New Farm'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Farm Name"
                  placeholder="Enter farm name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                
                <Input
                  label="Location"
                  placeholder="Enter farm location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Size"
                    type="number"
                    placeholder="0"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    required
                  />
                  
                  <Select
                    label="Unit"
                    options={sizeUnits}
                    value={formData.sizeUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizeUnit: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingFarm ? 'Update Farm' : 'Add Farm'}
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
      
      {/* Farms Grid */}
      {farms.length === 0 ? (
        <Empty
          title="No farms registered"
          description="Start by adding your first farm property to begin tracking your agricultural operations."
          icon="MapPin"
          actionLabel="Add Farm"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <motion.div
              key={farm.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <ApperIcon name="MapPin" className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(farm)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(farm.Id)}
                    className="p-2 text-gray-400 hover:text-error transition-colors rounded-lg hover:bg-error/10"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{farm.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ApperIcon name="MapPin" className="w-4 h-4" />
                  <span>{farm.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="Ruler" className="w-4 h-4" />
                  <span>{farm.size} {farm.sizeUnit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="Calendar" className="w-4 h-4" />
                  <span>Added {new Date(farm.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success font-medium">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Farms;