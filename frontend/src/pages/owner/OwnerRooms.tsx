import React, { useState } from 'react'
import { Plus, Edit, Trash2, Wifi, Car, Tv, Coffee, Bath, Dumbbell } from 'lucide-react'

const mockRooms = [
  { id: '1', number: '101', type: 'Deluxe', price: 2500, capacity: 2, status: 'available', amenities: ['AC', 'WiFi', 'TV'] },
  { id: '2', number: '102', type: 'Premium', price: 3200, capacity: 3, status: 'occupied', amenities: ['AC', 'WiFi', 'TV', 'Mini Bar'] },
  { id: '3', number: '103', type: 'Standard', price: 1800, capacity: 2, status: 'maintenance', amenities: ['AC', 'WiFi'] },
  { id: '4', number: '201', type: 'Suite', price: 4500, capacity: 4, status: 'available', amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony'] }
]

const roomTypes = ['Standard', 'Deluxe', 'Premium', 'Suite']
const availableAmenities = ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony', 'Bathtub', 'Gym Access', 'Parking']
const statusOptions = ['available', 'occupied', 'maintenance']

export default function OwnerRooms() {
  const [rooms, setRooms] = useState(mockRooms)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any>(null)
  const [formData, setFormData] = useState({
    number: '',
    type: '',
    price: '',
    capacity: '',
    status: 'available',
    amenities: [] as string[]
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'occupied': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddRoom = () => {
    setEditingRoom(null)
    setFormData({ number: '', type: '', price: '', capacity: '', status: 'available', amenities: [] })
    setShowModal(true)
  }

  const handleEditRoom = (room: any) => {
    setEditingRoom(room)
    setFormData({
      number: room.number,
      type: room.type,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      status: room.status,
      amenities: [...room.amenities]
    })
    setShowModal(true)
  }

  const handleSaveRoom = () => {
    const roomData = {
      id: editingRoom?.id || Date.now().toString(),
      number: formData.number,
      type: formData.type,
      price: parseInt(formData.price),
      capacity: parseInt(formData.capacity),
      status: formData.status,
      amenities: formData.amenities
    }

    if (editingRoom) {
      setRooms(rooms.map(room => room.id === editingRoom.id ? roomData : room))
    } else {
      setRooms([...rooms, roomData])
    }
    setShowModal(false)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const RoomCard = ({ room }: { room: any }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Room {room.number}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(room.status)}`}>
          {room.status.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">{room.type}</p>
        <p className="text-lg font-bold text-red-600">₹{room.price.toLocaleString()}/night</p>
        <p className="text-sm text-gray-600">Capacity: {room.capacity} guests</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {room.amenities.map((amenity: string) => (
          <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {amenity}
          </span>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => handleEditRoom(room)}
          className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
        <button
          onClick={handleAddRoom}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {roomTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData({...formData, type})}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        formData.type === type
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹/night)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex space-x-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => setFormData({...formData, status})}
                      className={`px-3 py-2 text-sm rounded-md border capitalize ${
                        formData.status === status
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableAmenities.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        formData.amenities.includes(amenity)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Save Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}