import React from 'react'
import { Route, Routes, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Building, Settings, BarChart3, Shield } from 'lucide-react'
import AdminOverview from './AdminOverview'
import AdminUsers from './AdminUsers'
import AdminHotelApprovals from './AdminHotelApprovals'

export default function AdminDashboard() {
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/hotels', label: 'Hotels', icon: Building },
  ]

  return (
    <div className="flex gap-6">
      <aside className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-20">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <Shield className="w-6 h-6 text-red-600" />
          <h2 className="font-bold text-lg">Admin Panel</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/hotels" element={<AdminHotelApprovals />} />
        </Routes>
      </main>
    </div>
  )
}
