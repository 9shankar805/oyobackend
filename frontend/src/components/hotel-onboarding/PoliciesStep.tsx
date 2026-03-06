import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Check, 
  Info,
  Users,
  CreditCard,
  Car,
  Dog,
  Smoking,
  Baby,
  Hotel,
  Phone
} from 'lucide-react';

interface PoliciesStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const PoliciesStep: React.FC<PoliciesStepProps> = ({ data, updateData, validateStep }) => {
  const [policies, setPolicies] = useState({
    checkInTime: data.policies?.checkInTime || '14:00',
    checkOutTime: data.policies?.checkOutTime || '11:00',
    idRequired: data.policies?.idRequired !== false,
    petPolicy: data.policies?.petPolicy || 'not_allowed',
    smokingPolicy: data.policies?.smokingPolicy || 'non_smoking',
    childPolicy: data.policies?.childPolicy || 'allowed',
    paymentMethods: data.policies?.paymentMethods || ['card', 'upi', 'cash'],
    specialInstructions: data.policies?.specialInstructions || '',
    houseRules: data.policies?.houseRules || '',
    localLaws: data.policies?.localLaws || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const petPolicies = [
    {
      value: 'not_allowed',
      label: 'No Pets Allowed',
      description: 'Pets are not permitted on the property',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800'
    },
    {
      value: 'allowed_small',
      label: 'Small Pets Allowed',
      description: 'Small pets (under 15kg) allowed with extra charges',
      icon: Dog,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      value: 'allowed_all',
      label: 'All Pets Allowed',
      description: 'All pets welcome with appropriate charges',
      icon: Shield,
      color: 'bg-green-100 text-green-800'
    }
  ];

  const smokingPolicies = [
    {
      value: 'non_smoking',
      label: 'Non-Smoking',
      description: 'Smoking not permitted anywhere in the property',
      icon: AlertTriangle,
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'smoking_rooms',
      label: 'Designated Smoking Rooms',
      description: 'Smoking allowed only in designated rooms',
      icon: Users,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      value: 'smoking_allowed',
      label: 'Smoking Allowed',
      description: 'Smoking permitted in designated areas',
      icon: Shield,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const childPolicies = [
    {
      value: 'not_allowed',
      label: 'No Children Allowed',
      description: 'Property is adults-only (18+)',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800'
    },
    {
      value: 'allowed',
      label: 'Children Welcome',
      description: 'Children of all ages welcome',
      icon: Baby,
      color: 'bg-green-100 text-green-800'
    },
    {
      value: 'free_with_bed',
      label: 'Children Stay Free',
      description: 'Children under 12 stay free in existing beds',
      icon: Heart,
      color: 'bg-blue-100 text-blue-800'
    }
  ];

  const paymentMethodOptions = [
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'net_banking', label: 'Net Banking', icon: CreditCard },
    { value: 'wallet', label: 'Digital Wallet', icon: Shield }
  ];

  const commonHouseRules = [
    'No parties or events',
    'Quiet hours after 10 PM',
    'No outside food or drinks',
    'Valid ID required at check-in',
    'No visitors in rooms',
    'Damages will be charged',
    'Early check-in subject to availability',
    'Late check-out charges apply'
  ];

  useEffect(() => {
    validateForm();
  }, [policies]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!policies.checkInTime) {
      newErrors.checkInTime = 'Check-in time is required';
    }

    if (!policies.checkOutTime) {
      newErrors.checkOutTime = 'Check-out time is required';
    }

    if (!policies.petPolicy) {
      newErrors.petPolicy = 'Pet policy is required';
    }

    if (!policies.smokingPolicy) {
      newErrors.smokingPolicy = 'Smoking policy is required';
    }

    if (!policies.childPolicy) {
      newErrors.childPolicy = 'Child policy is required';
    }

    if (!policies.paymentMethods || policies.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Select at least one payment method';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    validateStep(isValid);
    
    if (isValid) {
      updateData({ policies });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePaymentMethod = (method: string) => {
    const updatedMethods = policies.paymentMethods.includes(method)
      ? policies.paymentMethods.filter(m => m !== method)
      : [...policies.paymentMethods, method];
    
    handleInputChange('paymentMethods', updatedMethods);
  };

  const toggleHouseRule = (rule: string) => {
    const currentRules = policies.houseRules ? policies.houseRules.split(', ') : [];
    const updatedRules = currentRules.includes(rule)
      ? currentRules.filter(r => r !== rule)
      : [...currentRules, rule];
    
    handleInputChange('houseRules', updatedRules.join(', '));
  };

  return (
    <div className="space-y-6">
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
                value={policies.checkInTime}
                onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                When guests can check in to their rooms
              </p>
              {errors.checkInTime && (
                <p className="text-red-500 text-sm mt-1">{errors.checkInTime}</p>
              )}
            </div>

            <div>
              <Label htmlFor="checkOutTime" className="font-medium">
                Standard Check-out Time
              </Label>
              <Input
                id="checkOutTime"
                type="time"
                value={policies.checkOutTime}
                onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                When guests must vacate their rooms
              </p>
              {errors.checkOutTime && (
                <p className="text-red-500 text-sm mt-1">{errors.checkOutTime}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Requirement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Identification Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Checkbox
              id="idRequired"
              checked={policies.idRequired}
              onCheckedChange={(checked) => handleInputChange('idRequired', checked)}
            />
            <Label htmlFor="idRequired" className="font-medium">
              Valid Government ID Required at Check-in
            </Label>
          </div>
          <p className="text-sm text-gray-600 mt-2 ml-8">
            Guests must present a valid government-issued photo ID (Aadhaar, Driver's License, Passport, etc.)
          </p>
        </CardContent>
      </Card>

      {/* Pet Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dog className="w-5 h-5 mr-2" />
            Pet Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {petPolicies.map((policy) => {
              const IconComponent = policy.icon;
              return (
                <div
                  key={policy.value}
                  onClick={() => handleInputChange('petPolicy', policy.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    policies.petPolicy === policy.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <IconComponent className={`w-8 h-8 mx-auto mb-3 ${
                      policies.petPolicy === policy.value ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <p className={`font-medium mb-2 ${
                      policies.petPolicy === policy.value ? 'text-blue-600' : 'text-gray-700'
                    }`}>{policy.label}</p>
                    <p className={`text-sm ${policy.color} rounded px-2 py-1`}>
                      {policy.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.petPolicy && (
            <p className="text-red-500 text-sm mt-4">{errors.petPolicy}</p>
          )}
        </CardContent>
      </Card>

      {/* Smoking Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smoking className="w-5 h-5 mr-2" />
            Smoking Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {smokingPolicies.map((policy) => {
              const IconComponent = policy.icon;
              return (
                <div
                  key={policy.value}
                  onClick={() => handleInputChange('smokingPolicy', policy.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    policies.smokingPolicy === policy.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <IconComponent className={`w-8 h-8 mx-auto mb-3 ${
                      policies.smokingPolicy === policy.value ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <p className={`font-medium mb-2 ${
                      policies.smokingPolicy === policy.value ? 'text-blue-600' : 'text-gray-700'
                    }`}>{policy.label}</p>
                    <p className={`text-sm ${policy.color} rounded px-2 py-1`}>
                      {policy.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.smokingPolicy && (
            <p className="text-red-500 text-sm mt-4">{errors.smokingPolicy}</p>
          )}
        </CardContent>
      </Card>

      {/* Child Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Baby className="w-5 h-5 mr-2" />
            Child Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {childPolicies.map((policy) => {
              const IconComponent = policy.icon;
              return (
                <div
                  key={policy.value}
                  onClick={() => handleInputChange('childPolicy', policy.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    policies.childPolicy === policy.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <IconComponent className={`w-8 h-8 mx-auto mb-3 ${
                      policies.childPolicy === policy.value ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <p className={`font-medium mb-2 ${
                      policies.childPolicy === policy.value ? 'text-blue-600' : 'text-gray-700'
                    }`}>{policy.label}</p>
                    <p className={`text-sm ${policy.color} rounded px-2 py-1`}>
                      {policy.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.childPolicy && (
            <p className="text-red-500 text-sm mt-4">{errors.childPolicy}</p>
          )}
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
            {paymentMethodOptions.map((method) => {
              const IconComponent = method.icon;
              const isSelected = policies.paymentMethods.includes(method.value);
              
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

      {/* House Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            House Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-medium mb-3 block">Common House Rules</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonHouseRules.map((rule) => {
                  const isSelected = policies.houseRules && policies.houseRules.includes(rule);
                  
                  return (
                    <div
                      key={rule}
                      onClick={() => toggleHouseRule(rule)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded border-2 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <Check className="w-2 h-2 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{rule}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="specialInstructions" className="font-medium">
                Special Instructions (Optional)
              </Label>
              <textarea
                id="specialInstructions"
                value={policies.specialInstructions || ''}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="Any additional rules or instructions for guests..."
                className="mt-1 w-full p-3 border rounded-lg min-h-[100px] resize-none"
              />
              <p className="text-sm text-gray-600 mt-1">
                Important information guests should know before booking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Compliance */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Shield className="w-5 h-5 mr-2" />
            Legal Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="localLaws"
                checked={!!policies.localLaws}
                onCheckedChange={(checked) => handleInputChange('localLaws', checked ? 'compliant' : '')}
              />
              <Label htmlFor="localLaws" className="text-blue-800 font-medium">
                I comply with all local laws and regulations
              </Label>
            </div>
            
            <div className="text-sm text-blue-700 space-y-2 ml-8">
              <p>• Property is registered with local authorities</p>
              <p>• All necessary licenses and permits are obtained</p>
              <p>• Safety and fire regulations are followed</p>
              <p>• Tax compliance is maintained</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Missing icons - add these
const Heart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const DollarSign = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0 7h-5"/>
  </svg>
);

const Smartphone = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12" y2="18"/>
  </svg>
);

export default PoliciesStep;