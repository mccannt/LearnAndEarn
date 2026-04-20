"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Gift, Star, Clock, Trophy, CheckCircle, AlertCircle, Smartphone, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { REWARD_CATALOG } from "@/lib/game-config";

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
  const [userPoints, setUserPoints] = useState(0);
  const [history, setHistory] = useState<Redemption[]>([]);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load current points
    fetch("/api/progress").then(async (r) => r.json()).then((json) => {
      const d = json?.data;
      setUserPoints(d?.child?.totalPoints ?? 0);
    }).catch(() => {});
    // Load reward history
    fetch("/api/rewards/history").then(async (r) => r.json()).then((json) => {
      const raw = json?.history || [];
      // Map to local shape if needed
      const mapped: Redemption[] = raw.map((r: any) => ({
        id: r.id,
        rewardType: r.type,
        title: r.description,
        pointsUsed: r.amount,
        redeemedAt: r.earnedAt,
        status: r.isRedeemed ? "fulfilled" : "pending",
      }));
      setHistory(mapped);
    }).catch(() => {});
  }, []);

  const rewards: Reward[] = REWARD_CATALOG.map((reward) => {
    const isScreenTime = reward.type === "screen_time";
    const inventory =
      reward.id === "screen_15"
        ? { currentValue: 2, maxValue: 10 }
        : reward.id === "screen_30"
          ? { currentValue: 1, maxValue: 5 }
          : reward.id === "screen_60"
            ? { currentValue: 0, maxValue: 3 }
            : reward.id === "roblox_100"
              ? { currentValue: 0, maxValue: 2 }
              : { currentValue: 0, maxValue: 1 };

    return {
      ...reward,
      icon: isScreenTime ? <Smartphone className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />,
      color: isScreenTime ? "from-blue-500 to-cyan-500" : "from-green-500 to-emerald-500",
      currentValue: inventory.currentValue,
      maxValue: inventory.maxValue,
    };
  });

  const getRewardById = (id: string) => rewards.find(r => r.id === id);

  const handleRedeem = (rewardId: string) => {
    const reward = getRewardById(rewardId);
    if (!reward) return;
    const totalCost = reward.cost * redemptionAmount;
    if (userPoints >= totalCost) {
      setSelectedReward(rewardId);
      setShowConfirmation(true);
    }
  };

  const confirmRedemption = async () => {
    if (!selectedReward) return;
    const reward = getRewardById(selectedReward);
    if (!reward) return;
    const totalCost = reward.cost * redemptionAmount;
    try {
      const r = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id, quantity: redemptionAmount }),
      });
      const data = await r.json();
      if (r.ok) {
        setUserPoints(data.newTotalPoints ?? Math.max(0, userPoints - totalCost));
        setHistory(prev => [{ id: data.reward?.id ?? Math.random().toString(36).slice(2), rewardType: reward.type, title: data.reward?.description ?? reward.title, pointsUsed: data.pointsDeducted ?? totalCost, redeemedAt: data.reward?.earnedAt ?? new Date().toISOString(), status: 'pending' }, ...prev]);
        toast({ title: "Redemption requested", description: `${reward.title} redeemed for ${totalCost} points.` });
      } else {
        toast({ title: "Redemption failed", description: data.error || "Please try again.", variant: "destructive" as any });
      }
    } finally {
      setShowConfirmation(false);
      setSelectedReward(null);
      setRedemptionAmount(1);
    }
  };

  const cancelRedemption = () => {
    setShowConfirmation(false);
    setSelectedReward(null);
    setRedemptionAmount(1);
  };

  const getStatusColor = (status: string) => status === "pending" ? "text-yellow-600 bg-yellow-100" : status === "approved" ? "text-blue-600 bg-blue-100" : status === "fulfilled" ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100";
  const getStatusIcon = (status: string) => status === "pending" ? <Clock className="w-4 h-4" /> : status === "approved" ? <CheckCircle className="w-4 h-4" /> : status === "fulfilled" ? <Trophy className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reward Store</h1>
                <p className="text-gray-600 dark:text-gray-300">Redeem your points for awesome rewards!</p>
              </div>
            </div>
          </div>
          {/* Points Display */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 dark:border-orange-800">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800 dark:text-white">{userPoints}</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">points available</span>
          </div>
        </header>

        {/* Progress to Next Reward */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress to Next Reward</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{getProgressToNextReward().toFixed(0)}%</span>
            </div>
            <Progress value={getProgressToNextReward()} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Keep learning to earn more points!</span>
              <span>Next reward in {Math.max(0, 50 - (userPoints % 50))} points</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Rewards */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Available Rewards</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Choose how to spend your hard-earned points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rewards.map((reward) => {
                    const canAfford = userPoints >= reward.cost;
                    const timesRedeemed = reward.maxValue - reward.currentValue;
                    return (
                      <Card key={reward.id} className={`bg-gradient-to-br ${reward.color} text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${!canAfford || timesRedeemed <= 0 ? "opacity-60" : ""}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {reward.icon}
                              <Badge variant="secondary" className="bg-white/20 text-white">{reward.type === "screen_time" ? "Screen Time" : "Roblox"}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{reward.cost}</div>
                              <div className="text-xs opacity-80">points</div>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{reward.title}</CardTitle>
                          <CardDescription className="text-white/80">{reward.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Available this week:</span>
                            <span className="font-semibold">{timesRedeemed} left</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div className="bg-white rounded-full h-2 transition-all duration-300" style={{ width: `${((reward.maxValue - timesRedeemed) / reward.maxValue) * 100}%` }} />
                          </div>
                          <Button onClick={() => handleRedeem(reward.id)} disabled={!canAfford || timesRedeemed <= 0} className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 font-semibold">
                            {!canAfford ? `Need ${reward.cost - userPoints} more points` : timesRedeemed <= 0 ? "Out of stock this week" : "Redeem Reward"}
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
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">Your reward redemption history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((redemption) => (
                    <div key={redemption.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{redemption.title}</h4>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(redemption.status)}`}>
                          <div className="flex items-center gap-1">{getStatusIcon(redemption.status)}{redemption.status}</div>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                        <span>{redemption.pointsUsed} points</span>
                        <span>{new Date(redemption.redeemedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No redemptions yet</p>
                      <p className="text-xs">Start earning points to get rewards!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && selectedReward && (() => {
          const reward = getRewardById(selectedReward)!;
          const totalCost = reward.cost * redemptionAmount;
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl max-w-md w-full">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 dark:text-white">Confirm Redemption</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">Are you sure you want to redeem this reward?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {reward.icon}
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{reward.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setRedemptionAmount(prev => Math.max(1, prev - 1))} className="h-8 w-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white">-</Button>
                        <span className="font-semibold w-8 text-center text-gray-800 dark:text-white">{redemptionAmount}</span>
                        <Button variant="outline" size="icon" onClick={() => setRedemptionAmount(prev => prev + 1)} className="h-8 w-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white">+</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t dark:border-gray-700">
                      <span className="font-semibold text-gray-800 dark:text-white">Total Cost:</span>
                      <span className="font-bold text-lg text-orange-600">{totalCost} points</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={cancelRedemption} className="flex-1 border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
                    <Button onClick={confirmRedemption} className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold">Confirm Redemption</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
