import React, { useState } from 'react'
import { Route, Routes, Link, useLocation } from 'react-router-dom'
import { BarChart3, Hotel, Calendar, DollarSign, MessageSquare, Settings, User, Image, FileText, TrendingUp } from 'lucide-react'
import OwnerOverview from './OwnerOverview'
import OwnerHotels from './OwnerHotels'
import OwnerBookings from './OwnerBookings'
import OwnerRooms from './OwnerRooms'
import OwnerEarnings from './OwnerEarnings'
import OwnerProfile from './OwnerProfile'
import OwnerGallery from './OwnerGallery'
import OwnerAnalytics from './OwnerAnalytics'
import OwnerMessages from './OwnerMessages'

const navigation = [
  { name: 'Dashboard', href: '/owner', icon: BarChart3 },
  { name: 'Hotels', href: '/owner/hotels', icon: Hotel },
  { name: 'Bookings', href: '/owner/bookings', icon: Calendar },
  { name: 'Rooms', href: '/owner/rooms', icon: Hotel },
  { name: 'Earnings', href: '/owner/earnings', icon: DollarSign },
  { name: 'Messages', href: '/owner/messages', icon: MessageSquare },
  { name: 'Gallery', href: '/owner/gallery', icon: Image },
  { name: 'Analytics', href: '/owner/analytics', icon: TrendingUp },
  { name: 'Profile', href: '/owner/profile', icon: User },
]

export default function OwnerDashboard() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-red-600">
          <h1 className="text-xl font-bold text-white">OYO Owner</h1>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive
                    ? 'bg-red-100 text-red-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-600"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
            </div>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Owner Dashboard</h1>
          <div className="w-6"></div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<OwnerOverview />} />
            <Route path="/hotels" element={<OwnerHotels />} />
            <Route path="/bookings" element={<OwnerBookings />} />
            <Route path="/rooms" element={<OwnerRooms />} />
            <Route path="/earnings" element={<OwnerEarnings />} />
            <Route path="/messages" element={<OwnerMessages />} />
            <Route path="/gallery" element={<OwnerGallery />} />
            <Route path="/analytics" element={<OwnerAnalytics />} />
            <Route path="/profile" element={<OwnerProfile />} />
          </Routes>
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
