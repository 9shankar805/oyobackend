import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  subject: string
  message: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'booking' | 'payment' | 'technical' | 'general'
  createdAt: string
  updatedAt: string
  assignedTo?: string
  responses?: Array<{
    id: string
    message: string
    isAdmin: boolean
    createdAt: string
  }>
}

export const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockTickets: SupportTicket[] = [
        {
          id: 'ticket_1',
          userId: 'user_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          subject: 'Booking Cancellation Issue',
          message: 'I am unable to cancel my booking. Please help.',
          status: 'open',
          priority: 'high',
          category: 'booking',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          responses: []
        },
        {
          id: 'ticket_2',
          userId: 'user_2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          subject: 'Payment Not Processed',
          message: 'My payment was deducted but booking is not confirmed.',
          status: 'in-progress',
          priority: 'urgent',
          category: 'payment',
          createdAt: '2024-01-14T15:20:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
          assignedTo: 'Admin',
          responses: [
            {
              id: 'resp_1',
              message: 'We are looking into this issue. Please provide your transaction ID.',
              isAdmin: true,
              createdAt: '2024-01-15T09:15:00Z'
            }
          ]
        }
      ]
      setTickets(mockTickets)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      )
    )
  }

  const addResponse = async (ticketId: string) => {
    if (!responseMessage.trim()) return

    const newResponse = {
      id: `resp_${Date.now()}`,
      message: responseMessage,
      isAdmin: true,
      createdAt: new Date().toISOString()
    }

    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              responses: [...(ticket.responses || []), newResponse],
              status: 'in-progress',
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    )

    setResponseMessage('')
    if (selectedTicket) {
      setSelectedTicket(prev => prev ? {
        ...prev,
        responses: [...(prev.responses || []), newResponse],
        status: 'in-progress'
      } : null)
    }
  }

  const filteredTickets = tickets.filter(ticket => 
    filter === 'all' || ticket.status === filter
  )

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading tickets...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="flex gap-2">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ticket</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                          <p className="text-xs text-gray-500">{ticket.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{ticket.userName}</p>
                          <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {format(new Date(ticket.createdAt), 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{selectedTicket.subject}</h3>
                <div className="flex gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1).replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{selectedTicket.message}</p>
              </div>

              {/* Status Update */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Update Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Responses */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Conversation</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {(selectedTicket.responses || []).map((response) => (
                    <div
                      key={response.id}
                      className={`p-2 rounded text-sm ${
                        response.isAdmin 
                          ? 'bg-blue-100 text-blue-900 ml-4' 
                          : 'bg-gray-100 text-gray-900 mr-4'
                      }`}
                    >
                      <p>{response.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {format(new Date(response.createdAt), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Response */}
              <div>
                <label className="block text-sm font-medium mb-2">Add Response</label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Type your response..."
                />
                <button
                  onClick={() => addResponse(selectedTicket.id)}
                  className="mt-2 w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Send Response
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tickets found matching your criteria.
        </div>
      )}
    </div>
  )
}