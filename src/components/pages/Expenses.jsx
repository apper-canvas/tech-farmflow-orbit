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
import expenseService from '@/services/api/expenseService';
import farmService from '@/services/api/farmService';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    farmId: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    vendor: ''
  });
  
  const expenseCategories = [
    { value: 'seeds', label: 'Seeds & Plants' },
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'labor', label: 'Labor' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ];
  
  const filterOptions = [
    { value: 'all', label: 'All Expenses' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' }
  ];
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [expensesData, farmsData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);
      setExpenses(expensesData);
      setFarms(farmsData);
    } catch (err) {
      setError('Failed to load expenses. Please try again.');
      console.error('Expenses loading error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.category || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const expenseData = {
        ...formData,
        farmId: parseInt(formData.farmId),
        amount: parseFloat(formData.amount)
      };
      
      if (editingExpense) {
        await expenseService.update(editingExpense.Id, expenseData);
        setExpenses(prev => prev.map(expense => 
          expense.Id === editingExpense.Id ? { ...expense, ...expenseData } : expense
        ));
        toast.success('Expense updated successfully');
      } else {
        const newExpense = await expenseService.create(expenseData);
        setExpenses(prev => [...prev, newExpense]);
        toast.success('Expense recorded successfully');
      }
      
      resetForm();
    } catch (err) {
      toast.error('Failed to save expense');
      console.error('Expense save error:', err);
    }
  };
  
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      farmId: expense.farmId.toString(),
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description,
      vendor: expense.vendor || ''
    });
    setShowForm(true);
  };
  
  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseService.delete(expenseId);
      setExpenses(prev => prev.filter(expense => expense.Id !== expenseId));
      toast.success('Expense deleted successfully');
    } catch (err) {
      toast.error('Failed to delete expense');
      console.error('Expense delete error:', err);
    }
  };
  
  const resetForm = () => {
    setFormData({
      farmId: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      vendor: ''
    });
    setShowForm(false);
    setEditingExpense(null);
  };
  
  const getCategoryIcon = (category) => {
    const iconMap = {
      seeds: 'Sprout',
      fertilizer: 'Leaf',
      pesticides: 'Spray',
      fuel: 'Fuel',
      equipment: 'Wrench',
      maintenance: 'Settings',
      labor: 'Users',
      utilities: 'Zap',
      insurance: 'Shield',
      other: 'Package'
    };
    return iconMap[category] || 'Package';
  };
  
  const getCategoryColor = (category) => {
    const colorMap = {
      seeds: 'secondary',
      fertilizer: 'success',
      pesticides: 'warning',
      fuel: 'info',
      equipment: 'primary',
      maintenance: 'accent',
      labor: 'default',
      utilities: 'info',
      insurance: 'primary',
      other: 'default'
    };
    return colorMap[category] || 'default';
  };
  
  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    
    const expenseDate = new Date(expense.date);
    const now = new Date();
    
    if (filter === 'this_month') {
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    }
    
    if (filter === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return expenseDate.getMonth() === lastMonth.getMonth() && 
             expenseDate.getFullYear() === lastMonth.getFullYear();
    }
    
    if (filter === 'this_year') {
      return expenseDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  });
  
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
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
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your farm-related expenses</p>
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
            Add Expense
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      {filteredExpenses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="DollarSign" className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
          
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Receipt" className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalExpenses / filteredExpenses.length).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </div>
          
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-sm font-bold text-gray-900">
                  {Object.keys(expensesByCategory).length > 0 
                    ? Object.entries(expensesByCategory)
                        .sort(([,a], [,b]) => b - a)[0][0]
                        .replace('_', ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                    : 'None'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="BarChart3" className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                  {editingExpense ? 'Edit Expense' : 'Record New Expense'}
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
                  <Select
                    label="Category"
                    options={expenseCategories}
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Select category"
                    required
                  />
                  
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
                
                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                
                <Input
                  label="Description"
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
                
                <Input
                  label="Vendor (Optional)"
                  placeholder="Enter vendor name"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingExpense ? 'Update Expense' : 'Record Expense'}
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
      
      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Empty
            title="No expenses recorded"
            description="Start tracking your farm expenses to better understand your costs and improve profitability."
            icon="Receipt"
            actionLabel="Record Expense"
            onAction={() => setShowForm(true)}
          />
        ) : (
          filteredExpenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((expense, index) => {
              const farm = farms.find(f => f.Id === expense.farmId);
              
              return (
                <motion.div
                  key={expense.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${getCategoryColor(expense.category)}/20 to-${getCategoryColor(expense.category)}/10 flex items-center justify-center`}>
                        <ApperIcon name={getCategoryIcon(expense.category)} className={`w-6 h-6 text-${getCategoryColor(expense.category)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getCategoryColor(expense.category)} size="sm">
                                {expense.category.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ${expense.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Calendar" className="w-4 h-4" />
                            <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                          </div>
                          
                          {farm && (
                            <div className="flex items-center gap-2">
                              <ApperIcon name="MapPin" className="w-4 h-4" />
                              <span>{farm.name}</span>
                            </div>
                          )}
                          
                          {expense.vendor && (
                            <div className="flex items-center gap-2">
                              <ApperIcon name="Store" className="w-4 h-4" />
                              <span>{expense.vendor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.Id)}
                        className="p-2 text-gray-400 hover:text-error transition-colors rounded-lg hover:bg-error/10"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default Expenses;