import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'

type Hotel = {
  id: string
  name: string
  location: string
  address: string
  amenities: string[]
  description: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function OwnerHotels() {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [address, setAddress] = useState('')
  const [amenities, setAmenities] = useState('wifi,ac')
  const [description, setDescription] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ownerHotels'],
    queryFn: async () => {
      const res = await api.get<Hotel[]>('/api/hotels/mine')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        location,
        address,
        amenities: amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        description,
      }
      const res = await api.post('/api/hotels', payload)
      return res.data
    },
    onSuccess: async () => {
      setName('')
      setLocation('')
      setAddress('')
      setAmenities('wifi,ac')
      setDescription('')
      await qc.invalidateQueries({ queryKey: ['ownerHotels'] })
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold">My hotels</div>
        <div className="mt-1 text-sm text-gray-600">Create a hotel (will be pending unless created by admin).</div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Hotel name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="rounded border px-3 py-2" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input
            className="rounded border px-3 py-2"
            placeholder="Amenities (comma separated)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />
          <textarea
            className="md:col-span-2 rounded border px-3 py-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="md:col-span-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            disabled={!name.trim() || !location.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create hotel
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-gray-600">Loading…</div>}
      {isError && <div className="text-sm text-red-600">Failed to load owner hotels.</div>}

      <div className="grid gap-3">
        {(data || []).map((h) => (
          <div key={h.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{h.name}</div>
                <div className="mt-1 text-xs text-gray-500">{h.location}</div>
                <div className="mt-1 text-xs text-gray-500">{h.address}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Status</div>
                <div className="text-sm font-semibold">{h.status}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-600">Amenities: {(h.amenities || []).join(', ') || '—'}</div>
          </div>
        ))}

        {(data || []).length === 0 && !isLoading && (
          <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">No hotels yet.</div>
        )}
      </div>
    </div>
  )
}
