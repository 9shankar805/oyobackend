import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building, TrendingUp, DollarSign, CheckCircle, XCircle, Search, Filter, RefreshCw, Eye, Calendar, BarChart3 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'

// Animated stat card component
const StatCard = ({ stat, index }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const Icon = stat.icon
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:scale-105 hover:shadow-xl ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
          <div className="flex items-center mt-2">
            <TrendingUp className={`w-4 h-4 mr-1 ${
              stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`} />
            <p className={`text-sm font-semibold ${
              stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} from last month
            </p>
          </div>
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Fetch real stats from API
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats')
      return res.data
    },
  })

  const statData = stats ? [
    { 
      label: 'Total Users', 
      value: stats.totalUsers?.toLocaleString() || '0', 
      icon: Users, 
      color: 'blue', 
      change: '+12%' 
    },
    { 
      label: 'Total Hotels', 
      value: stats.totalHotels?.toLocaleString() || '0', 
      icon: Building, 
      color: 'green', 
      change: '+8%' 
    },
    { 
      label: 'Pending Approvals', 
      value: stats.pendingHotels?.toLocaleString() || '0', 
      icon: CheckCircle, 
      color: 'yellow', 
      change: '-5%' 
    },
    { 
      label: 'Total Revenue', 
      value: `₹${((stats.totalRevenue || 0) / 1000000).toFixed(1)}M`, 
      icon: DollarSign, 
      color: 'purple', 
      change: '+15%' 
    },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header with search and controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your OYO platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users, hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="day">Last 24 hours</option>
              <option value="week">Last week</option>
              <option value="month">Last month</option>
              <option value="year">Last year</option>
            </select>
            <button
              onClick={() => refetch()}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-red-900 font-semibold">Error loading dashboard data</p>
              <p className="text-red-700 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statData.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      )}

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-600" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/hotels"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <Building className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Hotel Approvals</p>
                  <p className="text-sm text-gray-600">Review pending hotel registrations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stats?.pendingHotels > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {stats.pendingHotels} pending
                  </span>
                )}
                <Eye className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              </div>
            </Link>
            
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">User Management</p>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New hotel registered</p>
                <p className="text-xs text-gray-600">Mountain View Hotel - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New user signup</p>
                <p className="text-xs text-gray-600">John Doe - 3 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Hotel approved</p>
                <p className="text-xs text-gray-600">City Center Hotel - 5 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
