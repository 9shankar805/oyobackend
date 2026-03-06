import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Hotel, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Wrench,
  Package,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Bed,
  Home,
  FileText,
  Settings,
  RefreshCw,
  Plus
} from 'lucide-react';

interface DashboardData {
  overview: {
    totalHotels: number;
    totalRooms: number;
    totalRevenue: number;
    occupancyRate: number;
    averageRating: number;
  };
  todaySummary: {
    checkIns: number;
    checkOuts: number;
    arrivals: any[];
    departures: any[];
  };
  roomStatus: any[];
  recentBookings: any[];
}

const PropertyManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [housekeepingData, setHousekeepingData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [staffData, setStaffData] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/property-management/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHousekeepingData = async () => {
    try {
      const response = await fetch('/api/property-management/housekeeping', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHousekeepingData(data.data);
      }
    } catch (error) {
      console.error('Error fetching housekeeping data:', error);
    }
  };

  const fetchMaintenanceData = async () => {
    try {
      const response = await fetch('/api/property-management/maintenance', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMaintenanceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/property-management/inventory', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInventoryData(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/property-management/staff', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStaffData(data.data);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  const fetchReports = async (reportType: string) => {
    try {
      const response = await fetch(`/api/property-management/reports?reportType=${reportType}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'housekeeping') fetchHousekeepingData();
    if (activeTab === 'maintenance') fetchMaintenanceData();
    if (activeTab === 'inventory') fetchInventoryData();
    if (activeTab === 'staff') fetchStaffData();
    if (activeTab === 'reports') fetchReports('REVENUE');
  }, [activeTab]);

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-800';
      case 'NEEDS_CLEANING': return 'bg-yellow-100 text-yellow-800';
      case 'NEEDS_PREPARATION': return 'bg-orange-100 text-orange-800';
      case 'MAINTENANCE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">OYO OS</h1>
          <p className="text-gray-600">Property Management System</p>
        </div>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'housekeeping', label: 'Housekeeping', icon: Bed },
          { id: 'maintenance', label: 'Maintenance', icon: Wrench },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'staff', label: 'Staff', icon: UserCheck },
          { id: 'reports', label: 'Reports', icon: FileText }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center space-x-2"
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Hotel className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.totalHotels}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bed className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.totalRooms}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{dashboardData.overview.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.occupancyRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">{dashboardData.overview.averageRating}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Check-ins ({dashboardData.todaySummary.checkIns})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.todaySummary.arrivals.map((arrival: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{arrival.user.name}</p>
                        <p className="text-sm text-gray-600">{arrival.room.name}</p>
                      </div>
                      <Badge variant="outline">Arriving Today</Badge>
                    </div>
                  ))}
                  {dashboardData.todaySummary.arrivals.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No check-ins today</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Today's Check-outs ({dashboardData.todaySummary.checkOuts})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.todaySummary.departures.map((departure: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{departure.user.name}</p>
                        <p className="text-sm text-gray-600">{departure.room.name}</p>
                      </div>
                      <Badge variant="outline">Departing Today</Badge>
                    </div>
                  ))}
                  {dashboardData.todaySummary.departures.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No check-outs today</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Room Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Room Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.roomStatus.reduce((sum: number, r: any) => sum + r.available, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData.roomStatus.reduce((sum: number, r: any) => sum + r.occupied, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Occupied</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardData.roomStatus.reduce((sum: number, r: any) => sum + r.reserved, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Reserved</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wrench className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardData.roomStatus.reduce((sum: number, r: any) => sum + r.maintenance, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Housekeeping Tab */}
      {activeTab === 'housekeeping' && housekeepingData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{housekeepingData.summary.needsCleaning}</p>
                <p className="text-sm text-gray-600">Needs Cleaning</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{housekeepingData.summary.occupied}</p>
                <p className="text-sm text-gray-600">Occupied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{housekeepingData.summary.available}</p>
                <p className="text-sm text-gray-600">Available</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">{housekeepingData.summary.maintenance}</p>
                <p className="text-sm text-gray-600">Maintenance</p>
              </CardContent>
            </Card>
          </div>

          {/* Priority-based Room List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(housekeepingData.groupedByPriority).map(([priority, rooms]: [string, any]) => (
              <Card key={priority}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)} mr-2`}></div>
                    {priority} Priority ({rooms.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rooms.map((room: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{room.roomName}</p>
                            <p className="text-sm text-gray-600">{room.roomType}</p>
                            {room.notes && <p className="text-xs text-gray-500 mt-1">{room.notes}</p>}
                          </div>
                          <Badge className={getRoomStatusColor(room.status)}>
                            {room.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {room.currentGuest && (
                          <p className="text-sm text-blue-600 mt-2">Guest: {room.currentGuest}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other tabs would follow similar pattern... */}
      {activeTab === 'maintenance' && (
        <div className="text-center py-8">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Maintenance module coming soon...</p>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Inventory module coming soon...</p>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="text-center py-8">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Staff management module coming soon...</p>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Reports and analytics module coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default PropertyManagementDashboard;