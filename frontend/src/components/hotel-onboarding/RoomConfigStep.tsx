import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bed, 
  Plus, 
  Trash2, 
  Copy, 
  Maximize2, 
  Users, 
  Home,
  Edit2,
  Camera,
  Bath,
  Wind,
  Tv,
  Coffee,
  Wifi
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  size: string;
  maxOccupancy: number;
  beds: string;
  amenities: string[];
  price: number;
  count: number;
  images: string[];
}

interface RoomConfigStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const RoomConfigStep: React.FC<RoomConfigStepProps> = ({ data, updateData, validateStep }) => {
  const [rooms, setRooms] = useState<Room[]>(data.rooms || []);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roomTypes = [
    { 
      value: 'standard', 
      label: 'Standard Room', 
      icon: Bed,
      amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom'],
      basePrice: 1500
    },
    { 
      value: 'deluxe', 
      label: 'Deluxe Room', 
      icon: Home,
      amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Mini Fridge'],
      basePrice: 2500
    },
    { 
      value: 'premium', 
      label: 'Premium Room', 
      icon: Maximize2,
      amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Mini Fridge', 'Balcony'],
      basePrice: 3500
    },
    { 
      value: 'suite', 
      label: 'Suite', 
      icon: Users,
      amenities: ['AC', 'TV', 'WiFi', 'Attached Bathroom', 'Mini Fridge', 'Balcony', 'Living Area'],
      basePrice: 5000
    }
  ];

  const bedTypes = [
    '1 King Bed', '1 Queen Bed', '2 Twin Beds', '2 Double Beds', 
    '1 King + 1 Twin', '1 Queen + 1 Twin', '3 Twin Beds', '1 Double + 1 Twin'
  ];

  const roomSizes = [
    '150-200 sq ft', '200-250 sq ft', '250-300 sq ft', 
    '300-400 sq ft', '400-500 sq ft', '500+ sq ft'
  ];

  const amenitiesOptions = [
    { icon: Wifi, label: 'WiFi', value: 'wifi' },
    { icon: Wind, label: 'Air Conditioning', value: 'ac' },
    { icon: Tv, label: 'TV', value: 'tv' },
    { icon: Bath, label: 'Attached Bathroom', value: 'bathroom' },
    { icon: Coffee, label: 'Mini Fridge', value: 'fridge' },
    { icon: Maximize2, label: 'Balcony', value: 'balcony' },
    { icon: Users, label: 'Living Area', value: 'living_area' },
    { icon: Home, label: 'Kitchen', value: 'kitchen' }
  ];

  useEffect(() => {
    validateRooms();
  }, [rooms]);

  const validateRooms = () => {
    const newErrors: Record<string, string> = {};

    if (rooms.length === 0) {
      newErrors.rooms = 'At least one room type is required';
    }

    let hasValidRooms = false;
    rooms.forEach((room, index) => {
      if (!room.name.trim()) {
        newErrors[`name_${index}`] = 'Room name is required';
      }
      if (!room.type) {
        newErrors[`type_${index}`] = 'Room type is required';
      }
      if (!room.size) {
        newErrors[`size_${index}`] = 'Room size is required';
      }
      if (!room.maxOccupancy || room.maxOccupancy < 1) {
        newErrors[`occupancy_${index}`] = 'Valid occupancy is required';
      }
      if (!room.beds) {
        newErrors[`beds_${index}`] = 'Bed configuration is required';
      }
      if (!room.price || room.price < 100) {
        newErrors[`price_${index}`] = 'Valid price is required';
      }
      if (!room.count || room.count < 1) {
        newErrors[`count_${index}`] = 'Number of rooms is required';
      }

      if (room.name && room.type && room.size && room.maxOccupancy && room.beds && room.price && room.count) {
        hasValidRooms = true;
      }
    });

    setErrors(newErrors);
    const isValid = hasValidRooms && Object.keys(newErrors).length === 0;
    validateStep(isValid);
    
    if (isValid) {
      updateData({ rooms });
    }
  };

  const addRoomType = () => {
    if (!selectedRoomType) return;

    const roomType = roomTypes.find(rt => rt.value === selectedRoomType);
    if (!roomType) return;

    const newRoom: Room = {
      id: `room_${Date.now()}`,
      name: `${roomType.label} ${rooms.length + 1}`,
      type: roomType.value,
      size: roomTypes[0].size || '200-250 sq ft',
      maxOccupancy: roomType.value === 'suite' ? 4 : 2,
      beds: roomType.value === 'suite' ? '1 King + 1 Twin' : '1 Queen Bed',
      amenities: [...roomType.amenities],
      price: roomType.basePrice,
      count: 1,
      images: []
    };

    setRooms(prev => [...prev, newRoom]);
    setSelectedRoomType('');
  };

