import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'

type Booking = {
  id: string
  hotelId: string
  roomId: string
  checkIn: string
  checkOut: string
  status: string
  createdAt: string
}

export default function CustomerBookings() {
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await api.get<Booking[]>('/api/bookings/me')
      return res.data
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post(`/api/bookings/${bookingId}/cancel`)
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['myBookings'] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">Booking history</div>
        <div className="mt-1 text-sm text-gray-600">View and cancel your bookings.</div>
      </div>

      {isLoading && <div className="text-sm text-gray-600">Loading…</div>}
      {isError && <div className="text-sm text-red-600">Failed to load bookings.</div>}

      <div className="space-y-3">
        {(data || []).map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Booking #{b.id.slice(0, 8)}</div>
                <div className="mt-1 text-xs text-gray-500">Created {new Date(b.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Status</div>
                <div className="text-sm font-semibold">{b.status}</div>
              </div>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-gray-700 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-500">Check-in</div>
                <div>{b.checkIn}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Check-out</div>
                <div>{b.checkOut}</div>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                disabled={b.status !== 'confirmed' || cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(b.id)}
              >
                Cancel booking
              </button>
            </div>
          </div>
        ))}

        {(data || []).length === 0 && !isLoading && (
          <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">No bookings yet.</div>
        )}
      </div>
    </div>
  )
}
