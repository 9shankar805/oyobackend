import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Bath, 
  Tv,
  Wind,
  Utensils,
  Package,
  Shield,
  Clock,
  Users,
  Baby,
  Dog,
  Heart,
  Plane,
  Train,
  Hotel,
  Phone,
  Globe,
  Shirt,
  FlaskRound,
  Microwave,
  WashingMachine,
  Refrigerator,
  Sofa,
  TreePine,
  CreditCard,
  Sparkles
} from 'lucide-react';

interface AmenitiesStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const AmenitiesStep: React.FC<AmenitiesStepProps> = ({ data, updateData, validateStep }) => {
  const [amenities, setAmenities] = useState({
    general: data.amenities?.general || [],
    room: data.amenities?.room || [],
    bathroom: data.amenities?.bathroom || [],
    food: data.amenities?.food || [],
    entertainment: data.amenities?.entertainment || [],
    business: data.amenities?.business || []
  });

  const generalAmenities = [
    { icon: Wifi, label: 'Free WiFi', value: 'free_wifi' },
    { icon: Car, label: 'Free Parking', value: 'free_parking' },
    { icon: Coffee, label: 'Breakfast Included', value: 'breakfast' },
    { icon: Dumbbell, label: 'Fitness Center', value: 'fitness' },
    { icon: Heart, label: '24/7 Front Desk', value: 'front_desk_24h' },
    { icon: Shield, label: 'Security', value: 'security' },
    { icon: TreePine, label: 'Garden', value: 'garden' },
    { icon: Users, label: 'Lounge', value: 'lounge' },
    { icon: Package, label: 'Luggage Storage', value: 'luggage_storage' },
    { icon: Baby, label: 'Kids Play Area', value: 'kids_play_area' }
  ];

  const roomAmenities = [
    { icon: Tv, label: 'Television', value: 'tv' },
    { icon: Wind, label: 'Air Conditioning', value: 'ac' },
    { icon: Bath, label: 'Attached Bathroom', value: 'attached_bathroom' },
    { icon: Refrigerator, label: 'Mini Refrigerator', value: 'mini_fridge' },
    { icon: Coffee, label: 'Coffee/Tea Maker', value: 'coffee_maker' },
    { icon: Shirt, label: 'Iron & Ironing Board', value: 'ironing' },
    { icon: Sofa, label: 'Sitting Area', value: 'sitting_area' },
    { icon: FlaskRound, label: 'Safe', value: 'safe' },
    { icon: Sparkles, label: 'Hair Dryer', value: 'hair_dryer' },
    { icon: Globe, label: 'International Channels', value: 'international_channels' }
  ];

  const bathroomAmenities = [
    { icon: Bath, label: 'Hot & Cold Water', value: 'hot_cold_water' },
    { icon: Wind, label: 'Exhaust Fan', value: 'exhaust_fan' },
    { icon: Heart, label: 'Toiletries', value: 'toiletries' },
    { icon: Package, label: 'Towels', value: 'towel' },
    { icon: WashingMachine, label: 'Washing Machine', value: 'washing_machine' },
    { icon: Bath, label: 'Bathtub', value: 'bathtub' },
    { icon: Heart, label: 'Slippers', value: 'slippers' },
    { icon: Phone, label: 'Telephone', value: 'telephone' }
  ];

  const foodAmenities = [
    { icon: Utensils, label: 'Restaurant', value: 'restaurant' },
    { icon: Coffee, label: 'Coffee Shop', value: 'coffee_shop' },
    { icon: Utensils, label: 'Room Service', value: 'room_service' },
    { icon: Dumbbell, label: 'Bar', value: 'bar' },
    { icon: Coffee, label: 'BBQ Facilities', value: 'bbq' },
    { icon: Microwave, label: 'Shared Kitchen', value: 'shared_kitchen' }
  ];

  const entertainmentAmenities = [
    { icon: Tv, label: 'Cinema Hall', value: 'cinema' },
    { icon: Coffee, label: 'Game Room', value: 'game_room' },
    { icon: Dumbbell, label: 'Spa', value: 'spa' },
    { icon: Heart, label: 'Night Club', value: 'night_club' },
    { icon: Globe, label: 'Tour Desk', value: 'tour_desk' }
  ];

