import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  hotelName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  pendingAmount: number;
}

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockPayments: Payment[] = [
        {
          id: 'pay_1',
          bookingId: 'book_1',
          userId: 'user_1',
          userName: 'John Doe',
          hotelName: 'Grand Hotel',
          amount: 2500,
          status: 'completed',
          paymentMethod: 'Credit Card',
          transactionId: 'txn_123456',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:31:00Z'
        },
        {
          id: 'pay_2',
          bookingId: 'book_2',
          userId: 'user_2',
          userName: 'Jane Smith',
          hotelName: 'City Inn',
          amount: 1800,
          status: 'pending',
          paymentMethod: 'UPI',
          transactionId: 'txn_123457',
          createdAt: '2024-01-15T11:00:00Z',
          updatedAt: '2024-01-15T11:00:00Z'
        },
        {
          id: 'pay_3',
          bookingId: 'book_3',
          userId: 'user_3',
          userName: 'Mike Johnson',
          hotelName: 'Beach Resort',
          amount: 3200,
          status: 'failed',
          paymentMethod: 'Debit Card',
          transactionId: 'txn_123458',
          createdAt: '2024-01-15T12:00:00Z',
          updatedAt: '2024-01-15T12:01:00Z'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: PaymentStats = {
        totalRevenue: 125000,
        totalTransactions: 156,
        successRate: 94.2,
        pendingAmount: 8500
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: Payment['status']) => {
    try {
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: newStatus, updatedAt: new Date().toISOString() }
            : payment
        )
      );
      // API call would go here
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const processRefund = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to process this refund?')) {
      await updatePaymentStatus(paymentId, 'refunded');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Amount</h3>
            <p className="text-2xl font-bold text-yellow-600">₹{stats.pendingAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, hotel, or transaction ID..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Transaction ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Hotel</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Method</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{payment.transactionId}</td>
                  <td className="px-4 py-3 text-sm">{payment.userName}</td>
                  <td className="px-4 py-3 text-sm">{payment.hotelName}</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{payment.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => updatePaymentStatus(payment.id, 'completed')}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => processRefund(payment.id)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Refund
                        </button>
                      )}
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => updatePaymentStatus(payment.id, 'failed')}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No payments found matching your criteria.
        </div>
      )}
    </div>
  );
};