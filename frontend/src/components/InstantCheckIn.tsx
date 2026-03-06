import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  QrCode, 
  CheckCircle, 
  XCircle,
  Wifi,
  Key,
  MapPin,
  Phone,
  CreditCard,
  User,
  Calendar,
  Home,
  ChevronRight,
  Shield,
  Zap,
  AlertCircle,
  Info
} from 'lucide-react';

interface Booking {
  bookingNumber: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
}

interface DigitalKey {
  keyId: string;
  roomNumber: string;
  validFrom: string;
  validUntil: string;
  accessLevel: string;
  hotelWifi: string;
  wifiPassword: string;
}

const InstantCheckIn: React.FC = () => {
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [digitalKey, setDigitalKey] = useState<DigitalKey | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-load user's active booking
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeBookings = data.data.filter((b: any) => 
          b.status === 'CONFIRMED' && 
          new Date(b.checkIn).toDateString() === new Date().toDateString()
        );
        
        if (activeBookings.length > 0) {
          setBookingNumber(activeBookings[0].bookingNumber);
          setBooking(activeBookings[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchCheckInStatus = async () => {
    if (!bookingNumber) return;
    
    try {
      const response = await fetch(`/api/checkin/status/${bookingNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCheckInStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error);
    }
  };

  const generateQRCode = async () => {
    if (!bookingNumber) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/checkin/qrcode/${bookingNumber}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrData(data.data.qrData);
        setShowQRCode(true);
        setBooking(data.data.booking);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const processCheckIn = async () => {
    if (!bookingNumber || !verificationCode) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/checkin/process/${bookingNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          verificationCode: verificationCode.toUpperCase(),
          location: {} // GPS coordinates in real app
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDigitalKey(data.data.digitalKey);
        setShowQRCode(false);
        setCheckInStatus({ ...checkInStatus, bookingStatus: 'CHECKED_IN' });
        setVerificationCode('');
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      console.error('Error processing check-in:', error);
      setError('Failed to process check-in');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!checkInStatus) return '';
    
    if (checkInStatus.bookingStatus === 'CHECKED_IN') {
      return 'You have successfully checked in!';
    }
    
    if (checkInStatus.canCheckIn) {
      return 'You are eligible for instant check-in!';
    }
    
    if (checkInStatus.hoursUntilCheckIn > 24) {
      return `Check-in available in ${Math.floor(checkInStatus.hoursUntilCheckIn / 24)} days`;
    }
    
    if (checkInStatus.hoursUntilCheckIn > 0) {
      return `Check-in available in ${Math.round(checkInStatus.hoursUntilCheckIn)} hours`;
    }
    
    return 'Contact front desk for assistance';
  };

  if (digitalKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">Check-in Complete!</h1>
            <p className="text-gray-600">Your digital room key is now active</p>
          </div>

          {/* Digital Key Card */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm opacity-80">Room Number</p>
                  <p className="text-2xl font-bold">{digitalKey.roomNumber}</p>
                </div>
                <Key className="w-12 h-12 opacity-80" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Key ID: {digitalKey.keyId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Valid until {new Date(digitalKey.validUntil).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wi-Fi Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="w-5 h-5 mr-2" />
                Complimentary Wi-Fi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Network:</span>
                  <span>{digitalKey.hotelWifi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Password:</span>
                  <span className="font-mono">{digitalKey.wifiPassword}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Information */}
          {booking && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Hotel:</span>
                    <span className="font-medium">{booking.hotelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span className="font-medium">{booking.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Proceed directly to your room - no need to visit the front desk</span>
                </div>
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Use your digital key to access the room</span>
                </div>
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Connect to complimentary Wi-Fi using credentials above</span>
                </div>
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-5 h-5 text-green-500 mt-0.5" />
                  <span>Contact front desk for any assistance during your stay</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Instant Check-in</h1>
          <p className="text-gray-600">Skip the queue and check-in in under 60 seconds</p>
        </div>

        {/* Booking Status */}
        {checkInStatus && (
          <Card className={`border-l-4 ${
            checkInStatus.canCheckIn ? 'border-l-green-500' : 
            checkInStatus.bookingStatus === 'CHECKED_IN' ? 'border-l-blue-500' : 'border-l-orange-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                {checkInStatus.canCheckIn ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : checkInStatus.bookingStatus === 'CHECKED_IN' ? (
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                )}
                <div>
                  <p className="font-semibold">{getStatusMessage()}</p>
                  <p className="text-sm text-gray-600">
                    {checkInStatus.bookingStatus === 'CONFIRMED' && checkInStatus.canCheckIn 
                      ? 'Start your instant check-in now' 
                      : getStatusMessage()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Booking Number</label>
                <input
                  type="text"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
                  placeholder="E.g., OYO123456"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button 
                onClick={fetchCheckInStatus} 
                className="w-full"
                disabled={!bookingNumber}
              >
                Check Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code Section */}
        {showQRCode && qrData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Your Check-in QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {/* QR Code Placeholder */}
                <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">QR Code</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Booking Information:</p>
                  <div className="text-left space-y-1 text-sm">
                    <p><strong>Name:</strong> {qrData.guestName}</p>
                    <p><strong>Hotel:</strong> {qrData.hotelName}</p>
                    <p><strong>Room:</strong> {qrData.roomType}</p>
                    <p><strong>Check-in:</strong> {new Date(qrData.checkIn).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Verification Code:</strong> {bookingNumber?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Enter this code when prompted
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Section */}
        {showQRCode && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder={`Code: ${bookingNumber?.slice(-6).toUpperCase()}`}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={processCheckIn} 
                  className="w-full"
                  disabled={verificationCode.length !== 6 || loading}
                >
                  {loading ? 'Processing...' : 'Complete Check-in'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!showQRCode && checkInStatus?.canCheckIn && (
          <Button 
            onClick={generateQRCode} 
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Start Instant Check-in'}
          </Button>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">60-Second Check-in</p>
              <p className="text-sm text-gray-600">Skip the front desk queue</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Key className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Digital Room Key</p>
              <p className="text-sm text-gray-600">Access your room with your phone</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Wifi className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Free Wi-Fi</p>
              <p className="text-sm text-gray-600">Instant internet access</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstantCheckIn;