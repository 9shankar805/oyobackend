import React, { useState } from 'react'
import { Phone, MessageSquare, MoreVertical, Calendar, User } from 'lucide-react'

const mockBookings = [
  { id: 'B001', guestName: 'John Doe', roomType: 'Deluxe Room', checkIn: '2024-01-15', checkOut: '2024-01-17', amount: 2546, status: 'confirmed', phone: '+91-9876543210' },
  { id: 'B002', guestName: 'Jane Smith', roomType: 'Premium Room', checkIn: '2024-01-16', checkOut: '2024-01-18', amount: 3200, status: 'pending', phone: '+91-9876543211' },
  { id: 'B003', guestName: 'Mike Johnson', roomType: 'Standard Room', checkIn: '2024-01-17', checkOut: '2024-01-19', amount: 1899, status: 'confirmed', phone: '+91-9876543212' }
]

const mockChats = [
  { id: 'C001', guestName: 'John Doe', bookingId: 'B001', lastMessage: 'Thank you for the early check-in!', time: '2 min ago', unread: 2 },
  { id: 'C002', guestName: 'Jane Smith', bookingId: 'B002', lastMessage: 'Is room service available?', time: '1 hour ago', unread: 0 },
  { id: 'C003', guestName: 'Mike Johnson', bookingId: 'B003', lastMessage: 'Great stay, thanks!', time: '3 hours ago', unread: 1 }
]

export default function OwnerBookings() {
  const [activeTab, setActiveTab] = useState('today')
  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'chats', label: 'Chats' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const BookingCard = ({ booking }: { booking: any }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900">#{booking.id}</span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.guestName}</h3>
      <p className="text-sm text-gray-600 mb-3">{booking.roomType}</p>
      
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Calendar className="h-4 w-4 mr-2" />
        <span>{booking.checkIn} - {booking.checkOut}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-red-600">₹{booking.amount.toLocaleString()}</span>
        <div className="flex space-x-2">
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
            <Phone className="h-4 w-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const ChatCard = ({ chat }: { chat: any }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border flex items-center space-x-4">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <User className="h-6 w-6 text-red-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900">{chat.guestName}</h3>
          <span className="text-xs text-gray-500">{chat.time}</span>
        </div>
        <p className="text-xs text-red-600 mb-1">Booking #{chat.bookingId}</p>
        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
      </div>
      {chat.unread > 0 && (
        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">{chat.unread}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'chats' ? (
            <div className="space-y-4">
              {mockChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}