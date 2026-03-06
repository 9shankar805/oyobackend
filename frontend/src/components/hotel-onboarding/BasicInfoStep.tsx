import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Home, 
  Hotel, 
  Building2, 
  HomeIcon, 
  Info,
  Star,
  Calendar
} from 'lucide-react';

interface BasicInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, validateStep }) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    description: data.description || '',
    propertyType: data.propertyType || '',
    category: data.category || '',
    totalRooms: data.totalRooms || '',
    yearBuilt: data.yearBuilt || '',
    yearRenovated: data.yearRenovated || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyTypes = [
    { value: 'hotel', label: 'Hotel', icon: Hotel },
    { value: 'motel', label: 'Motel', icon: Building },
    { value: 'resort', label: 'Resort', icon: Home },
    { value: 'apartment', label: 'Apartment', icon: Building2 },
    { value: 'villa', label: 'Villa', icon: HomeIcon },
    { value: 'guest_house', label: 'Guest House', icon: Home },
    { value: 'hostel', label: 'Hostel', icon: Building },
    { value: 'homestay', label: 'Homestay', icon: Home }
  ];

  const categories = [
    { value: 'budget', label: 'Budget', color: 'bg-green-100 text-green-800' },
    { value: 'economy', label: 'Economy', color: 'bg-blue-100 text-blue-800' },
    { value: 'mid_range', label: 'Mid-Range', color: 'bg-purple-100 text-purple-800' },
    { value: 'premium', label: 'Premium', color: 'bg-orange-100 text-orange-800' },
    { value: 'luxury', label: 'Luxury', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Hotel name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Hotel name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Property type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.totalRooms || formData.totalRooms < 1) {
      newErrors.totalRooms = 'Total rooms must be at least 1';
    } else if (formData.totalRooms > 1000) {
      newErrors.totalRooms = 'Total rooms cannot exceed 1000';
    }

    if (!formData.yearBuilt || formData.yearBuilt < 1900 || formData.yearBuilt > new Date().getFullYear()) {
      newErrors.yearBuilt = 'Please enter a valid year';
    }

    if (formData.yearRenovated && (formData.yearRenovated < formData.yearBuilt || formData.yearRenovated > new Date().getFullYear())) {
      newErrors.yearRenovated = 'Renovation year must be after built year and not in future';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    validateStep(isValid);
    
    if (isValid) {
      updateData(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateDescription = () => {
    const templates = [
      `Welcome to ${formData.name || 'your hotel'}, a ${formData.category || 'premium'} ${formData.propertyType || 'hotel'} offering comfortable accommodations and excellent amenities. Our property features ${formData.totalRooms || 'well-appointed'} rooms designed for your comfort and convenience.`,
      `${formData.name || 'Your hotel'} is a charming ${formData.category || 'mid-range'} ${formData.propertyType || 'property'} located in the heart of the city. With ${formData.totalRooms || 'spacious'} rooms, we provide a perfect blend of comfort, style, and value for both business and leisure travelers.`,
      `Experience exceptional hospitality at ${formData.name || 'our hotel'}, a ${formData.category || 'modern'} ${formData.propertyType || 'establishment'} with ${formData.totalRooms || 'beautifully designed'} rooms. We pride ourselves on delivering outstanding service and memorable stays.`
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setFormData(prev => ({ ...prev, description: randomTemplate }));
  };

  return (
    <div className="space-y-6">
      {/* Property Type Selection */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Property Type</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {propertyTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = formData.propertyType === type.value;
            
            return (
              <div
                key={type.value}
                onClick={() => handleInputChange('propertyType', type.value)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isSelected ? 'text-blue-600' : 'text-gray-700'
                  }`}>{type.label}</p>
                </div>
              </div>
            );
          })}
        </div>
        {errors.propertyType && (
          <p className="text-red-500 text-sm mt-2">{errors.propertyType}</p>
        )}
      </div>

      {/* Hotel Name */}
      <div>
        <Label htmlFor="name" className="text-base font-semibold">
          Hotel Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your hotel name"
          className="mt-2"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="description" className="text-base font-semibold">
            Description <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateDescription}
            className="text-xs"
          >
            <Star className="w-3 h-3 mr-1" />
            Generate Description
          </Button>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your hotel, its unique features, location advantages, and what makes it special for guests..."
          className="mt-2 min-h-[120px]"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">
            {formData.description.length}/500 characters
          </p>
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Category and Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Category <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.value}
                onClick={() => handleInputChange('category', cat.value)}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  formData.category === cat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cat.label}</span>
                  <Badge className={cat.color}>{cat.label}</Badge>
                </div>
              </div>
            ))}
          </div>
          {errors.category && (
            <p className="text-red-500 text-sm mt-2">{errors.category}</p>
          )}
        </div>

        <div>
          <Label htmlFor="totalRooms" className="text-base font-semibold">
            Total Rooms <span className="text-red-500">*</span>
          </Label>
          <Input
            id="totalRooms"
            type="number"
            value={formData.totalRooms}
            onChange={(e) => handleInputChange('totalRooms', parseInt(e.target.value) || '')}
            placeholder="Number of rooms"
            className="mt-2"
          />
          {errors.totalRooms && (
            <p className="text-red-500 text-sm mt-1">{errors.totalRooms}</p>
          )}
        </div>
      </div>

      {/* Year Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="yearBuilt" className="text-base font-semibold">
            Year Built <span className="text-red-500">*</span>
          </Label>
          <Input
            id="yearBuilt"
            type="number"
            value={formData.yearBuilt}
            onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || '')}
            placeholder="e.g., 2010"
            className="mt-2"
          />
          {errors.yearBuilt && (
            <p className="text-red-500 text-sm mt-1">{errors.yearBuilt}</p>
          )}
        </div>

        <div>
          <Label htmlFor="yearRenovated" className="text-base font-semibold">
            Year Renovated (Optional)
          </Label>
          <Input
            id="yearRenovated"
            type="number"
            value={formData.yearRenovated}
            onChange={(e) => handleInputChange('yearRenovated', parseInt(e.target.value) || '')}
            placeholder="e.g., 2022"
            className="mt-2"
          />
          {errors.yearRenovated && (
            <p className="text-red-500 text-sm mt-1">{errors.yearRenovated}</p>
          )}
        </div>
      </div>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-800 mb-2">Pro Tips:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Use a descriptive hotel name that includes location or unique features</li>
                <li>• Write a compelling description highlighting what makes your property special</li>
                <li>• Choose the category that best reflects your pricing and service level</li>
                <li>• Include accurate year information to help guests set expectations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoStep;