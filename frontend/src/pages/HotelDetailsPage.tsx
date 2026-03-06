import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthProvider'
import { Star, Heart, MapPin, Phone, Clock, Wifi, Car, Coffee, Tv, Shield, Users } from 'lucide-react'

type Room = {
  id: string
  hotelId: string
  name: string
  pricePerNight: number
  capacity: number
  inventory: number
  features?: string[]
}

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
}

type HotelDetails = {
  id: string
  name: string
  location: string
  address: string
  amenities: string[]
  description: string
  images: Array<{ url: string }>
  rooms: Room[]
  reviews: Review[]
  phone?: string
  checkIn?: string
  checkOut?: string
  rating?: number
  reviewCount?: number
}

export default function HotelDetailsPage() {
  const { id } = useParams()
  const { auth } = useAuth()
  const [roomId, setRoomId] = useState<string>('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [chatVisible, setChatVisible] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const res = await api.get<HotelDetails>(`/api/hotels/${id}`)
      return res.data
    },
    enabled: Boolean(id),
  })

  const selectedRoom = useMemo(() => data?.rooms.find((r) => r.id === roomId) || null, [data, roomId])

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!id || !roomId || !checkIn || !checkOut) throw new Error('Missing fields')
      const res = await api.post('/api/bookings', { hotelId: id, roomId, checkIn, checkOut, guests: 1 })
      return res.data
    },
  })

  const getAmenityIcon = (amenity: string) => {
    const icons = {
      'wifi': <Wifi className="w-5 h-5" />,
      'ac': <div className="w-5 h-5 text-center">❄️</div>,
      'parking': <Car className="w-5 h-5" />,
      'restaurant': <Coffee className="w-5 h-5" />,
      'tv': <Tv className="w-5 h-5" />,
      'security': <Shield className="w-5 h-5" />
    }
    return icons[amenity.toLowerCase()] || <div className="w-5 h-5">✓</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Hotel not found.</div>
      </div>
    )
  }

  const mockImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Live Chat Button */}
      <button 
        className="fixed top-4 right-4 z-50 flex items-center bg-red-600 text-white px-3 py-2 rounded-full shadow-lg animate-pulse"
        onClick={() => setChatVisible(true)}
      >
        <span className="text-sm mr-1">💬</span>
        <span className="text-xs font-medium">Live Chat</span>
      </button>

      {/* Image Carousel */}
      <div className="relative">
        <div className="w-full h-64 overflow-hidden">
          <img
            src={mockImages[currentImageIndex]}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
          {currentImageIndex + 1} / {mockImages.length}
        </div>
        <button className="absolute bottom-4 left-4 flex items-center bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
          <span className="mr-1">📷</span>
          Gallery
        </button>
      </div>

      <div className="p-4">
        {/* Hotel Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{data.name}</h1>
          <div className="flex items-center mb-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium text-gray-800">{data.rating || 4.2}</span>
            <span className="text-sm text-gray-500 ml-1">({data.reviewCount || 156} reviews)</span>
          </div>
          <p className="text-gray-600 mb-4">{data.location}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{data.address}</span>
            </div>
            <div className="flex items-center text-red-600 cursor-pointer">
              <span className="mr-2">💬</span>
              <span>Live Chat Support</span>
            </div>
            {data.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{data.phone}</span>
              </div>
            )}
          </div>

          <div className="flex justify-around mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">Check-in</p>
              <p className="font-semibold">{data.checkIn || '2:00 PM'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Check-out</p>
              <p className="font-semibold">{data.checkOut || '11:00 AM'}</p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
          <div className="grid grid-cols-2 gap-3">
            {(data.amenities || ['WiFi', 'AC', 'Parking', 'Restaurant', 'Room Service', 'Laundry']).map((amenity, index) => (
              <div key={index} className="flex items-center">
                <div className="text-red-600 mr-3">
                  {getAmenityIcon(amenity)}
                </div>
                <span className="text-sm text-gray-800">{amenity}</span>
                <span className="text-xs text-green-600 ml-auto">Free</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available Rooms */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Available Rooms</h2>
          {(data.rooms || []).map((room) => (
            <div key={room.id} className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                  <p className="text-sm text-gray-600">Up to {room.capacity} guests</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(room.features || ['Queen Bed', 'City View', 'Mini Bar']).map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-baseline">
                  <span className="text-sm text-gray-400 line-through mr-2">₹{Math.round(room.pricePerNight * 1.3)}</span>
                  <span className="text-xl font-bold text-red-600">₹{room.pricePerNight}</span>
                  <span className="text-xs text-gray-500 ml-1">per night</span>
                </div>
                <button 
                  className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-md"
                  onClick={() => setRoomId(room.id)}
                >
                  Select Room
                </button>
              </div>
              
              <p className="text-xs text-red-500 italic">
                {room.inventory} rooms left at this price
              </p>
            </div>
          ))}
        </div>

        {/* Policies */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Policies</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">❌</span>
              <span>Free cancellation up to 24 hours before check-in</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🐕</span>
              <span>Pets not allowed</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🚭</span>
              <span>No smoking</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews</h2>
          {(data.reviews || []).length === 0 ? (
            <div className="text-gray-500 text-center py-8">No reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {(data.reviews || []).slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment || 'Great stay!'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-red-600">₹{data.rooms?.[0]?.pricePerNight || 1299}</p>
          </div>
          <button 
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg"
            disabled={!auth || auth.user.role !== 'customer' || bookMutation.isPending}
            onClick={() => bookMutation.mutate()}
          >
            {auth?.user.role === 'customer' ? 'Book Now' : 'Login to Book'}
          </button>
        </div>
      </div>

      {/* Booking Success/Error Messages */}
      {bookMutation.isSuccess && (
        <div className="fixed top-20 left-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          Booking confirmed successfully!
        </div>
      )}
      {bookMutation.isError && (
        <div className="fixed top-20 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          Booking failed. Please try again.
        </div>
      )}
    </div>
  )
}
