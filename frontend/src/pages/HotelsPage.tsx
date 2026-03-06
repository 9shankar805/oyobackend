import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Star, Heart, Filter, Map } from 'lucide-react'

type HotelListItem = {
  id: string
  name: string
  location: string
  address: string
  amenities: string[]
  startingPrice: number | null
  rating: number | null
  images?: string[]
  reviewCount?: number
}

async function fetchHotels(params: Record<string, string>) {
  const res = await api.get<HotelListItem[]>('/api/hotels', { params })
  return res.data
}

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('rating')

  const initialLocation = searchParams.get('location') || ''
  const [location, setLocation] = useState(initialLocation)
  const [amenity, setAmenity] = useState(searchParams.get('amenity') || '')

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {}
    if (searchParams.get('location')) p.location = searchParams.get('location') as string
    if (searchParams.get('amenity')) p.amenity = searchParams.get('amenity') as string
    return p
  }, [searchParams])

  const { data, isLoading, error } = useQuery({
    queryKey: ['hotels', queryParams],
    queryFn: () => fetchHotels(queryParams),
  })

  const sortOptions = [
    { key: 'rating', label: 'Rating' },
    { key: 'price', label: 'Price' },
    { key: 'distance', label: 'Distance' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex justify-between items-center p-4">
          <span className="text-lg font-semibold text-gray-800">
            {data?.length || 0} hotels found
          </span>
          <div className="flex items-center text-gray-600">
            <span className="text-sm mr-1">Sort by {sortBy}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center px-4 pb-4 border-b border-gray-100">
          <button className="flex items-center px-4 py-2 bg-red-50 border border-red-600 rounded-full">
            <Filter className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-600">Filters</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
            <Map className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">Map</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
            <span className="text-gray-600">Loading hotels...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8 text-red-600">Failed to load hotels.</div>
        )}

        <div className="space-y-4">
          {(data || []).map((hotel) => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-3 right-3 p-2 bg-black bg-opacity-30 rounded-full">
                  <Heart className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{hotel.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{hotel.address || hotel.location}</p>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-4">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-800">
                      {hotel.rating?.toFixed(1) || 'New'}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({hotel.reviewCount || 0})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(hotel.amenities || []).slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline">
                    <span className="text-xl font-bold text-red-600">
                      ₹{hotel.startingPrice || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">per night</span>
                  </div>
                  <button className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
