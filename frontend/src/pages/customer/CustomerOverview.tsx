import React from 'react'
import { Link } from 'react-router-dom'

export default function CustomerOverview() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Customer Dashboard</div>
        <div className="mt-1 text-sm text-gray-600">Manage your bookings and reviews.</div>

        <div className="mt-4 flex gap-2">
          <Link className="rounded border px-3 py-2 text-sm" to="/customer/bookings">
            Booking history
          </Link>
          <Link className="rounded bg-black px-3 py-2 text-sm text-white" to="/hotels">
            Book a hotel
          </Link>
        </div>
      </div>
    </div>
  )
}
