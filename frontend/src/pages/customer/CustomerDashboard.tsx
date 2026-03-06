import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CustomerOverview from './CustomerOverview'
import CustomerBookings from './CustomerBookings'

export default function CustomerDashboard() {
  return (
    <Routes>
      <Route path="/" element={<CustomerOverview />} />
      <Route path="/bookings" element={<CustomerBookings />} />
    </Routes>
  )
}
