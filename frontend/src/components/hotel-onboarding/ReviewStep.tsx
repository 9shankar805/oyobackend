import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  AlertTriangle, 
  Building, 
  MapPin, 
  Bed, 
  Wifi, 
  Camera, 
  DollarSign, 
  FileText, 
  Star, 
  Eye, 
  Download,
  Shield,
  Clock,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react';

interface ReviewStepProps {
  data: any;
  updateData: (data: any) => void;
  validateStep: (isValid: boolean) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, updateData, validateStep }) => {
  const [completionScore, setCompletionScore] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    calculateCompletion();
  }, [data]);

  const calculateCompletion = () => {
    let score = 0;
    const missing: string[] = [];

    // Basic Information (25%)
    if (data.name && data.name.length >= 3) score += 5;
    else missing.push('Hotel name');

    if (data.description && data.description.length >= 50) score += 5;
    else missing.push('Description');

    if (data.propertyType) score += 5;
    else missing.push('Property type');

    if (data.category) score += 5;
    else missing.push('Category');

    if (data.totalRooms >= 1) score += 5;
    else missing.push('Total rooms');

    // Location (20%)
    if (data.address && data.city && data.state && data.pincode) score += 4;
    else missing.push('Complete address');

    if (data.phone && data.email) score += 4;
    else missing.push('Contact information');

    if (data.latitude && data.longitude) score += 4;
    else missing.push('Map location');

    if (data.landmark) score += 4;
    // landmark is optional

    // Rooms (20%)
    if (data.rooms && data.rooms.length >= 1) score += 6;
    else missing.push('Room configuration');

    const validRooms = data.rooms?.filter((room: any) => 
      room.name && room.type && room.maxOccupancy && room.price
    ) || [];
    if (validRooms.length > 0) score += 4;
    else missing.push('Valid room details');

    const roomPhotos = data.rooms?.reduce((total: number, room: any) => 
      total + (room.images?.length || 0), 0) || 0;
    if (roomPhotos >= data.rooms?.length) score += 4;
    else missing.push('Room photos');

    // Amenities (15%)
    const totalAmenities = Object.values(data.amenities || {}).reduce(
      (sum: number, arr: any[]) => sum + (arr?.length || 0), 0
    );
    if (totalAmenities >= 5) score += 5;
    else missing.push('Sufficient amenities');

    // Photos (10%)
    const totalPhotos = Object.values(data.photos || {}).reduce(
      (sum: number, arr: any[]) => sum + (arr?.length || 0), 0
    );
    if (totalPhotos >= 10) score += 5;
    else missing.push('Minimum 10 photos');

    // Pricing (10%)
    if (data.pricing?.basePrice >= 100) score += 4;
    else missing.push('Base pricing');

    if (data.pricing?.checkInTime && data.pricing?.checkOutTime) score += 3;
    else missing.push('Check-in/out times');

    // Policies (10%)
    if (data.policies?.cancellationPolicy) score += 4;
    else missing.push('Cancellation policy');

    if (data.policies?.paymentMethods?.length > 0) score += 3;
    else missing.push('Payment methods');

    // Extra bonus points
    if (data.yearBuilt) score += 2;
    if (data.website) score += 2;
    if (totalPhotos >= 20) score += 2;
    if (totalAmenities >= 15) score += 2;

    setCompletionScore(Math.min(100, score));
    setMissingFields(missing);
    validateStep(missing.length === 0);
  };

  const getQualityScore = () => {
    if (completionScore >= 90) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (completionScore >= 80) return { color: 'bg-blue-100 text-blue-800', label: 'Good' };
    if (completionScore >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' };
    return { color: 'bg-red-100 text-red-800', label: 'Needs Improvement' };
  };

  const submitHotel = async () => {
    if (completionScore < 100) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to submit hotel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On successful submission
      alert('Hotel submitted successfully! It will be reviewed within 24 hours.');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting hotel:', error);
      alert('Failed to submit hotel. Please try again.');
      setIsSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    try {
      // Simulate saving draft
      alert('Hotel saved as draft. You can continue later.');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft.');
    }
  };

  const qualityScore = getQualityScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Review & Submit Your Hotel</h3>
        <p className="text-gray-600">
          Review all information before submitting for approval
        </p>
      </div>

      {/* Completion Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Profile Completion Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-4xl font-bold text-blue-600">{completionScore}%</p>
              <Badge className={`mt-2 ${qualityScore.color}`}>
                {qualityScore.label} Quality
              </Badge>
            </div>
            <div className="text-right">
              <Progress value={completionScore} className="w-32" />
              <p className="text-sm text-gray-600 mt-1">Complete to submit</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Missing Required Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800">{field}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotel Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Hotel Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Basic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{data.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="secondary">{data.propertyType || 'Not set'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline">{data.category || 'Not set'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rooms:</span>
                  <span className="font-medium">{data.totalRooms || 'Not set'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Contact & Location</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-sm">{data.address || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium">{data.city || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{data.phone || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-sm">{data.email || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Summary */}
      {data.rooms && data.rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bed className="w-5 h-5 mr-2" />
              Room Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.rooms.map((room: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <h5 className="font-medium mb-2">{room.name}</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline" className="text-xs">{room.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Occupancy:</span>
                      <span>{room.maxOccupancy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">₹{room.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Count:</span>
                      <span>{room.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amenities Summary */}
      {data.amenities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wifi className="w-5 h-5 mr-2" />
              Amenities Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(data.amenities).map(([category, items]: [string, any[]]) => (
                <div key={category} className="text-center">
                  <h5 className="font-medium mb-2 capitalize">{category}</h5>
                  <Badge variant="outline">{items?.length || 0} items</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Summary */}
      {data.photos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Photos Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(data.photos).map(([category, photos]: [string, any[]]) => (
                <div key={category} className="text-center">
                  <h5 className="font-medium mb-2 capitalize">{category}</h5>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant={photos.length >= 2 ? 'default' : 'secondary'}>
                      {photos?.length || 0} photos
                    </Badge>
                    {photos.length > 0 && (
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold">
                Total: {Object.values(data.photos).reduce((sum: number, arr: any[]) => 
                  sum + (arr?.length || 0), 0)} photos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Summary */}
      {data.pricing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pricing Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{data.pricing.basePrice || 0}
                </p>
                <p className="text-gray-600">Base Price</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ₹{data.pricing.weekendPrice || 0}
                </p>
                <p className="text-gray-600">Weekend Price</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {data.pricing.taxes || 0}%
                </p>
                <p className="text-gray-600">Taxes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {data.pricing.commission || 0}%
                </p>
                <p className="text-gray-600">Commission</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-3">Policies</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium ml-1">{data.policies.checkInTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium ml-1">{data.policies.checkOutTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cancellation:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {data.policies.cancellationPolicy}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Payment:</span>
                  <Badge variant="outline" className="ml-1 text-xs">
                    {data.policies.paymentMethods?.length || 0} methods
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium">I confirm that all provided information is accurate</p>
                <p className="text-sm text-gray-600">
                  False information may lead to account suspension
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium">I agree to the platform terms and conditions</p>
                <p className="text-sm text-gray-600">
                  Including commission rates and payment terms
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium">I understand the review process</p>
                <p className="text-sm text-gray-600">
                  Hotel will be reviewed within 24-48 hours before going live
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={saveAsDraft}>
          <Download className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview Listing
          </Button>
          
          <Button 
            onClick={submitHotel}
            disabled={completionScore < 100 || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-1" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">What happens next?</p>
              <ul className="space-y-1">
                <li>• Your hotel will be reviewed by our team</li>
                <li>• Review typically takes 24-48 hours</li>
                <li>• You'll receive email confirmation</li>
                <li>• Once approved, your hotel goes live immediately</li>
                <li>• You can start receiving bookings right away</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;