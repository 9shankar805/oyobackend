import React, { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  averageOccupancy: number;
  growthRate: number;
}

export const RevenueAnalytics: React.FC<{ hotelId: string }> = ({ hotelId }) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadRevenueData();
  }, [hotelId, dateRange]);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const mockData: RevenueData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        mockData.push({
          date: format(date, 'yyyy-MM-dd'),
          revenue: Math.floor(Math.random() * 5000) + 1000,
          bookings: Math.floor(Math.random() * 10) + 1,
          occupancy: Math.floor(Math.random() * 40) + 60
        });
      }
      
      setRevenueData(mockData);
      
      // Calculate stats
      const totalRevenue = mockData.reduce((sum, day) => sum + day.revenue, 0);
      const totalBookings = mockData.reduce((sum, day) => sum + day.bookings, 0);
      const averageOccupancy = mockData.reduce((sum, day) => sum + day.occupancy, 0) / mockData.length;
      
      setStats({
        totalRevenue,
        totalBookings,
        averageOccupancy: Math.round(averageOccupancy),
        growthRate: Math.floor(Math.random() * 20) + 5
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Revenue Analytics</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded ${
                dateRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-600">+{stats.growthRate}% from last period</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Occupancy</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.averageOccupancy}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg. Revenue/Day</h3>
            <p className="text-2xl font-bold text-purple-600">
              ₹{Math.round(stats.totalRevenue / revenueData.length).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {revenueData.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 w-full rounded-t transition-all hover:bg-blue-600"
                style={{
                  height: `${(day.revenue / maxRevenue) * 200}px`,
                  minHeight: '4px'
                }}
                title={`₹${day.revenue.toLocaleString()} on ${format(new Date(day.date), 'MMM d')}`}
              />
              <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                {format(new Date(day.date), 'MMM d')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Occupancy Rate</h3>
        <div className="h-32 flex items-end justify-between gap-1">
          {revenueData.map((day) => (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <div
                className="bg-green-500 w-full rounded-t transition-all hover:bg-green-600"
                style={{
                  height: `${(day.occupancy / 100) * 100}px`,
                  minHeight: '4px'
                }}
                title={`${day.occupancy}% occupancy on ${format(new Date(day.date), 'MMM d')}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Bookings</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Occupancy</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Avg/Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenueData.slice(-10).reverse().map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {format(new Date(day.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ₹{day.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{day.bookings}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      day.occupancy >= 80 ? 'bg-green-100 text-green-800' :
                      day.occupancy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {day.occupancy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    ₹{Math.round(day.revenue / day.bookings).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};