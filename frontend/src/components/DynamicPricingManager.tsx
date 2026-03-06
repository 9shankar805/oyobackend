import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Users,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface PricingRule {
  id: string;
  ruleType: string;
  name: string;
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
}

interface PricingData {
  date: string;
  basePrice: number;
  finalPrice: number;
  occupancyRate: number;
  demandScore: number;
}

interface DynamicPricingProps {
  roomId: string;
  roomName: string;
}

const DynamicPricingManager: React.FC<DynamicPricingProps> = ({ roomId, roomName }) => {
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPricingData();
    fetchPricingRules();
  }, [roomId, dateRange]);

  const fetchPricingData = async () => {
    try {
      const response = await fetch(`/api/pricing/rooms/${roomId}/pricing-range?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        setPricingData(data.data);
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingRules = async () => {
    try {
      const response = await fetch(`/api/pricing/rooms/${roomId}/rules`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRules(data.data);
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/pricing/rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        fetchPricingRules();
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/pricing/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchPricingRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const calculateRevenue = () => {
    return pricingData.reduce((total, day) => total + day.finalPrice, 0);
  };

  const calculateAverageOccupancy = () => {
    if (pricingData.length === 0) return 0;
    const total = pricingData.reduce((sum, day) => sum + (day.occupancyRate || 0), 0);
    return total / pricingData.length;
  };

  const calculatePriceIncrease = () => {
    if (pricingData.length < 2) return 0;
    const firstPrice = pricingData[0].basePrice;
    const lastPrice = pricingData[pricingData.length - 1].finalPrice;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const chartData = pricingData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    occupancyPercent: (item.occupancyRate || 0) * 50 // Scale to 0-100 for visualization
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dynamic Pricing</h2>
          <p className="text-gray-600">{roomName} - Revenue Optimization</p>
        </div>
        <Button onClick={() => setShowRuleModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue (30 days)</p>
                <p className="text-2xl font-bold">₹{calculateRevenue().toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Occupancy</p>
                <p className="text-2xl font-bold">{(calculateAverageOccupancy() * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Price Optimization</p>
                <p className="text-2xl font-bold">{calculatePriceIncrease().toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <label className="font-medium">Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            />
            <Button onClick={fetchPricingData}>Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="basePrice" 
                  stroke="#8884d8" 
                  name="Base Price"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="finalPrice" 
                  stroke="#82ca9d" 
                  name="Final Price"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy & Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'occupancyPercent' ? `${value.toFixed(0)}%` : value.toFixed(2),
                    name === 'occupancyPercent' ? 'Occupancy Rate' : 'Demand Score'
                  ]}
                />
                <Bar dataKey="occupancyPercent" fill="#8884d8" name="Occupancy Rate" />
                <Bar dataKey="demandScore" fill="#82ca9d" name="Demand Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pricing rules configured</p>
                  <p className="text-sm">Add rules to automate your pricing strategy</p>
                </div>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{rule.name}</h4>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{rule.ruleType.replace('_', ' ')}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Value: {rule.ruleType === 'PERCENTAGE' ? `${rule.value}%` : `₹${rule.value}`} | 
                          Priority: {rule.priority}
                          {rule.startDate && rule.endDate && (
                            <> | Valid: {new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleRuleStatus(rule.id, !rule.isActive)}
                        >
                          {rule.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRule(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      {/* Rule Form Modal */}
      {showRuleModal && (
        <PricingRuleModal
          roomId={roomId}
          editingRule={editingRule}
          onClose={() => {
            setShowRuleModal(false);
            setEditingRule(null);
          }}
          onSave={() => {
            fetchPricingRules();
            setShowRuleModal(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
};

// Pricing Rule Modal Component
interface PricingRuleModalProps {
  roomId: string;
  editingRule: PricingRule | null;
  onClose: () => void;
  onSave: () => void;
}

const PricingRuleModal: React.FC<PricingRuleModalProps> = ({ 
  roomId, 
  editingRule, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    ruleType: 'PERCENTAGE',
    name: '',
    value: 0,
    startDate: '',
    endDate: '',
    priority: 1,
    conditions: {}
  });

  useEffect(() => {
    if (editingRule) {
      setFormData({
        ruleType: editingRule.ruleType,
        name: editingRule.name,
        value: editingRule.value,
        startDate: editingRule.startDate || '',
        endDate: editingRule.endDate || '',
        priority: editingRule.priority,
        conditions: {}
      });
    }
  }, [editingRule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingRule 
        ? `/api/pricing/rules/${editingRule.id}`
        : `/api/pricing/rooms/${roomId}/rules`;
      
      const response = await fetch(url, {
        method: editingRule ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{editingRule ? 'Edit' : 'Add'} Pricing Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rule Type</label>
              <select
                value={formData.ruleType}
                onChange={(e) => setFormData(prev => ({ ...prev, ruleType: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="ADVANCE_BOOKING">Advance Booking</option>
                <option value="WEEKDAY">Weekday</option>
                <option value="WEEKEND">Weekend</option>
                <option value="SEASONAL">Seasonal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingRule ? 'Update' : 'Create'} Rule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicPricingManager;