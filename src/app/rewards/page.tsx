"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Gift, Star, Clock, Trophy, CheckCircle, AlertCircle, Smartphone, Gamepad2 } from "lucide-react";
import Link from "next/link";

interface Reward {
  id: string;
  type: "screen_time" | "roblox_credits";
  title: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  color: string;
  currentValue: number;
  maxValue: number;
}

interface Redemption {
  id: string;
  rewardType: string;
  title: string;
  pointsUsed: number;
  redeemedAt: string;
  status: "pending" | "approved" | "fulfilled";
}

export default function RewardsPage() {
  const [userPoints, setUserPoints] = useState(150);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Available rewards
  const rewards: Reward[] = [
    {
      id: "screen_15",
      type: "screen_time",
      title: "15 Minutes Screen Time",
      description: "Get 15 extra minutes of tablet time",
      cost: 50,
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      currentValue: 2,
      maxValue: 10
    },
    {
      id: "screen_30",
      type: "screen_time",
      title: "30 Minutes Screen Time",
      description: "Get 30 extra minutes of tablet time",
      cost: 90,
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      currentValue: 1,
      maxValue: 5
    },
    {
      id: "screen_60",
      type: "screen_time",
      title: "1 Hour Screen Time",
      description: "Get 1 hour of extra tablet time",
      cost: 150,
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      currentValue: 0,
      maxValue: 3
    },
    {
      id: "roblox_100",
      type: "roblox_credits",
      title: "100 Robux",
      description: "Get 100 Robux for your Roblox account",
      cost: 200,
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      currentValue: 0,
      maxValue: 2
    },
    {
      id: "roblox_400",
      type: "roblox_credits",
      title: "400 Robux",
      description: "Get 400 Robux for your Roblox account",
      cost: 700,
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      currentValue: 0,
      maxValue: 1
    },
    {
      id: "roblox_800",
      type: "roblox_credits",
      title: "800 Robux",
      description: "Get 800 Robux for your Roblox account",
      cost: 1200,
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      currentValue: 0,
      maxValue: 1
    }
  ];

  // Redemption history
  const redemptionHistory: Redemption[] = [
    {
      id: "red1",
      rewardType: "screen_time",
      title: "15 Minutes Screen Time",
      pointsUsed: 50,
      redeemedAt: "2024-01-15",
      status: "fulfilled"
    },
    {
      id: "red2",
      rewardType: "screen_time",
      title: "30 Minutes Screen Time",
      pointsUsed: 90,
      redeemedAt: "2024-01-10",
      status: "fulfilled"
    },
    {
      id: "red3",
      rewardType: "roblox_credits",
      title: "100 Robux",
      pointsUsed: 200,
      redeemedAt: "2024-01-05",
      status: "pending"
    }
  ];

  // Get reward by ID
  const getRewardById = (id: string) => {
    return rewards.find(reward => reward.id === id);
  };

  // Handle reward redemption
  const handleRedeem = (rewardId: string) => {
    const reward = getRewardById(rewardId);
    if (!reward) return;

    const totalCost = reward.cost * redemptionAmount;
    if (userPoints >= totalCost) {
      setSelectedReward(rewardId);
      setShowConfirmation(true);
    }
  };

  // Confirm redemption
  const confirmRedemption = () => {
    if (!selectedReward) return;

    const reward = getRewardById(selectedReward);
    if (!reward) return;

    const totalCost = reward.cost * redemptionAmount;
    setUserPoints(prev => prev - totalCost);
    
    // In a real app, this would create a redemption record in the database
    setShowConfirmation(false);
    setSelectedReward(null);
    setRedemptionAmount(1);
  };

  // Cancel redemption
  const cancelRedemption = () => {
    setShowConfirmation(false);
    setSelectedReward(null);
    setRedemptionAmount(1);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "approved": return "text-blue-600 bg-blue-100";
      case "fulfilled": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "fulfilled": return <Trophy className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Calculate progress to next reward
  const getProgressToNextReward = () => {
    const nextReward = rewards.find(r => r.cost > userPoints);
    if (!nextReward) return 100;
    
    const prevReward = rewards.filter(r => r.cost <= userPoints).pop();
    if (!prevReward) return (userPoints / nextReward.cost) * 100;
    
    const range = nextReward.cost - prevReward.cost;
    const progress = userPoints - prevReward.cost;
    return (progress / range) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="border-orange-200">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Reward Store</h1>
                <p className="text-gray-600">Redeem your points for awesome rewards!</p>
              </div>
            </div>
          </div>
          
          {/* Points Display */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800">{userPoints}</span>
            <span className="text-sm text-gray-600">points available</span>
          </div>
        </header>

        {/* Progress to Next Reward */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress to Next Reward</span>
              <span className="text-sm text-gray-600">{getProgressToNextReward().toFixed(0)}%</span>
            </div>
            <Progress value={getProgressToNextReward()} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Keep learning to earn more points!</span>
              <span>Next reward in {Math.max(0, 50 - (userPoints % 50))} points</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Rewards */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Available Rewards</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose how to spend your hard-earned points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((reward) => {
                    const canAfford = userPoints >= reward.cost;
                    const timesRedeemed = reward.maxValue - reward.currentValue;
                    
                    return (
                      <Card 
                        key={reward.id} 
                        className={`bg-gradient-to-br ${reward.color} text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                          !canAfford || timesRedeemed <= 0 ? "opacity-60" : ""
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {reward.icon}
                              <Badge variant="secondary" className="bg-white/20 text-white">
                                {reward.type === "screen_time" ? "Screen Time" : "Roblox"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{reward.cost}</div>
                              <div className="text-xs opacity-80">points</div>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{reward.title}</CardTitle>
                          <CardDescription className="text-white/80">
                            {reward.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Availability */}
                          <div className="flex items-center justify-between text-sm">
                            <span>Available this week:</span>
                            <span className="font-semibold">{timesRedeemed} left</span>
                          </div>
                          
                          {/* Progress */}
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-300"
                              style={{ width: `${((reward.maxValue - timesRedeemed) / reward.maxValue) * 100}%` }}
                            />
                          </div>
                          
                          {/* Action Button */}
                          <Button 
                            onClick={() => handleRedeem(reward.id)}
                            disabled={!canAfford || timesRedeemed <= 0}
                            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold"
                          >
                            {!canAfford ? (
                              `Need ${reward.cost - userPoints} more points`
                            ) : timesRedeemed <= 0 ? (
                              "Out of stock this week"
                            ) : (
                              "Redeem Reward"
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Redemption History */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Your reward redemption history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {redemptionHistory.map((redemption) => (
                    <div key={redemption.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {redemption.title}
                        </h4>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(redemption.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(redemption.status)}
                            {redemption.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{redemption.pointsUsed} points</span>
                        <span>{new Date(redemption.redeemedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  
                  {redemptionHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No redemptions yet</p>
                      <p className="text-xs">Start earning points to get rewards!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* How to Earn */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">How to Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">+10</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Correct Answer</span>
                      <p className="text-xs text-gray-500">Base points for each correct answer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">+5</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Speed Bonus</span>
                      <p className="text-xs text-gray-500">Answer quickly for extra points</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">+20</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Difficulty Bonus</span>
                      <p className="text-xs text-gray-500">Higher difficulty = more points</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">+50</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Session Complete</span>
                      <p className="text-xs text-gray-500">Bonus for finishing learning sessions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-white border-0 shadow-xl max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Confirm Redemption</CardTitle>
                <CardDescription className="text-gray-600">
                  Are you sure you want to redeem this reward?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const reward = getRewardById(selectedReward);
                  if (!reward) return null;
                  
                  const totalCost = reward.cost * redemptionAmount;
                  
                  return (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          {reward.icon}
                          <div>
                            <h3 className="font-semibold text-gray-800">{reward.title}</h3>
                            <p className="text-sm text-gray-600">{reward.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setRedemptionAmount(prev => Math.max(1, prev - 1))}
                              className="h-8 w-8"
                            >
                              -
                            </Button>
                            <span className="font-semibold w-8 text-center">{redemptionAmount}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setRedemptionAmount(prev => Math.min(reward.currentValue, prev + 1))}
                              disabled={redemptionAmount >= reward.currentValue}
                              className="h-8 w-8"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          <span className="font-semibold text-gray-800">Total Cost:</span>
                          <span className="font-bold text-lg text-orange-600">{totalCost} points</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={cancelRedemption}
                          className="flex-1 border-gray-200"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={confirmRedemption}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                        >
                          Confirm Redemption
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}