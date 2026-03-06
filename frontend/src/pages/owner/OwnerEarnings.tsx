import React, { useState } from 'react'
import { TrendingUp, DollarSign, Calendar, Download, CreditCard } from 'lucide-react'

const mockEarnings = {
  totalEarnings: 125600,
  thisMonth: 45600,
  lastMonth: 38900,
  pendingAmount: 12400,
  availableForWithdrawal: 113200,
  transactions: [
    { id: 'T001', date: '2024-01-15', amount: 2546, type: 'booking', description: 'Booking #B001 - John Doe', status: 'completed' },
    { id: 'T002', date: '2024-01-14', amount: 3200, type: 'booking', description: 'Booking #B002 - Jane Smith', status: 'completed' },
    { id: 'T003', date: '2024-01-13', amount: -5000, type: 'withdrawal', description: 'Withdrawal to Bank Account', status: 'completed' },
    { id: 'T004', date: '2024-01-12', amount: 1899, type: 'booking', description: 'Booking #B003 - Mike Johnson', status: 'pending' }
  ]
}

export default function OwnerEarnings() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
  ]

  const StatCard = ({ title, amount, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">₹{amount.toLocaleString()}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  )

  const TransactionRow = ({ transaction }: { transaction: any }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          transaction.type === 'booking' ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {transaction.type === 'booking' ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <Download className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-500">{transaction.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${
          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
        </p>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {transaction.status}
        </span>
      </div>
    </div>
  )

  const handleWithdraw = () => {
    // Handle withdrawal logic
    console.log('Withdrawing:', withdrawAmount)
    setShowWithdrawModal(false)
    setWithdrawAmount('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Withdraw
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg p-1 shadow-sm flex">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === period.key
                ? 'bg-red-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          amount={mockEarnings.totalEarnings}
          icon={DollarSign}
          color="#10B981"
        />
        <StatCard
          title="This Month"
          amount={mockEarnings.thisMonth}
          icon={TrendingUp}
          color="#3B82F6"
          subtitle={`+${((mockEarnings.thisMonth - mockEarnings.lastMonth) / mockEarnings.lastMonth * 100).toFixed(1)}% from last month`}
        />
        <StatCard
          title="Pending Amount"
          amount={mockEarnings.pendingAmount}
          icon={Calendar}
          color="#F59E0B"
          subtitle="Processing payments"
        />
        <StatCard
          title="Available"
          amount={mockEarnings.availableForWithdrawal}
          icon={CreditCard}
          color="#8B5CF6"
          subtitle="Ready for withdrawal"
        />
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="px-6">
          {mockEarnings.transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Withdraw Earnings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Balance: ₹{mockEarnings.availableForWithdrawal.toLocaleString()}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount"
                  max={mockEarnings.availableForWithdrawal}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  • Withdrawals are processed within 2-3 business days
                </p>
                <p className="text-sm text-gray-600">
                  • Minimum withdrawal amount: ₹500
                </p>
                <p className="text-sm text-gray-600">
                  • No processing fees for withdrawals
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseInt(withdrawAmount) < 500}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw ₹{withdrawAmount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}