  const businessAmenities = [
    { icon: Users, label: 'Conference Room', value: 'conference_room' },
    { icon: Wifi, label: 'Business Center', value: 'business_center' },
    { icon: Clock, label: 'Meeting Rooms', value: 'meeting_rooms' },
    { icon: Plane, label: 'Airport Shuttle', value: 'airport_shuttle' },
    { icon: Train, label: 'Railway Station Transfer', value: 'railway_transfer' },
    { icon: Hotel, label: 'Event Space', value: 'event_space' }
  ];

  useEffect(() => {
    validateForm();
  }, [amenities]);

  const validateForm = () => {
    // Amenities are optional, but at least some selection is good
    const hasAnyAmenities = Object.values(amenities).some(arr => arr.length > 0);
    
    if (hasAnyAmenities) {
      updateData({ amenities });
      validateStep(true);
    } else {
      validateStep(false);
    }
  };

  const toggleAmenity = (category: keyof typeof amenities, value: string) => {
    setAmenities(prev => {
      const updatedCategory = prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value];
      
      return { ...prev, [category]: updatedCategory };
    });
  };

  const renderAmenityGrid = (category: keyof typeof amenities, amenitiesList: any[], title: string) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenitiesList.map((amenity) => {
              const IconComponent = amenity.icon;
              const isSelected = amenities[category].includes(amenity.value);
              
              return (
                <div
                  key={amenity.value}
                  onClick={() => toggleAmenity(category, amenity.value)}
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
                    }`}>{amenity.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {amenities[category].length === 0 && (
            <p className="text-gray-500 text-center py-4 text-sm">
              No amenities selected in this category
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const getTotalAmenities = () => {
    return Object.values(amenities).reduce((total, arr) => total + arr.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-2">Select Your Hotel Amenities</h3>
        <p className="text-gray-600">
          Choose all the facilities and services available at your property
        </p>
      </div>

      {/* Selected Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-600 text-white px-3 py-1">
                {getTotalAmenities()} Selected
              </Badge>
              <p className="text-sm text-blue-800">
                Across {Object.values(amenities).filter(arr => arr.length > 0).length} categories
              </p>
            </div>
            <div className="text-sm text-blue-700">
              Guests filter by amenities - be thorough!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities Categories */}
      <div className="space-y-6">
        {renderAmenityGrid('general', generalAmenities, 'General Amenities')}
        {renderAmenityGrid('room', roomAmenities, 'In-Room Amenities')}
        {renderAmenityGrid('bathroom', bathroomAmenities, 'Bathroom Amenities')}
        {renderAmenityGrid('food', foodAmenities, 'Food & Dining')}
        {renderAmenityGrid('entertainment', entertainmentAmenities, 'Entertainment & Recreation')}
        {renderAmenityGrid('business', businessAmenities, 'Business Services')}
      </div>

      {/* Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Coffee className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-green-800 mb-2">Why Amenities Matter:</p>
              <ul className="text-green-700 space-y-1">
                <li>• Properties with more amenities get 3x more views</li>
                <li>• Guests use amenities as key decision factors</li>
                <li>• Complete amenities list builds trust and reduces questions</li>
                <li>• Premium amenities justify higher pricing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Special Features & Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block">Pet Policy</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'pets_allowed', label: 'Pets Allowed', icon: Dog },
                  { value: 'pets_not_allowed', label: 'No Pets', icon: Heart },
                  { value: 'pets_charge', label: 'Pets with Extra Charge', icon: CreditCard }
                ].map((policy) => {
                  const IconComponent = policy.icon;
                  return (
                    <div
                      key={policy.value}
                      className="border rounded-lg p-3 cursor-pointer hover:border-blue-300 transition-all"
                    >
                      <div className="text-center">
                        <IconComponent className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">{policy.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">Accessibility Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Heart, label: 'Wheelchair Accessible', value: 'wheelchair' },
                  { icon: Bath, label: 'Accessible Bathroom', value: 'accessible_bathroom' },
                  { icon: Hotel, label: 'Ground Floor Rooms', value: 'ground_floor' },
                  { icon: Users, label: 'Assistance Available', value: 'assistance' }
                ].map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={feature.value}
                      className="border rounded-lg p-3 cursor-pointer hover:border-blue-300 transition-all"
                    >
                      <div className="text-center">
                        <IconComponent className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">{feature.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmenitiesStep;