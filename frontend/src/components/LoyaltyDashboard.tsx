import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Trophy, 
  Gift, 
  Coins, 
  Crown,
  Sparkles,
  ChevronRight,
  Ticket,
  Percent,
  Hotel,
  RefreshCw
} from 'lucide-react';

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  pointsMultiplier: number;
  discountPercentage: number;
}

interface LoyaltyStats {
  currentTier: string;
  currentPoints: number;
  totalBookings: number;
  totalSpent: number;
  memberSince: string;
  benefits: string[];
  pointsMultiplier: number;
  discountPercentage: number;
  nextTier?: {
    name: string;
    pointsNeeded: number;
    benefits: string[];
  };
  availableRewards: Array<{
    type: string;
    name: string;
    pointsRequired: number;
    description: string;
  }>;
}

const LoyaltyDashboard: React.FC = () => {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const [statsResponse, tiersResponse] = await Promise.all([
        fetch('/api/loyalty/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/loyalty/tiers')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (tiersResponse.ok) {
        const tiersData = await tiersResponse.json();
        setTiers(tiersData.data);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (reward: any) => {
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          points: reward.pointsRequired,
          rewardType: reward.type,
          description: `Redeemed ${reward.name}`
        })
      });

      if (response.ok) {
        setSelectedReward(null);
        fetchLoyaltyData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to redeem reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return <Star className="w-6 h-6 text-amber-600" />;
      case 'silver': return <Trophy className="w-6 h-6 text-gray-400" />;
      case 'gold': return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'platinum': return <Crown className="w-6 h-6 text-purple-500" />;
      case 'diamond': return <Sparkles className="w-6 h-6 text-blue-500" />;
      default: return <Star className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT': return <Percent className="w-5 h-5" />;
      case 'FREE_NIGHT': return <Hotel className="w-5 h-5" />;
      case 'UPGRADE': return <RefreshCw className="w-5 h-5" />;
      case 'CASHBACK': return <Coins className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to OYO Wizard</h2>
          <p className="text-gray-600 mb-6">Join our loyalty program and start earning rewards!</p>
          <Button onClick={() => fetchLoyaltyData()}>Activate Membership</Button>
        </div>
      </div>
    );
  }

  const currentTierData = tiers.find(t => t.id === stats.currentTier);
  const tierProgress = stats.nextTier 
    ? ((stats.currentPoints - (currentTierData?.minPoints || 0)) / 
       (stats.nextTier.pointsNeeded - (currentTierData?.minPoints || 0))) * 100
    : 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">OYO Wizard</h1>
        <p className="text-xl text-gray-600">Your loyalty program journey</p>
      </div>

      {/* Current Tier Status */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-transparent rounded-full -mr-16 -mt-16"></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTierIcon(stats.currentTier)}
              <div>
                <CardTitle className="text-2xl">{stats.currentTier} Member</CardTitle>
                <p className="text-gray-600">Member since {new Date(stats.memberSince).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.currentPoints.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">Points Balance</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats.nextTier && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Progress to {stats.nextTier.name}</span>
                <span className="text-sm font-medium">{stats.nextTier.pointsNeeded} points needed</span>
              </div>
              <Progress value={tierProgress} className="h-2" />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
              <p className="text-gray-600">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.discountPercentage}%</p>
              <p className="text-gray-600">Current Discount</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.pointsMultiplier}x</p>
              <p className="text-gray-600">Points Multiplier</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Your Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {stats.benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Tiers & Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`${stats.currentTier === tier.id ? 'ring-2 ring-blue-500 shadow-lg' : 'opacity-75'} 
                ${tier.minPoints > stats.currentPoints ? 'opacity-50' : ''}`}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  {getTierIcon(tier.id)}
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <p className="text-sm text-gray-600">{tier.minPoints.toLocaleString()} points</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{tier.discountPercentage}%</p>
                    <p className="text-xs text-gray-600">Discount</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{tier.pointsMultiplier}x</p>
                    <p className="text-xs text-gray-600">Points</p>
                  </div>
                </div>
                {stats.currentTier === tier.id && (
                  <Badge className="w-full mt-3 justify-center bg-blue-500">Current Tier</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Rewards */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.availableRewards.map((reward, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getRewardIcon(reward.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{reward.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">{reward.pointsRequired.toLocaleString()} pts</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={stats.currentPoints >= reward.pointsRequired ? "default" : "secondary"}
                        disabled={stats.currentPoints < reward.pointsRequired}
                        onClick={() => setSelectedReward(reward)}
                      >
                        {stats.currentPoints >= reward.pointsRequired ? 'Redeem' : 'Insufficient Points'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Bookings</span>
                <span className="font-bold">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Spent</span>
                <span className="font-bold">₹{stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Points Earned</span>
                <span className="font-bold text-green-600">{stats.currentPoints.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Tier Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextTier ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Points needed for {stats.nextTier.name}</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.nextTier.pointsNeeded.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Next Tier Benefits:</p>
                  {stats.nextTier.benefits.slice(0, 3).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <ChevronRight className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className="font-bold">Maximum Tier Reached!</p>
                <p className="text-sm text-gray-600">You are enjoying all the benefits</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Redemption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Are you sure you want to redeem:</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">{selectedReward.name}</h4>
                  <p className="text-sm text-gray-600">{selectedReward.description}</p>
                  <p className="font-bold text-blue-600 mt-2">{selectedReward.pointsRequired.toLocaleString()} points</p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedReward(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => redeemReward(selectedReward)}
                  >
                    Confirm Redemption
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDashboard;