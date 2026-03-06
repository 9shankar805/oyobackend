import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Navigation,
  Building,
  Info,
  Check
} from 'lucide-react';

interface LocationStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({ data, updateData, validateStep }) => {
  const [formData, setFormData] = useState({
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    pincode: data.pincode || '',
    country: data.country || 'India',
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    landmark: data.landmark || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    validateForm();
    if (formData.latitude && formData.longitude) {
      setMapCenter({ lat: formData.latitude, lng: formData.longitude });
      setMarkerPosition({ lat: formData.latitude, lng: formData.longitude });
    }
  }, [formData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://example.com)';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select your location on the map';
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setMarkerPosition({ lat: latitude, lng: longitude });
          setFormData(prev => ({ ...prev, latitude, longitude }));
          setIsLocating(false);
          
          // Reverse geocoding to get address (mock implementation)
          getAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          alert('Unable to get your location. Please enter address manually.');
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const getAddressFromCoordinates = (lat: number, lng: number) => {
    // Mock reverse geocoding - in real app, use Google Maps Geocoding API
    const mockAddresses = [
      '123 MG Road, Bangalore, Karnataka 560001',
      '456 Park Street, Kolkata, West Bengal 700016',
      '789 Marine Drive, Mumbai, Maharashtra 400020'
    ];
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
    
    setFormData(prev => ({
      ...prev,
      address: randomAddress.split(',')[0],
      city: randomAddress.split(',')[1].trim().split(' ')[0],
      state: randomAddress.split(',')[1].trim().split(' ')[1],
      pincode: randomAddress.split(',')[1].trim().split(' ')[2]
    }));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleAddressSearch = () => {
    // Mock geocoding - in real app, use Google Maps Geocoding API
    const mockCoords = {
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'kolkata': { lat: 22.5726, lng: 88.3639 }
    };

    const cityKey = formData.city.toLowerCase();
    if (mockCoords[cityKey as keyof typeof mockCoords]) {
      const coords = mockCoords[cityKey as keyof typeof mockCoords];
      setMapCenter(coords);
      setMarkerPosition(coords);
      setFormData(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
    }
  };

  const popularCities = [
    { name: 'Delhi', state: 'Delhi' },
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Bangalore', state: 'Karnataka' },
    { name: 'Kolkata', state: 'West Bengal' },
    { name: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Hyderabad', state: 'Telangana' },
    { name: 'Pune', state: 'Maharashtra' },
    { name: 'Jaipur', state: 'Rajasthan' }
  ];

  return (
    <div className="space-y-6">
      {/* Address Information */}
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Property Address <span className="text-red-500">*</span>
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 MG Road"
              className="mt-1"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={formData.landmark}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
              placeholder="Near Metro Station"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => {
                handleInputChange('city', e.target.value);
                if (e.target.value.length > 2) {
                  handleAddressSearch();
                }
              }}
              placeholder="Mumbai"
              className="mt-1"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Maharashtra"
              className="mt-1"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pincode">PIN Code <span className="text-red-500">*</span></Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="400001"
              maxLength={6}
              className="mt-1"
            />
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Contact Information <span className="text-red-500">*</span>
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 border border-r-0 bg-gray-50 text-gray-500">
                +91
              </span>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="rounded-l-none"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="hotel@example.com"
              className="mt-1"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.yourhotel.com"
              className="mt-1"
            />
            {errors.website && (
              <p className="text-red-500 text-sm mt-1">{errors.website}</p>
            )}
          </div>
        </div>
      </div>

      {/* Map Location */}
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Map Location <span className="text-red-500">*</span>
        </Label>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Click on the map or use GPS to set your exact location
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="text-sm"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isLocating ? 'Locating...' : 'Use GPS'}
          </Button>
        </div>

        {/* Map Placeholder - Replace with actual map component */}
        <Card className="h-96 bg-gray-100">
          <CardContent className="p-0 h-full relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Interactive Map</p>
                <p className="text-sm text-gray-500">
                  {markerPosition 
                    ? `Location: ${markerPosition.lat.toFixed(4)}, ${markerPosition.lng.toFixed(4)}`
                    : 'Click to set location'
                  }
                </p>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-2">{errors.location}</p>
                )}
              </div>
            </div>
            
            {/* Mock map controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <Button size="sm" variant="outline" className="block w-full">
                <Building className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Cities */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-800 mb-2">Popular Cities:</p>
              <div className="flex flex-wrap gap-2">
                {popularCities.map((city, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                    onClick={() => {
                      handleInputChange('city', city.name);
                      handleInputChange('state', city.state);
                      handleAddressSearch();
                    }}
                  >
                    {city.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationStep;