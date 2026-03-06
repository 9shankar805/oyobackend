import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Payout {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  period: string
  bookingCount: number
  commission: number
  netAmount: number
  createdAt: string
  processedAt?: string
}

export const PayoutTracking: React.FC<{ hotelId: string }> = ({ hotelId }) => {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    loadPayouts()
  }, [hotelId])

  const loadPayouts = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockPayouts: Payout[] = [
        {
          id: 'payout_1',
          amount: 25000,
          status: 'completed',
          period: 'Jan 2024',
          bookingCount: 15,
          commission: 2500,
          netAmount: 22500,
          createdAt: '2024-02-01T00:00:00Z',
          processedAt: '2024-02-03T10:30:00Z'
        },
        {
          id: 'payout_2',
          amount: 18000,
          status: 'processing',
          period: 'Feb 2024',
          bookingCount: 12,
          commission: 1800,
          netAmount: 16200,
          createdAt: '2024-03-01T00:00:00Z'
        }
      ]
      setPayouts(mockPayouts)
      setTotalEarnings(mockPayouts.reduce((sum, p) => sum + p.netAmount, 0))
    } catch (error) {
      console.error('Error loading payouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Payout['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payouts...</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Payout Tracking</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {payouts.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold text-blue-600">
            ₹{payouts.find(p => p.period.includes('Feb'))?.netAmount.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Payout History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Period</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Bookings</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Gross Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Commission</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Net Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payout.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payout.bookingCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₹{payout.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-red-600">-₹{payout.commission.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{payout.netAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payout.status)}`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(payout.processedAt || payout.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payouts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No payouts available yet.
        </div>
      )}
    </div>
  )
}