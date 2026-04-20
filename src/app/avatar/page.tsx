"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Palette, Star, Lock, Check, Shirt, Crown, Glasses, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AVATAR_ITEMS, type AvatarItemType } from "@/lib/game-config";

interface AvatarItem {
  id: string;
  name: string;
  type: AvatarItemType;
  color: string;
  cost: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AvatarState {
  hairStyle: string;
  shirt: string;
  pants: string;
  shoes: string;
  accessory: string;
  background: string;
}

const INITIAL_AVATAR: AvatarState = {
  hairStyle: "default",
  shirt: "blue_tee",
  pants: "jeans",
  shoes: "sneakers",
  accessory: "none",
  background: "default",
};

const avatarSlotByType: Record<AvatarItem["type"], keyof AvatarState> = {
  hair_style: "hairStyle",
  shirt: "shirt",
  pants: "pants",
  shoes: "shoes",
  accessory: "accessory",
  background: "background",
};

function buildAvatarItems(avatar: AvatarState, unlockedItemIds: string[]): AvatarItem[] {
  return AVATAR_ITEMS.map((item) => ({
    ...item,
    isUnlocked: item.cost === 0 || unlockedItemIds.includes(item.id),
    isEquipped: avatar[avatarSlotByType[item.type]] === item.id,
  }));
}

export default function AvatarPage() {
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<AvatarItem["type"] | "all">("all");
  const [avatar, setAvatar] = useState<AvatarState>(INITIAL_AVATAR);
  const [allAvatarItems, setAllAvatarItems] = useState<AvatarItem[]>(
    buildAvatarItems(
      INITIAL_AVATAR,
      AVATAR_ITEMS.filter((item) => item.cost === 0).map((item) => item.id),
    ),
  );
  const { toast } = useToast();

  // Function to calculate level based on points
  const calculateLevel = (points: number) => {
    // This is a simple example; you can adjust the logic as needed
    return Math.floor(points / 100) + 1;
  };

  useEffect(() => {
    const fetchAvatarData = async () => {
      try {
        const res = await fetch("/api/avatar");
        const data = await res.json();
        
        if (data.ok) {
          const equippedAvatar = data.equippedAvatar as AvatarState;
          const unlockedItemIds = Array.isArray(data.unlockedItemIds) ? data.unlockedItemIds : [];
          setUserPoints(data.childTotalPoints ?? 0);
          setAvatar(equippedAvatar);
          setAllAvatarItems(buildAvatarItems(equippedAvatar, unlockedItemIds));
        }
      } catch (error) {
        console.error("Failed to fetch avatar data:", error);
        toast({ title: "Error", description: "Failed to load avatar data.", variant: "destructive" });
      }
    };

    fetchAvatarData();
  }, []);

  // Filter items by category
  const filteredItems = selectedCategory === "all" 
    ? allAvatarItems 
    : allAvatarItems.filter(item => item.type === selectedCategory);

  const unlockedItemsCount = allAvatarItems.filter(item => item.isUnlocked).length;
  const currentLevel = calculateLevel(userPoints);

  // Get rarity color
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
    }
  };

  // Equip item
  const equipItem = async (item: AvatarItem) => {
    if (!item.isUnlocked) return;
    
    try {
      const res = await fetch("/api/avatar/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();

      if (res.ok) {
        const equippedAvatar = data.equippedAvatar as AvatarState;
        setAvatar(equippedAvatar);
        setAllAvatarItems((prevItems) =>
          buildAvatarItems(
            equippedAvatar,
            prevItems.filter((prevItem) => prevItem.isUnlocked).map((prevItem) => prevItem.id),
          ),
        );
        toast({ title: "Equipped!", description: `${item.name} is now equipped.` });
      } else {
        throw new Error(data.message || "Failed to equip item");
      }
    } catch (error: any) {
      console.error("Error equipping item:", error);
      toast({ title: "Equip Failed", description: error.message || "Could not equip item. Please try again.", variant: "destructive" });
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hair_style": return "💇";
      case "shirt": return <Shirt className="w-4 h-4" />;
      case "pants": return "👖";
      case "shoes": return "👟";
      case "accessory": return <Glasses className="w-4 h-4" />;
      case "background": return "🌈";
      default: return <Palette className="w-4 h-4" />;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="border-purple-200">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Avatar Studio</h1>
                <p className="text-gray-600 dark:text-gray-300">Customize your look with earned rewards!</p>
              </div>
            </div>
          </div>
          
          {/* Points Display */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800 dark:text-white">{userPoints}</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">points</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Display */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 dark:text-white">Your Avatar</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Level {currentLevel} • {unlockedItemsCount}/17 items unlocked
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Preview */}
                <div className="relative">
                  <div 
                    className="w-full h-64 rounded-lg flex items-center justify-center text-6xl transition-all duration-300 dark:bg-gray-700"
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
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Currently Wearing:</h4>
                  <div className="space-y-2">
                    {Object.entries(avatar).map(([key, value]) => {
                      if (value === "none" || value === "default") return null;
                      const item = allAvatarItems.find(i => i.id === value);
                      if (!item) return null;
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{getCategoryIcon(item.type)}</span>
                            <span className="text-sm font-medium text-gray-800 dark:text-white">{item.name}</span>
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
                    <span>12/17 items</span>
                  </div>
                  <Progress value={(12/17) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["all", "hair_style", "shirt", "pants", "shoes", "accessory", "background"].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category as any)}
                      className="flex items-center gap-2 border-purple-200 dark:border-purple-800 dark:text-gray-300 dark:hover:bg-purple-900 dark:hover:text-white"
                    >
                      {getCategoryIcon(category)}
                      <span className="hidden sm:inline">{getCategoryDisplayName(category)}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
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
                    <CardTitle className="text-lg text-gray-800 dark:text-white">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Item Preview */}
                    <div className="w-full h-24 rounded-lg flex items-center justify-center text-4xl transition-all duration-300"
                         style={{ backgroundColor: item.color + "20" }}>
                      <div className="text-3xl">
                        {item.type === "hair_style" && "💇"}
                        {item.type === "shirt" && "👕"}
                        {item.type === "pants" && "👖"}
                        {item.type === "shoes" && "👟"}
                        {item.type === "accessory" && "🕶️"}
                        {item.type === "background" && "🌈"}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!item.isUnlocked ? (
                        <Button 
                          onClick={() => unlockItem(item)}
                          disabled={userPoints < item.cost}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                        >
                          <div className="flex items-center justify-between w-full">
                            <Lock className="w-4 h-4" />
                            <span>Unlock ({item.cost} pts)</span>
                          </div>
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => equipItem(item)}
                          variant={item.isEquipped ? "default" : "outline"}
                          className={`w-full ${item.isEquipped ? "bg-green-500 hover:bg-green-600" : "border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-gray-300 dark:hover:bg-purple-900 dark:hover:text-white"}`}
                        >
                          {item.isEquipped ? "Equipped" : "Equip"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
