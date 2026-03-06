import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import Shell from './components/layout/Shell'
import HomePage from './pages/HomePage'
import HotelsPage from './pages/HotelsPage'
import HotelDetailsPage from './pages/HotelDetailsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import OwnerRegistration from './pages/owner/OwnerRegistration'
import OwnerProfile from './pages/owner/OwnerProfile'
import HotelOnboarding from './components/HotelOnboarding'

function RequireRole({ role, children }: { role: 'customer' | 'owner' | 'admin'; children: React.ReactNode }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (auth.user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/owner-registration" element={<OwnerRegistration />} />
          <Route path="/owner/profile-completion" element={<OwnerProfile />} />
          <Route path="/hotel-onboarding" element={<HotelOnboarding />} />

          <Route
            path="/customer/*"
            element={
              <RequireRole role="customer">
                <CustomerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/owner/*"
            element={
              <RequireRole role="owner">
                <OwnerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/*"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </AuthProvider>
  )
}
