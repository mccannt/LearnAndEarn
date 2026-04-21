"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Check,
  Glasses,
  Loader2,
  Lock,
  Palette,
  Shirt,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LearnerWorkspaceShell } from "@/components/learner-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import {
  avatarSlotByType,
  type AvatarCatalogItemDto,
  type AvatarItemRarity,
  type AvatarItemType,
  type AvatarState,
} from "@/lib/catalog";
import Link from "next/link";

interface AvatarItem {
  id: string;
  name: string;
  type: AvatarItemType;
  color: string;
  cost: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  rarity: AvatarItemRarity;
  isDefault: boolean;
}

const INITIAL_AVATAR: AvatarState = {
  hairStyle: "hair1",
  shirt: "shirt1",
  pants: "pants1",
  shoes: "shoes1",
  accessory: "none",
  background: "bg1",
};

const studioPanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_24px_60px_rgba(162,83,255,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

const categoryEmojiMap: Record<AvatarItemType | "all", React.ReactNode> = {
  all: <Palette className="h-4 w-4" />,
  hair_style: "💇",
  shirt: <Shirt className="h-4 w-4" />,
  pants: "👖",
  shoes: "👟",
  accessory: <Glasses className="h-4 w-4" />,
  background: "🌈",
};

const itemPreviewEmojiMap: Record<AvatarItemType, string> = {
  hair_style: "💇",
  shirt: "👕",
  pants: "👖",
  shoes: "👟",
  accessory: "🕶️",
  background: "🌈",
};

function buildAvatarItems(
  avatar: AvatarState,
  unlockedItemIds: string[],
  catalog: AvatarCatalogItemDto[],
): AvatarItem[] {
  return catalog.map((item) => ({
    ...item,
    isUnlocked: item.isDefault || unlockedItemIds.includes(item.id),
    isEquipped: avatar[avatarSlotByType[item.type]] === item.id,
  }));
}

function isAvatarState(value: unknown): value is AvatarState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const avatar = value as Record<string, unknown>;

  return (
    typeof avatar.hairStyle === "string" &&
    typeof avatar.shirt === "string" &&
    typeof avatar.pants === "string" &&
    typeof avatar.shoes === "string" &&
    typeof avatar.accessory === "string" &&
    typeof avatar.background === "string"
  );
}

export default function AvatarPage() {
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<AvatarItem["type"] | "all">("all");
  const [avatar, setAvatar] = useState<AvatarState>(INITIAL_AVATAR);
  const [catalog, setCatalog] = useState<AvatarCatalogItemDto[]>([]);
  const [allAvatarItems, setAllAvatarItems] = useState<AvatarItem[]>([]);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"unlock" | "equip" | null>(null);
  const { toast } = useToast();

  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  useEffect(() => {
    const fetchAvatarData = async () => {
      try {
        const res = await fetch("/api/avatar");
        const data = await res.json();
        
        if (data.ok) {
          const equippedAvatar = isAvatarState(data.equippedAvatar)
            ? data.equippedAvatar
            : INITIAL_AVATAR;
          const unlockedItemIds = Array.isArray(data.unlockedItemIds) ? data.unlockedItemIds : [];
          const catalogItems = Array.isArray(data.catalog) ? data.catalog : [];
          setUserPoints(data.childTotalPoints ?? 0);
          setAvatar(equippedAvatar);
          setCatalog(catalogItems);
          setAllAvatarItems(buildAvatarItems(equippedAvatar, unlockedItemIds, catalogItems));
        }
      } catch (error) {
        console.error("Failed to fetch avatar data:", error);
        toast({ title: "Error", description: "Failed to load avatar data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarData();
  }, []);

  // Filter items by category
  const filteredItems = selectedCategory === "all" 
    ? allAvatarItems 
    : allAvatarItems.filter(item => item.type === selectedCategory);

  const unlockedItemsCount = allAvatarItems.filter(item => item.isUnlocked && !item.isDefault).length;
  const currentLevel = calculateLevel(userPoints);
  const totalCollectibleItems = allAvatarItems.filter((item) => !item.isDefault).length;
  const categoryOptions: Array<AvatarItem["type"] | "all"> = [
    "all",
    "hair_style",
    "shirt",
    "pants",
    "shoes",
    "accessory",
    "background",
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600";
      case "rare": return "text-blue-600";
      case "epic": return "text-purple-600";
      case "legendary": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  // Get rarity bg color
  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100";
      case "rare": return "bg-blue-100";
      case "epic": return "bg-purple-100";
      case "legendary": return "bg-yellow-100";
      default: return "bg-gray-100";
    }
  };

  // Unlock item
  const unlockItem = async (item: AvatarItem) => {
    if (userPoints < item.cost || item.isUnlocked) return;

    setPendingItemId(item.id);
    setPendingAction("unlock");
    try {
      const res = await fetch("/api/avatar/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserPoints(data.newTotalPoints);
        setAllAvatarItems((prevItems) =>
          prevItems.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, isUnlocked: true } : prevItem,
          ),
        );
        toast({ title: "Item Unlocked!", description: `${item.name} is now available.` });
      } else {
        throw new Error(data.message || "Failed to unlock item");
      }
    } catch (error: any) {
      console.error("Error unlocking item:", error);
      toast({ title: "Unlock Failed", description: error.message || "Not enough points to unlock this item.", variant: "destructive" });
    } finally {
      setPendingItemId(null);
      setPendingAction(null);
    }
  };

  // Equip item
  const equipItem = async (item: AvatarItem) => {
    if (!item.isUnlocked) return;

    setPendingItemId(item.id);
    setPendingAction("equip");
    try {
      const res = await fetch("/api/avatar/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();

      if (res.ok) {
        const equippedAvatar = isAvatarState(data.equippedAvatar)
          ? data.equippedAvatar
          : avatar;
        setAvatar(equippedAvatar);
        setAllAvatarItems((prevItems) =>
          buildAvatarItems(
            equippedAvatar,
            prevItems.filter((prevItem) => prevItem.isUnlocked).map((prevItem) => prevItem.id),
            catalog,
          ),
        );
        toast({ title: "Equipped!", description: `${item.name} is now equipped.` });
      } else {
        throw new Error(data.message || "Failed to equip item");
      }
    } catch (error: any) {
      console.error("Error equipping item:", error);
      toast({ title: "Equip Failed", description: error.message || "Could not equip item. Please try again.", variant: "destructive" });
    } finally {
      setPendingItemId(null);
      setPendingAction(null);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    return categoryEmojiMap[(category as AvatarItemType | "all")] ?? <Palette className="w-4 h-4" />;
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "hair_style": return "Hair";
      case "shirt": return "Shirts";
      case "pants": return "Pants";
      case "shoes": return "Shoes";
      case "accessory": return "Accessories";
      case "background": return "Backgrounds";
      default: return "All Items";
    }
  };

  return (
    <LearnerWorkspaceShell
      currentSection="avatar"
      title="Avatar Studio"
      description="Spend points on new looks, flip through your collection, and build a brighter character identity."
      icon={<Palette className="h-6 w-6" />}
      accent="violet"
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
        { label: "Level", value: `${currentLevel}` },
        { label: "Unlocked", value: `${unlockedItemsCount}/${totalCollectibleItems}` },
        { label: "Category", value: selectedCategory === "all" ? "All Items" : getCategoryDisplayName(selectedCategory) },
      ]}
    >
      <MotionGroup className="mx-auto max-w-6xl space-y-6">
        <MotionItem>
          <Card className={studioPanelClass}>
            <CardContent className="p-6">
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#5b4dff_0%,#8c62ff_58%,#ef7cff_100%)] p-6 text-white shadow-[0_26px_70px_rgba(138,92,255,0.24)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full bg-white/15 text-white">
                      Collection Board
                    </Badge>
                    <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                      {selectedCategory === "all" ? "All categories" : getCategoryDisplayName(selectedCategory)}
                    </Badge>
                  </div>
                  <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                    Shape a character that feels earned, not just unlocked.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/82 md:text-base">
                    Spend carefully, build a collection over time, and keep the current outfit feeling like progress instead of inventory.
                  </p>
                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Current level</div>
                      <div className="mt-2 text-3xl font-semibold">{currentLevel}</div>
                      <p className="mt-2 text-sm text-white/80">Every 100 points pushes the studio level up.</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Collection</div>
                      <div className="mt-2 text-3xl font-semibold">{unlockedItemsCount}/{totalCollectibleItems}</div>
                      <p className="mt-2 text-sm text-white/80">Track how much of the avatar catalog is already yours.</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/15 bg-white/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Points ready</div>
                      <div className="mt-2 text-3xl font-semibold">{userPoints}</div>
                      <p className="mt-2 text-sm text-white/80">Enough to buy, equip, or hold for rarer pieces later.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Focused category</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {selectedCategory === "all" ? "Everything" : getCategoryDisplayName(selectedCategory)}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Narrow the catalog when you want to finish a specific look faster.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Next upgrade signal</div>
                    <div className="mt-2 text-2xl font-semibold text-violet-700 dark:text-violet-200">
                      {loading
                        ? "Loading collection..."
                        : allAvatarItems.find((item) => !item.isUnlocked && item.cost <= userPoints)?.name ?? "Save for a rarer item"}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      The studio can now hint at a reachable unlock instead of forcing a full scan every time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionItem>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Avatar Display */}
          <div className="lg:col-span-1">
            <MotionItem className="sticky top-4">
            <Card className={studioPanelClass}>
              <CardHeader>
                <CardTitle className="font-display text-xl text-slate-950 dark:text-slate-50">Your Avatar</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Level {currentLevel} • {unlockedItemsCount}/{totalCollectibleItems} items unlocked
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Preview */}
                <div className="relative">
                  <div 
                    className="flex h-64 w-full items-center justify-center rounded-[1.5rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,255,255,0.2))] text-6xl transition-all duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(15,23,42,0.4))]"
                    style={{ backgroundColor: allAvatarItems.find(item => item.id === avatar.background)?.color || "#87CEEB" }}
                  >
                    <div className="relative">
                      {/* Base avatar */}
                      <div className="text-6xl">👤</div> {/* Simpler base avatar */}
                      
                      {/* The complexity of layering emojis for full avatar composition is removed for a simpler, functional preview. */}
                      {/* Equipped items are now primarily represented in the "Currently Wearing" list below. */}
                      
                    </div>
                  </div>
                </div>

                {/* Equipped Items */}
                <div>
                  <h4 className="mb-3 font-semibold text-slate-950 dark:text-slate-50">Currently Wearing</h4>
                  <div className="space-y-2">
                    {Object.entries(avatar).map(([key, value]) => {
                      if (value === "none") return null;
                      const item = allAvatarItems.find(i => i.id === value);
                      if (!item) return null;
                      
                      return (
                        <div key={key} className="flex items-center justify-between rounded-[1rem] border border-white/70 bg-white/70 p-2 dark:border-white/10 dark:bg-slate-900/45">
                          <div className="flex items-center gap-2">
                            <span>{getCategoryIcon(item.type)}</span>
                            <span className="text-sm font-medium text-slate-950 dark:text-slate-50">{item.name}</span>
                          </div>
                          <Badge variant="secondary" className={`text-xs ${getRarityBgColor(item.rarity)} ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Collection Progress</span>
                    <span>{unlockedItemsCount}/{totalCollectibleItems} items</span>
                  </div>
                  <Progress
                    value={totalCollectibleItems === 0 ? 0 : (unlockedItemsCount / totalCollectibleItems) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            </MotionItem>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <MotionItem>
            <Card className={`${studioPanelClass} mb-6`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className="flex items-center gap-2 rounded-full border-purple-200 dark:border-purple-800 dark:text-gray-300 dark:hover:bg-purple-900 dark:hover:text-white"
                    >
                      {getCategoryIcon(category)}
                      <span className="hidden sm:inline">{getCategoryDisplayName(category)}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            </MotionItem>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MotionItem key={item.id}>
                <Card 
                  className={`${studioPanelClass} transition-all duration-300 hover:shadow-xl ${
                    item.isEquipped ? "ring-2 ring-purple-400 dark:ring-purple-600" : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={`text-xs ${getRarityBgColor(item.rarity)} ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </Badge>
                      {item.isEquipped && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <CardTitle className="text-lg text-slate-950 dark:text-slate-50">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Item Preview */}
                    <div className="w-full h-24 rounded-[1.25rem] flex items-center justify-center text-4xl transition-all duration-300"
                         style={{ backgroundColor: item.color + "20" }}>
                      <div className="text-3xl">
                        {itemPreviewEmojiMap[item.type]}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!item.isUnlocked ? (
                        <Button 
                          onClick={() => unlockItem(item)}
                          disabled={userPoints < item.cost || pendingItemId !== null}
                          className="w-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold"
                        >
                          <div className="flex items-center justify-between w-full">
                            {pendingItemId === item.id && pendingAction === "unlock" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                            <span>
                              {pendingItemId === item.id && pendingAction === "unlock"
                                ? "Unlocking..."
                                : `Unlock (${item.cost} pts)`}
                            </span>
                          </div>
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => equipItem(item)}
                          variant={item.isEquipped ? "default" : "outline"}
                          disabled={pendingItemId !== null}
                          className={`w-full rounded-full ${item.isEquipped ? "bg-emerald-500 hover:bg-emerald-600" : "border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-gray-300 dark:hover:bg-purple-900 dark:hover:text-white"}`}
                        >
                          {pendingItemId === item.id && pendingAction === "equip" ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Equipping...
                            </span>
                          ) : item.isEquipped ? "Equipped" : "Equip"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </MotionItem>
              ))}
            </div>
          </div>
        </div>
      </MotionGroup>
    </LearnerWorkspaceShell>
  );
}
