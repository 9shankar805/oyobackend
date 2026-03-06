import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Calendar, DollarSign, Hotel, Users, ArrowUpRight, MessageSquare, Image, Plus } from 'lucide-react'

const mockData = {
  stats: {
    revenue: 45600,
    bookings: 23,
    occupancy: 78,
    avgRate: 1983,
    checkIns: 8,
    checkOuts: 5
  },
  recentBookings: [
    { id: 'B001', guestName: 'John Doe', hotelName: 'Hotel Paradise', checkIn: '2024-01-15', amount: 2546, status: 'confirmed' },
    { id: 'B002', guestName: 'Jane Smith', hotelName: 'City Inn', checkIn: '2024-01-16', amount: 3200, status: 'pending' },
    { id: 'B003', guestName: 'Mike Johnson', hotelName: 'Hotel Paradise', checkIn: '2024-01-17', amount: 1899, status: 'confirmed' }
  ],
  hotels: [
    { id: 1, name: 'Hotel Paradise', rooms: 25, status: 'approved' },
    { id: 2, name: 'City Inn', rooms: 18, status: 'pending' }
  ]
}

export default function OwnerOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const periods = ['today', 'week', 'month']

  const quickActions = [
    { title: 'Manage Bookings', icon: Calendar, color: 'bg-blue-500', href: '/owner/bookings' },
    { title: 'Room Status', icon: Hotel, color: 'bg-green-500', href: '/owner/rooms' },
    { title: 'Add Hotel', icon: Plus, color: 'bg-orange-500', href: '/owner/hotels' },
    { title: 'Manage Photos', icon: Image, color: 'bg-cyan-500', href: '/owner/gallery' }
  ]

  const StatCard = ({ title, value, icon: Icon, color, suffix = '' }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {title === 'Revenue' || title === 'Avg Rate' ? `₹${value.toLocaleString()}` : value}{suffix}
          </p>
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-1">Hotel Owner</p>
        <p className="text-red-600 text-sm mt-1">{mockData.hotels.length} Hotels Registered</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg p-1 shadow-sm flex">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium capitalize transition-colors ${
              selectedPeriod === period
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Revenue" value={mockData.stats.revenue} icon={TrendingUp} color="#10B981" />
        <StatCard title="Bookings" value={mockData.stats.bookings} icon={Calendar} color="#3B82F6" />
        <StatCard title="Occupancy" value={mockData.stats.occupancy} icon={Hotel} color="#F59E0B" suffix="%" />
        <StatCard title="Avg Rate" value={mockData.stats.avgRate} icon={DollarSign} color="#8B5CF6" />
        <StatCard title="Check-ins" value={mockData.stats.checkIns} icon={ArrowUpRight} color="#06B6D4" />
        <StatCard title="Check-outs" value={mockData.stats.checkOuts} icon={Users} color="#EF4444" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.href}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">{action.title}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link to="/owner/bookings" className="text-red-600 hover:text-red-700 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {mockData.recentBookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">#{booking.id}</p>
                <p className="text-sm text-gray-600">{booking.guestName}</p>
                <p className="text-sm text-gray-500">{booking.hotelName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">₹{booking.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{booking.checkIn}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
