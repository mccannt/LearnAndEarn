"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Gamepad2,
  Gift,
  Loader2,
  Smartphone,
  Star,
  Trophy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LearnerWorkspaceShell } from "@/components/learner-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { LearnerEmptyState } from "@/components/learner-state";
import { type RewardCatalogItemDto } from "@/lib/catalog";
import Link from "next/link";

interface Reward extends RewardCatalogItemDto {
  icon: React.ReactNode;
  color: string;
}

interface Redemption {
  id: string;
  rewardType: string;
  title: string;
  pointsUsed: number;
  redeemedAt: string;
  status: "pending" | "approved" | "fulfilled";
}

type RewardHistoryApiItem = {
  id: string;
  type: string;
  description: string;
  amount: number;
  earnedAt: string;
  isRedeemed: boolean;
};

const rewardPanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_24px_60px_rgba(255,155,73,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

export default function RewardsPage() {
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [catalog, setCatalog] = useState<RewardCatalogItemDto[]>([]);
  const [history, setHistory] = useState<Redemption[]>([]);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [pendingRewardId, setPendingRewardId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const [catalogResponse, historyResponse] = await Promise.all([
          fetch("/api/rewards", { cache: "no-store" }),
          fetch("/api/rewards/history", { cache: "no-store" }),
        ]);
        const [catalogJson, historyJson] = await Promise.all([
          catalogResponse.json(),
          historyResponse.json(),
        ]);

        if (catalogResponse.ok && catalogJson.ok) {
          setUserPoints(catalogJson.childTotalPoints ?? 0);
          setCatalog(Array.isArray(catalogJson.catalog) ? catalogJson.catalog : []);
        }

        if (historyResponse.ok && historyJson.ok) {
          const raw = Array.isArray(historyJson.history) ? (historyJson.history as RewardHistoryApiItem[]) : [];
          const mapped: Redemption[] = raw.map((reward) => ({
            id: reward.id,
            rewardType: reward.type,
            title: reward.description,
            pointsUsed: reward.amount,
            redeemedAt: reward.earnedAt,
            status: reward.isRedeemed ? "fulfilled" : "pending",
          }));
          setHistory(mapped);
        }
      } catch (error) {
        console.error("Failed to load rewards:", error);
        toast({
          title: "Error",
          description: "Failed to load rewards.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, [toast]);

  const rewards: Reward[] = catalog.map((reward) => {
    const isScreenTime = reward.type === "screen_time";

    return {
      ...reward,
      icon: isScreenTime ? <Smartphone className="w-6 h-6" /> : <Gamepad2 className="w-6 h-6" />,
      color: isScreenTime ? "from-blue-500 to-cyan-500" : "from-green-500 to-emerald-500",
    };
  });

  const getRewardById = (id: string) => rewards.find((reward) => reward.id === id);
  const nextReward = rewards.find((reward) => reward.cost > userPoints);
  const pointsToNextReward = nextReward ? Math.max(0, nextReward.cost - userPoints) : 0;

  const getAvailableUnits = (reward: Reward) =>
    reward.stockRemaining === null ? Infinity : reward.stockRemaining;

  const handleRedeem = (rewardId: string) => {
    const reward = getRewardById(rewardId);
    if (!reward) {
      return;
    }

    if (userPoints < reward.cost || getAvailableUnits(reward) <= 0) {
      return;
    }

    setRedemptionAmount(1);
    setSelectedReward(rewardId);
    setShowConfirmation(true);
  };

  const confirmRedemption = async () => {
    if (!selectedReward) {
      return;
    }

    const reward = getRewardById(selectedReward);
    if (!reward) {
      return;
    }

    const totalCost = reward.cost * redemptionAmount;
    setIsRedeeming(true);
    setPendingRewardId(reward.id);

    try {
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id, quantity: redemptionAmount }),
      });
      const data = await response.json();

      if (response.ok) {
        setUserPoints(data.newTotalPoints ?? Math.max(0, userPoints - totalCost));
        setCatalog((prevCatalog) =>
          prevCatalog.map((catalogItem) => {
            if (catalogItem.id !== reward.id || catalogItem.stockRemaining === null) {
              return catalogItem;
            }

            return {
              ...catalogItem,
              stockRemaining: Math.max(0, catalogItem.stockRemaining - redemptionAmount),
            };
          }),
        );
        setHistory((prevHistory) => [
          {
            id: data.reward?.id ?? Math.random().toString(36).slice(2),
            rewardType: reward.type,
            title: data.reward?.description ?? reward.title,
            pointsUsed: data.pointsDeducted ?? totalCost,
            redeemedAt: data.reward?.earnedAt ?? new Date().toISOString(),
            status: "pending",
          },
          ...prevHistory,
        ]);
        toast({
          title: "Redemption requested",
          description: `${reward.title} redeemed for ${totalCost} points.`,
        });
      } else {
        toast({
          title: "Redemption failed",
          description: data.error || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRedeeming(false);
      setPendingRewardId(null);
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

  const getStatusColor = (status: string) =>
    status === "pending"
      ? "text-yellow-600 bg-yellow-100"
      : status === "approved"
        ? "text-blue-600 bg-blue-100"
        : status === "fulfilled"
          ? "text-green-600 bg-green-100"
          : "text-gray-600 bg-gray-100";

  const getStatusIcon = (status: string) =>
    status === "pending"
      ? <Clock className="w-4 h-4" />
      : status === "approved"
        ? <CheckCircle className="w-4 h-4" />
        : status === "fulfilled"
          ? <Trophy className="w-4 h-4" />
          : <AlertCircle className="w-4 h-4" />;

  const getProgressToNextReward = () => {
    const sortedRewards = [...rewards].sort((left, right) => left.cost - right.cost);
    const nextReward = sortedRewards.find((reward) => reward.cost > userPoints);

    if (!nextReward) {
      return 100;
    }

    const previousReward = sortedRewards.filter((reward) => reward.cost <= userPoints).pop();
    if (!previousReward) {
      return (userPoints / nextReward.cost) * 100;
    }

    const range = nextReward.cost - previousReward.cost;
    const progress = userPoints - previousReward.cost;
    return (progress / range) * 100;
  };

  return (
    <LearnerWorkspaceShell
      currentSection="rewards"
      title="Reward Store"
      description="Swap learning points for real perks, check stock pressure, and keep an eye on your redemption history."
      icon={<Gift className="h-6 w-6" />}
      accent="orange"
      actions={
        <Button asChild variant="outline" className="rounded-full border-white/80 bg-white/70 dark:border-white/10 dark:bg-white/5">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      }
      metrics={[
        { label: "Points", value: `${userPoints}` },
        { label: "Catalog", value: `${rewards.length} rewards` },
        { label: "History", value: `${history.length} redemptions` },
        { label: "Next Reward", value: `${nextReward?.cost ?? userPoints} pts` },
      ]}
    >
      <MotionGroup className="mx-auto max-w-6xl space-y-6">
        <MotionItem>
        <Card className={rewardPanelClass}>
          <CardContent className="p-6">
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#ff8e3c_0%,#ffb347_56%,#ffe389_100%)] p-6 text-slate-950 shadow-[0_26px_70px_rgba(255,165,73,0.24)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full bg-white/40 text-slate-950">
                    Rewards Board
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-white/25 text-slate-900/80">
                    Spend carefully
                  </Badge>
                </div>
                <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                  Trade progress for perks without losing sight of what to save for.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-800/80 md:text-base">
                  The store now highlights your next reward runway, current buying power, and redemption history in one cleaner surface.
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-white/45 bg-white/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-700/65">Points ready</div>
                    <div className="mt-2 text-3xl font-semibold">{userPoints}</div>
                    <p className="mt-2 text-sm text-slate-700/80">Use now or hold for higher-value rewards later.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/45 bg-white/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-700/65">Catalog size</div>
                    <div className="mt-2 text-3xl font-semibold">{rewards.length}</div>
                    <p className="mt-2 text-sm text-slate-700/80">Available rewards currently visible in the store.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/45 bg-white/35 p-4">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-700/65">Pending requests</div>
                    <div className="mt-2 text-3xl font-semibold">{history.filter((entry) => entry.status === "pending").length}</div>
                    <p className="mt-2 text-sm text-slate-700/80">Redemptions still waiting for parent follow-through.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Closest next unlock</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    {loading
                      ? "Loading reward ladder..."
                      : nextReward?.title ?? "Everything is affordable"}
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {nextReward
                      ? `${pointsToNextReward} more points to reach it.`
                      : "You can already redeem anything in the catalog."}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress to Next Reward</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">{getProgressToNextReward().toFixed(0)}%</span>
                  </div>
                  <Progress value={getProgressToNextReward()} className="h-2.5" />
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    Keep learning to move the reward meter instead of checking the full store every time.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </MotionItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MotionItem>
            <Card className={rewardPanelClass}>
              <CardHeader>
                <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Available Rewards</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Choose how to spend your hard-earned points</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading rewards...
                  </div>
                ) : rewards.length === 0 ? (
                  <LearnerEmptyState
                    title="No rewards available yet"
                    description="The reward catalog is empty right now. Check back after a parent update."
                    icon={<Gift className="h-6 w-6" />}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {rewards.map((reward) => {
                      const availableUnits = getAvailableUnits(reward);
                      const canAfford = userPoints >= reward.cost;

                      return (
                        <MotionItem key={reward.id}>
                          <Card className={`bg-gradient-to-br ${reward.color} border-0 text-white shadow-lg transition-all duration-300 hover:shadow-xl ${!canAfford || availableUnits <= 0 ? "opacity-60" : ""}`}>
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
                              <CardDescription className="text-white/80">{reward.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span>Available now:</span>
                                <span className="font-semibold">
                                  {reward.stockRemaining === null ? "Unlimited" : `${reward.stockRemaining} left`}
                                </span>
                              </div>
                              {reward.stockTotal !== null && reward.stockRemaining !== null && (
                                <div className="h-2 w-full rounded-full bg-white/20">
                                  <div
                                    className="h-2 rounded-full bg-white transition-all duration-300"
                                    style={{ width: `${((reward.stockTotal - reward.stockRemaining) / reward.stockTotal) * 100}%` }}
                                  />
                                </div>
                              )}
                              <Button
                                onClick={() => handleRedeem(reward.id)}
                                disabled={!canAfford || availableUnits <= 0 || isRedeeming}
                                className="w-full rounded-full border border-white/30 bg-white/20 font-semibold text-white hover:bg-white/30"
                              >
                                {pendingRewardId === reward.id && isRedeeming ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redeeming...
                                  </span>
                                ) : !canAfford ? (
                                  `Need ${reward.cost - userPoints} more points`
                                ) : availableUnits <= 0 ? (
                                  "Out of stock"
                                ) : (
                                  "Redeem Reward"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </MotionItem>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            </MotionItem>
          </div>

          <div className="lg:col-span-1">
            <MotionItem>
            <Card className={rewardPanelClass}>
              <CardHeader>
                <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Recent Activity</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Your reward redemption history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading && history.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading activity...
                    </div>
                  ) : null}
                  {history.map((redemption) => (
                    <div key={redemption.id} className="rounded-[1.25rem] border border-white/80 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/45">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-950 dark:text-slate-50 text-sm">{redemption.title}</h4>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(redemption.status)}`}>
                          <div className="flex items-center gap-1">{getStatusIcon(redemption.status)}{redemption.status}</div>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>{redemption.pointsUsed} points</span>
                        <span>{new Date(redemption.redeemedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {!loading && history.length === 0 && (
                    <LearnerEmptyState
                      title="No redemptions yet"
                      description="Start earning points and your reward history will appear here."
                      icon={<Gift className="h-6 w-6" />}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            </MotionItem>
          </div>
        </div>

        {showConfirmation && selectedReward && (() => {
          const reward = getRewardById(selectedReward);
          if (!reward) {
            return null;
          }

          const affordableQuantity = Math.max(1, Math.floor(userPoints / reward.cost));
          const maxByStock = reward.stockRemaining === null ? 10 : Math.max(1, reward.stockRemaining);
          const maxQuantity = Math.min(10, affordableQuantity, maxByStock);
          const totalCost = reward.cost * redemptionAmount;

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-md w-full rounded-[1.75rem] border border-white/80 bg-white/90 shadow-2xl dark:border-white/10 dark:bg-slate-950/70">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Confirm Redemption</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">Are you sure you want to redeem this reward?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/45">
                    <div className="flex items-center gap-3 mb-2">
                      {reward.icon}
                      <div>
                        <h3 className="font-semibold text-slate-950 dark:text-slate-50">{reward.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{reward.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-slate-600 dark:text-slate-300">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" disabled={isRedeeming} onClick={() => setRedemptionAmount((previous) => Math.max(1, previous - 1))} className="h-8 w-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white">-</Button>
                        <span className="font-semibold w-8 text-center text-slate-950 dark:text-slate-50">{redemptionAmount}</span>
                        <Button variant="outline" size="icon" disabled={isRedeeming} onClick={() => setRedemptionAmount((previous) => Math.min(maxQuantity, previous + 1))} className="h-8 w-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white">+</Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      {reward.stockRemaining === null ? "Unlimited stock" : `${reward.stockRemaining} available right now`}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t dark:border-gray-700">
                      <span className="font-semibold text-slate-950 dark:text-slate-50">Total Cost:</span>
                      <span className="font-bold text-lg text-orange-600">{totalCost} points</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" disabled={isRedeeming} onClick={cancelRedemption} className="flex-1 rounded-full border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
                    <Button disabled={isRedeeming} onClick={confirmRedemption} className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold">
                      {isRedeeming ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Confirming...
                        </span>
                      ) : (
                        "Confirm Redemption"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </MotionGroup>
    </LearnerWorkspaceShell>
  );
}
