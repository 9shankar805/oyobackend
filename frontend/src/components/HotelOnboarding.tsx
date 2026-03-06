import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Upload, 
  MapPin, 
  Home, 
  Bed, 
  Wifi, 
  Car,
  Coffee,
  Tv,
  Wind,
  Users,
  Star,
  Clock,
  Shield,
  FileText,
  Camera,
  Settings,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Globe,
  Building,
  Key,
  Bath,
  Maximize2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Step Components
import BasicInfoStep from './hotel-onboarding/BasicInfoStep';
import LocationStep from './hotel-onboarding/LocationStep';
import RoomConfigStep from './hotel-onboarding/RoomConfigStep';
import AmenitiesStep from './hotel-onboarding/AmenitiesStep';
import PhotosStep from './hotel-onboarding/PhotosStep';
import PricingStep from './hotel-onboarding/PricingStep';
import PoliciesStep from './hotel-onboarding/PoliciesStep';
import ReviewStep from './hotel-onboarding/ReviewStep';

interface HotelData {
  // Basic Info
  name: string;
  description: string;
  propertyType: string;
  category: string;
  totalRooms: number;
  yearBuilt: string;
  yearRenovated: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  landmark: string;
  phone: string;
  email: string;
  website: string;
  
  // Rooms
  rooms: Array<{
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
  }>;
  
  // Amenities
  amenities: {
    general: string[];
    room: string[];
    bathroom: string[];
    food: string[];
    entertainment: string[];
    business: string[];
  };
  
  // Photos
  photos: {
    exterior: string[];
    lobby: string[];
    rooms: string[];
    amenities: string[];
    dining: string[];
    surroundings: string[];
  };
  
  // Pricing
  pricing: {
    basePrice: number;
    weekendPrice: number;
    seasonalPrice: number;
    taxes: number;
    commission: number;
    cancellationPolicy: string;
  };
  
  // Policies
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
    idRequired: boolean;
    paymentMethods: string[];
  };
}

const HotelOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hotelData, setHotelData] = useState<HotelData>({
    // Initialize with empty data
    name: '',
    description: '',
    propertyType: '',
    category: '',
    totalRooms: 0,
    yearBuilt: '',
    yearRenovated: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    latitude: 0,
    longitude: 0,
    landmark: '',
    phone: '',
    email: '',
    website: '',
    rooms: [],
    amenities: {
      general: [],
      room: [],
      bathroom: [],
      food: [],
      entertainment: [],
      business: []
    },
    photos: {
      exterior: [],
      lobby: [],
      rooms: [],
      amenities: [],
      dining: [],
      surroundings: []
    },
    pricing: {
      basePrice: 0,
      weekendPrice: 0,
      seasonalPrice: 0,
      taxes: 18,
      commission: 15,
      cancellationPolicy: 'flexible'
    },
    policies: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'flexible',
      petPolicy: 'not_allowed',
      smokingPolicy: 'non_smoking',
      idRequired: true,
      paymentMethods: ['card', 'upi', 'cash']
    }
  });

  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false
  });

  const totalSteps = 8;

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Property details & classification',
      icon: Building,
      component: BasicInfoStep
    },
    {
      id: 2,
      title: 'Location',
      description: 'Address & map location',
      icon: MapPin,
      component: LocationStep
    },
    {
      id: 3,
      title: 'Room Configuration',
      description: 'Room types & inventory',
      icon: Bed,
      component: RoomConfigStep
    },
    {
      id: 4,
      title: 'Amenities',
      description: 'Facilities & services',
      icon: Wifi,
      component: AmenitiesStep
    },
    {
      id: 5,
      title: 'Photos',
      description: 'Property images',
      icon: Camera,
      component: PhotosStep
    },
    {
      id: 6,
      title: 'Pricing',
      description: 'Rates & revenue settings',
      icon: DollarSign,
      component: PricingStep
    },
    {
      id: 7,
      title: 'Policies',
      description: 'House rules & terms',
      icon: FileText,
      component: PoliciesStep
    },
    {
      id: 8,
      title: 'Review & Submit',
      description: 'Final verification',
      icon: CheckCircle,
      component: ReviewStep
    }
  ];

  const updateHotelData = (stepData: any) => {
    setHotelData(prev => ({ ...prev, ...stepData }));
  };

  const validateStep = (step: number, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [step]: isValid }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const calculateProgress = () => {
    return (currentStep / totalSteps) * 100;
  };

  const getCompletedSteps = () => {
    return Object.values(stepValidation).filter(Boolean).length;
  };

  const CurrentStepComponent = steps[currentStep - 1].component;
  const StepIcon = steps[currentStep - 1].icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold">OYO 360 - Hotel Onboarding</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {getCompletedSteps()}/{totalSteps} Steps Completed
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Complete your hotel registration</h2>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          
          <Progress value={calculateProgress()} className="h-2 mb-6" />
          
          {/* Step Navigation */}
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIconComponent = step.icon;
              const isCompleted = stepValidation[step.id];
              const isCurrent = currentStep === step.id;
              const isPast = currentStep > step.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    isCurrent ? 'scale-105' : ''
                  } ${isPast ? 'opacity-100' : 'opacity-60'}`}
                  onClick={() => isPast && goToStep(step.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <StepIconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-20">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{steps[currentStep - 1].title}</CardTitle>
                  <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <CurrentStepComponent
                data={hotelData}
                updateData={updateHotelData}
                validateStep={(isValid: boolean) => validateStep(currentStep, isValid)}
              />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {getCompletedSteps()} of {totalSteps} steps completed
              </div>
              <Button
                onClick={nextStep}
                disabled={!stepValidation[currentStep]}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === totalSteps ? 'Submit' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Sidebar */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30">
        <Card className="w-64 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Quick Help
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Save your progress anytime</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Minimum 10 photos required</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Complete all mandatory fields</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <span>Review before submission</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotelOnboarding;