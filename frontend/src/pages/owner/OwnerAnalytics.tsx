import React, { useState } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Star } from 'lucide-react'

export default function OwnerAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const periods = [
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'Last 30 Days' },
    { key: 'quarter', label: 'Last 3 Months' }
  ]

  const metrics = [
    { title: 'Total Revenue', value: '₹1,25,600', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
    { title: 'Bookings', value: '156', change: '+8.2%', icon: Calendar, color: 'text-blue-600' },
    { title: 'Occupancy Rate', value: '78%', change: '+5.1%', icon: Users, color: 'text-purple-600' },
    { title: 'Avg Rating', value: '4.2', change: '+0.3', icon: Star, color: 'text-yellow-600' }
  ]

  const topRooms = [
    { type: 'Deluxe Room', bookings: 45, revenue: 112500 },
    { type: 'Premium Room', bookings: 32, revenue: 102400 },
    { type: 'Standard Room', bookings: 28, revenue: 50400 },
    { type: 'Suite', bookings: 12, revenue: 54000 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === period.key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-6 w-6 ${metric.color}`} />
                <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Booking trends chart would go here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Rooms */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Rooms</h2>
        <div className="space-y-4">
          {topRooms.map((room, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{room.type}</h3>
                <p className="text-sm text-gray-600">{room.bookings} bookings</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{room.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}