  const duplicateRoom = (index: number) => {
    const roomToDuplicate = { ...rooms[index] };
    roomToDuplicate.id = `room_${Date.now()}`;
    roomToDuplicate.name = `${roomToDuplicate.name} (Copy)`;
    setRooms(prev => [...prev, roomToDuplicate]);
  };

  const updateRoom = (index: number, field: keyof Room, value: any) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
    
    // Clear specific error when user starts typing
    const errorKey = `${field}_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const deleteRoom = (index: number) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalRooms = () => {
    return rooms.reduce((total, room) => total + room.count, 0);
  };

  const getTotalRevenue = () => {
    return rooms.reduce((total, room) => total + (room.price * room.count), 0);
  };

  return (
    <div className="space-y-6">
      {/* Add New Room Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Room Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Select Room Type</Label>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a room type to add" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{type.label}</span>
                          <Badge variant="outline" className="ml-2">
                            ₹{type.basePrice.toLocaleString()}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={addRoomType}
                disabled={!selectedRoomType}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Room Type
              </Button>
            </div>
          </div>
          {errors.rooms && (
            <p className="text-red-500 text-sm mt-2">{errors.rooms}</p>
          )}
        </CardContent>
      </Card>

      {/* Room Types List */}
      <div className="space-y-4">
        {rooms.map((room, index) => (
          <Card key={room.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {roomTypes.find(rt => rt.value === room.type)?.icon && 
                    React.createElement(roomTypes.find(rt => rt.value === room.type)!.icon, {
                      className: 'w-5 h-5 text-blue-600'
                    })
                  }
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge variant="secondary">{room.type}</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateRoom(index)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRoom(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Room Name</Label>
                  <Input
                    value={room.name}
                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                    placeholder="Standard Room 101"
                    className="mt-1"
                  />
                  {errors[`name_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`name_${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label>Room Size</Label>
                  <Select value={room.size} onValueChange={(value) => updateRoom(index, 'size', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomSizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`size_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`size_${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label>Bed Configuration</Label>
                  <Select value={room.beds} onValueChange={(value) => updateRoom(index, 'beds', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bedTypes.map(bed => (
                        <SelectItem key={bed} value={bed}>{bed}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`beds_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`beds_${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label>Max Occupancy</Label>
                  <Input
                    type="number"
                    value={room.maxOccupancy}
                    onChange={(e) => updateRoom(index, 'maxOccupancy', parseInt(e.target.value) || 0)}
                    min="1"
                    max="10"
                    className="mt-1"
                  />
                  {errors[`occupancy_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`occupancy_${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label>Number of Rooms</Label>
                  <Input
                    type="number"
                    value={room.count}
                    onChange={(e) => updateRoom(index, 'count', parseInt(e.target.value) || 0)}
                    min="1"
                    max="100"
                    className="mt-1"
                  />
                  {errors[`count_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`count_${index}`]}</p>
                  )}
                </div>

                <div>
                  <Label>Price per Night (₹)</Label>
                  <Input
                    type="number"
                    value={room.price}
                    onChange={(e) => updateRoom(index, 'price', parseInt(e.target.value) || 0)}
                    min="100"
                    max="50000"
                    className="mt-1"
                  />
                  {errors[`price_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`price_${index}`]}</p>
                  )}
                </div>
              </div>

              {/* Amenities Selection */}
              <div className="mt-4">
                <Label className="text-base font-medium mb-3 block">Room Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesOptions.map((amenity) => {
                    const IconComponent = amenity.icon;
                    const isSelected = room.amenities.includes(amenity.value);
                    
                    return (
                      <div
                        key={amenity.value}
                        onClick={() => {
                          const updatedAmenities = isSelected
                            ? room.amenities.filter(a => a !== amenity.value)
                            : [...room.amenities, amenity.value];
                          updateRoom(index, 'amenities', updatedAmenities);
                        }}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
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
              </div>

              {/* Images Upload */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-base font-medium">Room Photos</Label>
                  <Button size="sm" variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
                
                {room.images.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No photos uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload at least 3 photos per room type
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {room.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img
                          src={image}
                          alt={`${room.name} ${imgIndex + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {rooms.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{rooms.length}</p>
                <p className="text-gray-600">Room Types</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{getTotalRooms()}</p>
                <p className="text-gray-600">Total Rooms</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{getTotalRevenue().toLocaleString()}
                </p>
                <p className="text-gray-600">Daily Revenue Potential</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoomConfigStep;