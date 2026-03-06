import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  TrendingUp,
  Shield,
  Phone,
  Globe,
  Home,
  Building,
  Wifi,
  Coffee,
  Car,
  Check,
  ChevronRight,
  Menu,
  User,
  LogIn,
  Plus,
  Clock,
  CreditCard,
  Award,
  Zap
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const popularDestinations = [
    { name: 'Bangalore', hotels: 2847, image: '/cities/bangalore.jpg' },
    { name: 'Delhi', hotels: 3421, image: '/cities/delhi.jpg' },
    { name: 'Mumbai', hotels: 2156, image: '/cities/mumbai.jpg' },
    { name: 'Goa', hotels: 892, image: '/cities/goa.jpg' },
    { name: 'Jaipur', hotels: 654, image: '/cities/jaipur.jpg' },
    { name: 'Pune', hotels: 1123, image: '/cities/pune.jpg' }
  ];

  const propertyTypes = [
    { type: 'hotels', label: 'Hotels', icon: Building, count: '150,000+' },
    { type: 'homes', label: 'OYO Homes', icon: Home, count: '15,000+' },
    { type: 'vacation', label: 'Vacation Homes', icon: Home, count: '8,000+' },
    { type: 'long-stays', label: 'Long Stays', icon: Clock, count: '3,000+' },
    { type: 'business', label: 'OYO Business', icon: Users, count: '2,000+' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'OYO Wizard',
      description: 'Get exclusive discounts and rewards on every booking',
      badge: 'LOYALTY PROGRAM'
    },
    {
      icon: Wifi,
      title: 'Free WiFi',
      description: 'Stay connected with complimentary high-speed internet',
      badge: 'STANDARD AMENITY'
    },
    {
      icon: Coffee,
      title: 'Complimentary Breakfast',
      description: 'Start your day with delicious breakfast options',
      badge: 'SELECT PROPERTIES'
    },
    {
      icon: Car,
      title: 'Free Parking',
      description: 'Hassle-free parking available at most locations',
      badge: 'SELECT PROPERTIES'
    },
    {
      icon: CreditCard,
      title: 'Pay at Hotel',
      description: 'Flexible payment options including cash on arrival',
      badge: 'CONVENIENCE'
    },
    {
      icon: Award,
      title: 'Best Price Guarantee',
      description: 'Find lower rates and get the difference back',
      badge: 'PRICE PROTECTION'
    }
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Business Traveler',
      content: 'OYO has made my business trips so convenient. The app is user-friendly and check-in process is seamless.',
      rating: 5,
      trip: 'Multiple stays in Bangalore & Delhi'
    },
    {
      name: 'Priya Patel',
      role: 'Leisure Traveler',
      content: 'Love the consistency of OYO hotels. You always know what to expect - clean rooms and great service.',
      rating: 4,
      trip: 'Weekend trip to Goa'
    },
    {
      name: 'Amit Kumar',
      role: 'Family Traveler',
      content: 'The OYO Wizard loyalty program saves us money on every family vacation. Great rewards and benefits!',
      rating: 5,
      trip: 'Summer vacation with kids'
    }
  ];

  useEffect(() => {
    // Generate search suggestions based on input
    if (searchQuery.length > 2) {
      const suggestions = [
        `${searchQuery} city center`,
        `${searchQuery} airport area`,
        `${searchQuery} railway station`,
        `${searchQuery} business district`
      ];
      setSearchSuggestions(suggestions.slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    // Navigate to hotels page with search parameters
    navigate('/hotels', {
      state: {
        location: searchQuery,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        rooms
      }
    });
  };

  const handleDestinationClick = (destination: any) => {
    navigate('/hotels', {
      state: { location: destination.name }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">OYO</span>
              </div>
              <span className="ml-3 text-xl font-semibold hidden sm:block">Life Great Moments</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-medium transition-colors">
                  <span>Stays</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {propertyTypes.map((prop, index) => (
                    <div key={prop.type} className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <prop.icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{prop.label}</p>
                          <p className="text-sm text-gray-500">{prop.count} properties</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Homes
              </button>
              
              <button className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Long Stays
              </button>
              
              <button className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Business Travel
              </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Select defaultValue="en">
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                  <SelectItem value="bn">বাংলা</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" />
                List your property
              </Button>
              
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <LogIn className="w-4 h-4 mr-2" />
                Login / Signup
              </Button>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="p-4 space-y-4">
            <button className="w-full text-left p-3 hover:bg-gray-50">Stays</button>
            <button className="w-full text-left p-3 hover:bg-gray-50">Homes</button>
            <button className="w-full text-left p-3 hover:bg-gray-50">Long Stays</button>
            <button className="w-full text-left p-3 hover:bg-gray-50">Business Travel</button>
            <button className="w-full text-left p-3 hover:bg-gray-50">
              <Plus className="w-4 h-4 mr-2 inline" />
              List your property
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-red-600 to-red-700">
        <div className="absolute inset-0">
          <img 
            src="/images/hero-hotel.jpg" 
            alt="Hotel background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              From Stays to Experiences
            </h1>
            <p className="text-2xl mb-12 opacity-90">
              Your Trusted Hotel Partner in India & Beyond
            </p>
            <p className="text-lg mb-12 opacity-80">
              Over 1,74,000+ hotels and homes across 35+ countries
            </p>
            
            {/* Search Widget */}
            <Card className="bg-white/95 backdrop-blur-sm max-w-3xl mx-auto">
              <CardContent className="p-6">
                {/* Location Search */}
                <div className="relative mb-4">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by city, hotel, or neighborhood"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-lg"
                  />
                  {searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border z-10">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => setSearchQuery(suggestion.split(' ')[0])}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <Select value={guests.toString()} onValueChange={(val) => setGuests(parseInt(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                    <Select value={rooms.toString()} onValueChange={(val) => setRooms(parseInt(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Room</SelectItem>
                        <SelectItem value="2">2 Rooms</SelectItem>
                        <SelectItem value="3">3 Rooms</SelectItem>
                        <SelectItem value="4">4+ Rooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 text-lg bg-red-600 hover:bg-red-700"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Hotels
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Explore our top-rated hotels in India's favorite cities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((destination, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.hotels} hotels</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-red-600 group-hover:text-white transition-colors">
                  Explore {destination.name}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose OYO?</h2>
            <p className="text-xl text-gray-600">Experience comfort, convenience, and great value</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <feature.icon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <Badge variant="secondary" className="mb-4 bg-red-100 text-red-800">
                    {feature.badge}
                  </Badge>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">1,74,000+</div>
              <p className="text-gray-600">Hotels & Homes</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">35+</div>
              <p className="text-gray-600">Countries</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">50M+</div>
              <p className="text-gray-600">App Downloads</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <span className="text-4xl font-bold text-red-600">4.6</span>
                <div className="flex text-yellow-400 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600">App Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Guests Say</h2>
            <p className="text-xl text-gray-600">Real experiences from real travelers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 italic mb-4 flex-grow">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <p className="text-sm text-gray-500">{testimonial.trip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Download CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Get the OYO App</h2>
          <p className="text-xl text-white/90 mb-8">Book on the go with exclusive app-only deals</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button variant="outline" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Download for Android
              </div>
            </Button>
            <Button variant="outline" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3">
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Download for iOS
              </div>
            </Button>
          </div>
          
          <div className="mt-8">
            <p className="text-white/80 text-sm">
              Available on App Store, Google Play, and our website
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About OYO</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Partner with Us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400 transition-colors">List Your Property</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Franchise Opportunities</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Advertise With Us</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Business Travel</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-red-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 OYO. All rights reserved. Trusted by millions worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;