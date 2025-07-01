import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, addMonths, addYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import budgetService from '@/services/api/budgetService';
import farmService from '@/services/api/farmService';
import expenseService from '@/services/api/expenseService';
import cropService from '@/services/api/cropService';
import { calculateBudgetVariance, calculateProfitLoss, getBudgetUtilization, calculateProjectedProfit } from '@/utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [farms, setFarms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  
  // Form state
  const [formData, setFormData] = useState({
    farmId: '',
    period: 'monthly',
    budgetAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    category: 'total',
    projectedYield: '',
    notes: ''
  });
  
  const periodOptions = [
    { value: 'monthly', label: 'Monthly Budgets' },
    { value: 'annual', label: 'Annual Budgets' },
    { value: 'all', label: 'All Periods' }
  ];
  
  const budgetCategories = [
    { value: 'total', label: 'Total Budget' },
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
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [budgetsData, farmsData, expensesData, cropsData] = await Promise.all([
        budgetService.getAll(),
        farmService.getAll(),
        expenseService.getAll(),
        cropService.getAll()
      ]);
      setBudgets(budgetsData);
      setFarms(farmsData);
      setExpenses(expensesData);
      setCrops(cropsData);
    } catch (err) {
      setError('Failed to load budget data. Please try again.');
      console.error('Budget loading error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.budgetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const budgetData = {
        ...formData,
        farmId: parseInt(formData.farmId),
        budgetAmount: parseFloat(formData.budgetAmount),
        projectedYield: formData.projectedYield ? parseFloat(formData.projectedYield) : null
      };
      
      if (editingBudget) {
        await budgetService.update(editingBudget.Id, budgetData);
        setBudgets(prev => prev.map(budget => 
          budget.Id === editingBudget.Id ? { ...budget, ...budgetData } : budget
        ));
        toast.success('Budget updated successfully');
      } else {
        const newBudget = await budgetService.create(budgetData);
        setBudgets(prev => [...prev, newBudget]);
        toast.success('Budget created successfully');
      }
      
      resetForm();
    } catch (err) {
      toast.error('Failed to save budget');
      console.error('Budget save error:', err);
    }
  };
  
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      farmId: budget.farmId.toString(),
      period: budget.period,
      budgetAmount: budget.budgetAmount.toString(),
      startDate: budget.startDate,
      category: budget.category || 'total',
      projectedYield: budget.projectedYield ? budget.projectedYield.toString() : '',
      notes: budget.notes || ''
    });
    setShowForm(true);
  };
  
  const handleDelete = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await budgetService.delete(budgetId);
      setBudgets(prev => prev.filter(budget => budget.Id !== budgetId));
      toast.success('Budget deleted successfully');
    } catch (err) {
      toast.error('Failed to delete budget');
      console.error('Budget delete error:', err);
    }
  };
  
  const resetForm = () => {
    setFormData({
      farmId: '',
      period: 'monthly',
      budgetAmount: '',
      startDate: new Date().toISOString().split('T')[0],
      category: 'total',
      projectedYield: '',
      notes: ''
    });
    setShowForm(false);
    setEditingBudget(null);
  };
  
  // Filter budgets based on selected criteria
  const filteredBudgets = budgets.filter(budget => {
    if (selectedFarm !== 'all' && budget.farmId !== parseInt(selectedFarm)) return false;
    if (selectedPeriod !== 'all' && budget.period !== selectedPeriod) return false;
    return true;
  });
  
  // Calculate budget analytics
  const getBudgetAnalytics = () => {
    const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
    const currentExpenses = expenses.filter(expense => {
      if (selectedFarm !== 'all' && expense.farmId !== parseInt(selectedFarm)) return false;
      return true;
    }).reduce((sum, expense) => sum + expense.amount, 0);
    
    const profitAnalysis = calculateProjectedProfit(
      crops.filter(crop => selectedFarm === 'all' || crop.farmId === parseInt(selectedFarm)),
      filteredBudgets,
      expenses.filter(expense => selectedFarm === 'all' || expense.farmId === parseInt(selectedFarm))
    );
    
    return {
      totalBudgeted,
      currentExpenses,
      budgetUtilization: getBudgetUtilization(totalBudgeted, currentExpenses),
      budgetVariance: calculateBudgetVariance(totalBudgeted, currentExpenses),
      ...profitAnalysis
    };
  };
  
  const analytics = getBudgetAnalytics();
  
  // Prepare chart data
  const getChartData = () => {
    const farmLabels = selectedFarm === 'all' 
      ? farms.map(farm => farm.name) 
      : [farms.find(f => f.Id === parseInt(selectedFarm))?.name || 'Unknown'];
    
    const budgetData = farmLabels.map(farmName => {
      const farm = farms.find(f => f.name === farmName);
      if (!farm) return 0;
      return filteredBudgets
        .filter(budget => budget.farmId === farm.Id)
        .reduce((sum, budget) => sum + budget.budgetAmount, 0);
    });
    
    const expenseData = farmLabels.map(farmName => {
      const farm = farms.find(f => f.name === farmName);
      if (!farm) return 0;
      return expenses
        .filter(expense => expense.farmId === farm.Id)
        .reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    return {
      labels: farmLabels,
      datasets: [
        {
          label: 'Budgeted',
          data: budgetData,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        },
        {
          label: 'Actual Expenses',
          data: expenseData,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Budget vs Actual Expenses by Farm'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  if (loading) return <Loading rows={4} />;
  if (error) return <Error message={error} onRetry={loadData} />;
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-2">Plan and track your farm expenses and profitability</p>
        </div>
        
        <div className="flex gap-3">
          <Select
            options={[{ value: 'all', label: 'All Farms' }, ...farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))]}
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="w-40"
          />
          <Select
            options={periodOptions}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-40"
          />
          <Button
            onClick={() => setShowForm(true)}
            icon="Plus"
            variant="primary"
          >
            Create Budget
          </Button>
        </div>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.totalBudgeted.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actual Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.currentExpenses.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.budgetUtilization.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    analytics.budgetUtilization > 100 ? 'bg-error' : 
                    analytics.budgetUtilization > 80 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(analytics.budgetUtilization, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="BarChart3" className="w-6 h-6 text-info" />
            </div>
          </div>
        </div>
        
        <div className="card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projected Profit</p>
              <p className={`text-2xl font-bold ${analytics.projectedProfit >= 0 ? 'text-success' : 'text-error'}`}>
                ${analytics.projectedProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Est. Revenue: ${analytics.projectedRevenue.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${analytics.projectedProfit >= 0 ? 'from-success/20 to-success/10' : 'from-error/20 to-error/10'} rounded-lg flex items-center justify-center`}>
              <ApperIcon name={analytics.projectedProfit >= 0 ? 'TrendingUp' : 'TrendingDown'} className={`w-6 h-6 ${analytics.projectedProfit >= 0 ? 'text-success' : 'text-error'}`} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      {filteredBudgets.length > 0 && (
        <div className="card-elevated">
          <div className="h-96">
            <Bar data={getChartData()} options={chartOptions} />
          </div>
        </div>
      )}
      
      {/* Budget Form Modal */}
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
                  {editingBudget ? 'Edit Budget' : 'Create New Budget'}
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
                    label="Period"
                    options={periodOptions.slice(0, 2)}
                    value={formData.period}
                    onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    required
                  />
                  
                  <Select
                    label="Category"
                    options={budgetCategories}
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Budget Amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                
                <Input
                  label="Projected Yield (Optional)"
                  type="number"
                  step="0.01"
                  placeholder="Expected yield value"
                  value={formData.projectedYield}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectedYield: e.target.value }))}
                />
                
                <Input
                  label="Notes (Optional)"
                  placeholder="Budget notes or details"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
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
      
      {/* Budgets List */}
      <div className="space-y-4">
        {filteredBudgets.length === 0 ? (
          <Empty
            title="No budgets found"
            description="Create your first budget to start tracking expenses and planning profitability for your farms."
            icon="Target"
            actionLabel="Create Budget"
            onAction={() => setShowForm(true)}
          />
        ) : (
          filteredBudgets
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .map((budget, index) => {
              const farm = farms.find(f => f.Id === budget.farmId);
              const budgetExpenses = expenses.filter(expense => 
                expense.farmId === budget.farmId &&
                new Date(expense.date) >= new Date(budget.startDate) &&
                new Date(expense.date) <= (budget.period === 'monthly' 
                  ? endOfMonth(new Date(budget.startDate))
                  : endOfYear(new Date(budget.startDate)))
              );
              const totalExpenses = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
              const utilization = getBudgetUtilization(budget.budgetAmount, totalExpenses);
              const variance = calculateBudgetVariance(budget.budgetAmount, totalExpenses);
              
              return (
                <motion.div
                  key={budget.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <ApperIcon name="Target" className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {budget.category === 'total' ? 'Total Budget' : budget.category.replace('_', ' ')} - {farm?.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="primary" size="sm">
                                {budget.period}
                              </Badge>
                              <Badge variant={utilization > 100 ? 'error' : utilization > 80 ? 'warning' : 'success'} size="sm">
                                {utilization.toFixed(1)}% used
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ${budget.budgetAmount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${totalExpenses.toLocaleString()} spent
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                utilization > 100 ? 'bg-error' : 
                                utilization > 80 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <ApperIcon name="Calendar" className="w-4 h-4" />
                              <span>
                                {format(new Date(budget.startDate), 'MMM d, yyyy')} - 
                                {budget.period === 'monthly' 
                                  ? format(endOfMonth(new Date(budget.startDate)), 'MMM d, yyyy')
                                  : format(endOfYear(new Date(budget.startDate)), 'MMM d, yyyy')
                                }
                              </span>
                            </div>
                            
                            <span className={`font-medium ${variance > 0 ? 'text-error' : 'text-success'}`}>
                              {variance > 0 ? '+' : ''}{variance.toFixed(1)}% variance
                            </span>
                          </div>
                          
                          {budget.notes && (
                            <p className="text-sm text-gray-600 italic">{budget.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.Id)}
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

export default Budget;