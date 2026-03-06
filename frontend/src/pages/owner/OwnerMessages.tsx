import React, { useState } from 'react'
import { Send, User, Phone, Search } from 'lucide-react'

const mockChats = [
  {
    id: '1',
    guestName: 'John Doe',
    bookingId: 'B001',
    lastMessage: 'Thank you for the early check-in!',
    time: '2 min ago',
    unread: 2,
    messages: [
      { id: '1', sender: 'guest', message: 'Hi, can I get early check-in?', time: '10:30 AM' },
      { id: '2', sender: 'owner', message: 'Yes, your room is ready. You can check in now.', time: '10:32 AM' },
      { id: '3', sender: 'guest', message: 'Thank you for the early check-in!', time: '10:35 AM' }
    ]
  },
  {
    id: '2',
    guestName: 'Jane Smith',
    bookingId: 'B002',
    lastMessage: 'Is room service available?',
    time: '1 hour ago',
    unread: 0,
    messages: [
      { id: '1', sender: 'guest', message: 'Is room service available?', time: '9:15 AM' },
      { id: '2', sender: 'owner', message: 'Yes, room service is available 24/7. You can call extension 100.', time: '9:20 AM' }
    ]
  }
]

export default function OwnerMessages() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredChats = mockChats.filter(chat =>
    chat.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: 'owner',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }))
      setNewMessage('')
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat.id === chat.id ? 'bg-red-50 border-red-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{chat.guestName}</h3>
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
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{selectedChat.guestName}</h3>
              <p className="text-sm text-gray-600">Booking #{selectedChat.bookingId}</p>
            </div>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Phone className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'owner' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'owner'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'owner' ? 'text-red-100' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}