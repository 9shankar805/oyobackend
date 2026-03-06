import React, { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { Building, MapPin, CheckCircle, XCircle, Clock, Eye, Star, Search, Filter, Calendar, User, Phone, Mail, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

type Hotel = {
  id: string
  name: string
  location: string
  address: string
  status: 'pending' | 'approved' | 'rejected'
  owner?: {
    name: string
    email: string
    phone: string
  }
  createdAt: string
  description?: string
  amenities?: string[]
  images?: string[]
}

// Animated hotel card component
const HotelCard = ({ hotel, onApprove, onReject, isApproving, isRejecting, index }: {
  hotel: Hotel
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
  index: number
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50)
    return () => clearTimeout(timer)
  }, [index])

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  }

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle
  }

  const StatusIcon = statusIcons[hotel.status]

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-lg ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[hotel.status]}`}>
                <StatusIcon className="w-3 h-3 inline mr-1" />
                {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{hotel.location}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{hotel.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Owner Info */}
        {hotel.owner && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Owner Information</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{hotel.owner.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 truncate">{hotel.owner.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{hotel.owner.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {hotel.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600">{hotel.description}</p>
              </div>
            )}
            
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Submitted</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(hotel.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {hotel.status === 'pending' && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <button
              onClick={() => onApprove(hotel.id)}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isApproving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => onReject(hotel.id)}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isRejecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminHotelApprovals() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminHotels'],
    queryFn: async () => {
      const res = await api.get('/api/admin/hotels')
      return res.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (hotelId: string) => {
      const res = await api.post(`/api/admin/hotels/${hotelId}/approve`)
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adminHotels'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (hotelId: string) => {
      const res = await api.post(`/api/admin/hotels/${hotelId}/reject`)
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adminHotels'] })
    },
  })

  // Filter and search logic
  const filteredAndSortedHotels = useMemo(() => {
    let filtered = (data || []).filter(hotel => {
      const matchesFilter = filter === 'all' || hotel.status === filter
      const matchesSearch = searchTerm === '' || 
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesFilter && matchesSearch
    })

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })
  }, [data, filter, searchTerm, sortBy])

  const handleApprove = (hotelId: string) => {
    approveMutation.mutate(hotelId)
  }

  const handleReject = (hotelId: string) => {
    rejectMutation.mutate(hotelId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hotel Approvals</h1>
            <p className="text-gray-600 mt-1">Review and approve hotel submissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">{filteredHotels.length}</span>
            <span className="text-gray-600">pending</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hotels, owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Hotels</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedHotels.length} of {data?.length || 0} hotels
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-red-900 font-semibold">Error loading hotels</p>
              <p className="text-red-700 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !isError && filteredAndSortedHotels.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'No hotel registrations have been submitted yet'}
          </p>
        </div>
      )}

      {/* Hotels List */}
      {!isLoading && !isError && filteredAndSortedHotels.length > 0 && (
        <div className="space-y-4">
          {filteredAndSortedHotels.map((hotel, index) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onApprove={handleApprove}
              onReject={handleReject}
              isApproving={approveMutation.isPending}
              isRejecting={rejectMutation.isPending}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
