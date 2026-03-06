import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calculator, 
  Calendar, 
  Percent,
  Clock,
  Shield,
  AlertCircle,
  Check,
  TrendingUp,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface PricingStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const PricingStep: React.FC<PricingStepProps> = ({ data, updateData, validateStep }) => {
  const [pricing, setPricing] = useState({
    basePrice: data.pricing?.basePrice || 0,
    weekendPrice: data.pricing?.weekendPrice || 0,
    seasonalPrice: data.pricing?.seasonalPrice || 0,
    taxes: data.pricing?.taxes || 18,
    commission: data.pricing?.commission || 15,
    cancellationPolicy: data.pricing?.cancellationPolicy || 'flexible',
    checkInTime: data.policies?.checkInTime || '14:00',
    checkOutTime: data.policies?.checkOutTime || '11:00',
    paymentMethods: data.policies?.paymentMethods || ['card', 'upi', 'cash'],
    dynamicPricing: data.pricing?.dynamicPricing || true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [revenuePreview, setRevenuePreview] = useState({
    monthly: 0,
    yearly: 0,
    occupancyRate: 70
  });

  const cancellationPolicies = [
    {
      value: 'strict',
      label: 'Strict',
      description: 'No refund after booking',
      recommendedFor: 'Peak season, high demand'
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: '50% refund up to 24 hours before',
      recommendedFor: 'Regular season, balanced approach'
    },
    {
      value: 'flexible',
      label: 'Flexible',
      description: 'Free cancellation up to 24 hours',
      recommendedFor: 'Off-season, competitive markets'
    },
    {
      value: 'very_flexible',
      label: 'Very Flexible',
      description: 'Free cancellation up to 1 hour',
      recommendedFor: 'Last-minute bookings, new properties'
    }
  ];

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'upi', label: 'UPI', icon: RefreshCw },
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'wallet', label: 'Digital Wallet', icon: Shield },
    { value: 'net_banking', label: 'Net Banking', icon: CreditCard }
  ];

  useEffect(() => {
    validateForm();
    calculateRevenue();
  }, [pricing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!pricing.basePrice || pricing.basePrice < 100) {
      newErrors.basePrice = 'Base price must be at least ₹100';
    } else if (pricing.basePrice > 50000) {
      newErrors.basePrice = 'Base price cannot exceed ₹50,000';
    }

    if (pricing.weekendPrice < 0 || pricing.weekendPrice > 100000) {
      newErrors.weekendPrice = 'Please enter a valid weekend price';
    }

    if (pricing.seasonalPrice < 0 || pricing.seasonalPrice > 100000) {
      newErrors.seasonalPrice = 'Please enter a valid seasonal price';
    }

    if (pricing.taxes < 0 || pricing.taxes > 50) {
      newErrors.taxes = 'Tax rate must be between 0% and 50%';
    }

    if (pricing.commission < 0 || pricing.commission > 50) {
      newErrors.commission = 'Commission must be between 0% and 50%';
    }

    if (pricing.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Select at least one payment method';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    validateStep(isValid);
    
    if (isValid) {
      updateData({ 
        ...pricing, 
        policies: {
          ...data.policies,
          checkInTime: pricing.checkInTime,
          checkOutTime: pricing.checkOutTime,
          paymentMethods: pricing.paymentMethods
        }
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setPricing(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePaymentMethod = (method: string) => {
    const updatedMethods = pricing.paymentMethods.includes(method)
      ? pricing.paymentMethods.filter(m => m !== method)
      : [...pricing.paymentMethods, method];
    
    handleInputChange('paymentMethods', updatedMethods);
  };

  const calculateRevenue = () => {
    const avgPrice = (pricing.basePrice + pricing.weekendPrice) / 2;
    const monthlyRevenue = avgPrice * 30 * (revenuePreview.occupancyRate / 100);
    const yearlyRevenue = monthlyRevenue * 12;

    setRevenuePreview({
      monthly: monthlyRevenue,
      yearly: yearlyRevenue,
      occupancyRate: revenuePreview.occupancyRate
    });
  };

  const getCommissionRevenue = () => {
    const avgPrice = (pricing.basePrice + pricing.weekendPrice) / 2;
    return revenuePreview.yearly * (pricing.commission / 100);
  };

  const getNetRevenue = () => {
    return revenuePreview.yearly - getCommissionRevenue();
  };

  const calculateGuestPrice = (basePrice: number) => {
    const taxAmount = basePrice * (pricing.taxes / 100);
    const commissionAmount = basePrice * (pricing.commission / 100);
    return basePrice + taxAmount;
  };

  return (
    <div className="space-y-6">
      {/* Base Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Room Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="basePrice" className="font-medium">
                Base Price (Weekday Night) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="basePrice"
                  type="number"
                  value={pricing.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseInt(e.target.value) || 0)}
                  placeholder="1500"
                  className="pl-8"
                />
              </div>
              {errors.basePrice && (
                <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>
              )}
            </div>

            <div>
              <Label htmlFor="weekendPrice" className="font-medium">
                Weekend Price (Fri-Sun)
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="weekendPrice"
                  type="number"
                  value={pricing.weekendPrice}
                  onChange={(e) => handleInputChange('weekendPrice', parseInt(e.target.value) || 0)}
                  placeholder="2000"
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                +₹{pricing.weekendPrice - pricing.basePrice} from base price
              </p>
              {errors.weekendPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.weekendPrice}</p>
              )}
            </div>

            <div>
              <Label htmlFor="seasonalPrice" className="font-medium">
                Peak Season Price
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="seasonalPrice"
                  type="number"
                  value={pricing.seasonalPrice}
                  onChange={(e) => handleInputChange('seasonalPrice', parseInt(e.target.value) || 0)}
                  placeholder="3000"
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                +₹{pricing.seasonalPrice - pricing.basePrice} from base price
              </p>
              {errors.seasonalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.seasonalPrice}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxes and Commission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            Taxes & Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="taxes" className="font-medium">
                GST/Taxes (%)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="taxes"
                  type="number"
                  value={pricing.taxes}
                  onChange={(e) => handleInputChange('taxes', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Government taxes applicable in your region
              </p>
              {errors.taxes && (
                <p className="text-red-500 text-sm mt-1">{errors.taxes}</p>
              )}
            </div>

            <div>
              <Label htmlFor="commission" className="font-medium">
                Platform Commission (%)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="commission"
                  type="number"
                  value={pricing.commission}
                  onChange={(e) => handleInputChange('commission', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Our platform fee for services and bookings
              </p>
              {errors.commission && (
                <p className="text-red-500 text-sm mt-1">{errors.commission}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Cancellation Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="font-medium mb-4 block">Select Cancellation Policy</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cancellationPolicies.map((policy) => (
              <div
                key={policy.value}
                onClick={() => handleInputChange('cancellationPolicy', policy.value)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  pricing.cancellationPolicy === policy.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                    pricing.cancellationPolicy === policy.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {pricing.cancellationPolicy === policy.value && (
                      <Check className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{policy.label}</p>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Recommended for: {policy.recommendedFor}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Check-in/Check-out Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Check-in & Check-out Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="checkInTime" className="font-medium">
                Standard Check-in Time
              </Label>
              <Input
                id="checkInTime"
                type="time"
                value={pricing.checkInTime}
                onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                When guests can typically check in
              </p>
            </div>

            <div>
              <Label htmlFor="checkOutTime" className="font-medium">
                Standard Check-out Time
              </Label>
              <Input
                id="checkOutTime"
                type="time"
                value={pricing.checkOutTime}
                onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                When guests must check out by
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Accepted Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const isSelected = pricing.paymentMethods.includes(method.value);
              
              return (
                <div
                  key={method.value}
                  onClick={() => togglePaymentMethod(method.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isSelected ? 'text-blue-600' : 'text-gray-700'
                    }`}>{method.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.paymentMethods && (
            <p className="text-red-500 text-sm mt-4">{errors.paymentMethods}</p>
          )}
        </CardContent>
      </Card>

      {/* Revenue Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Revenue Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ₹{calculateGuestPrice(pricing.basePrice).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Guest Price (incl. GST)</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₹{revenuePreview.monthly.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Monthly Revenue (70% occupancy)</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ₹{getNetRevenue().toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Annual Net Revenue</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                ₹{getCommissionRevenue().toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Platform Commission</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Revenue preview is based on 70% occupancy rate. 
                Actual revenue may vary based on season, demand, and occupancy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Pricing Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Dynamic Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable AI-Powered Dynamic Pricing</p>
              <p className="text-sm text-gray-600 mt-1">
                Automatically adjust prices based on demand, season, and events
              </p>
            </div>
            <div
              onClick={() => handleInputChange('dynamicPricing', !pricing.dynamicPricing)}
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${
                pricing.dynamicPricing ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                pricing.dynamicPricing ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingStep;