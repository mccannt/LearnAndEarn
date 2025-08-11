"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Palette, Star, Lock, Check, Shirt, Crown, Glasses, Sparkles } from "lucide-react";
import Link from "next/link";

interface AvatarItem {
  id: string;
  name: string;
  type: "hair_style" | "shirt" | "pants" | "shoes" | "accessory" | "background";
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

export default function AvatarPage() {
  const [userPoints, setUserPoints] = useState(150);
  const [selectedCategory, setSelectedCategory] = useState<AvatarItem["type"] | "all">("all");
  const [avatar, setAvatar] = useState<AvatarState>({
    hairStyle: "default",
    shirt: "blue_tee",
    pants: "jeans",
    shoes: "sneakers",
    accessory: "none",
    background: "default"
  });

  // Sample avatar items
  const avatarItems: AvatarItem[] = [
    // Hair styles
    { id: "hair1", name: "Classic Cut", type: "hair_style", color: "#8B4513", cost: 0, isUnlocked: true, isEquipped: true, rarity: "common" },
    { id: "hair2", name: "Curly Locks", type: "hair_style", color: "#FFD700", cost: 50, isUnlocked: true, isEquipped: false, rarity: "common" },
    { id: "hair3", name: "Spiky Style", type: "hair_style", color: "#FF6347", cost: 100, isUnlocked: false, isEquipped: false, rarity: "rare" },
    { id: "hair4", name: "Rainbow Hair", type: "hair_style", color: "#FF1493", cost: 200, isUnlocked: false, isEquipped: false, rarity: "epic" },
    
    // Shirts
    { id: "shirt1", name: "Blue Tee", type: "shirt", color: "#4169E1", cost: 0, isUnlocked: true, isEquipped: true, rarity: "common" },
    { id: "shirt2", name: "Pink Shirt", type: "shirt", color: "#FF69B4", cost: 30, isUnlocked: true, isEquipped: false, rarity: "common" },
    { id: "shirt3", name: "Cool Jacket", type: "shirt", color: "#000000", cost: 80, isUnlocked: false, isEquipped: false, rarity: "rare" },
    { id: "shirt4", name: "Sparkly Top", type: "shirt", color: "#FFD700", cost: 150, isUnlocked: false, isEquipped: false, rarity: "epic" },
    
    // Pants
    { id: "pants1", name: "Classic Jeans", type: "pants", color: "#4169E1", cost: 0, isUnlocked: true, isEquipped: true, rarity: "common" },
    { id: "pants2", name: "Shorts", type: "pants", color: "#32CD32", cost: 25, isUnlocked: true, isEquipped: false, rarity: "common" },
    { id: "pants3", name: "Cool Skirt", type: "pants", color: "#FF69B4", cost: 60, isUnlocked: false, isEquipped: false, rarity: "rare" },
    
    // Shoes
    { id: "shoes1", name: "Sneakers", type: "shoes", color: "#FFFFFF", cost: 0, isUnlocked: true, isEquipped: true, rarity: "common" },
    { id: "shoes2", name: "Boots", type: "shoes", color: "#8B4513", cost: 40, isUnlocked: true, isEquipped: false, rarity: "common" },
    { id: "shoes3", name: "Sparkly Shoes", type: "shoes", color: "#FFD700", cost: 120, isUnlocked: false, isEquipped: false, rarity: "epic" },
    
    // Accessories
    { id: "acc1", name: "Cool Glasses", type: "accessory", color: "#000000", cost: 35, isUnlocked: true, isEquipped: false, rarity: "common" },
    { id: "acc2", name: "Crown", type: "accessory", color: "#FFD700", cost: 100, isUnlocked: false, isEquipped: false, rarity: "rare" },
    { id: "acc3", name: "Magic Wand", type: "accessory", color: "#FF1493", cost: 180, isUnlocked: false, isEquipped: false, rarity: "legendary" },
    
    // Backgrounds
    { id: "bg1", name: "Default", type: "background", color: "#87CEEB", cost: 0, isUnlocked: true, isEquipped: true, rarity: "common" },
    { id: "bg2", name: "Space", type: "background", color: "#191970", cost: 75, isUnlocked: false, isEquipped: false, rarity: "rare" },
    { id: "bg3", name: "Rainbow", type: "background", color: "#FF1493", cost: 150, isUnlocked: false, isEquipped: false, rarity: "epic" },
  ];

  // Filter items by category
  const filteredItems = selectedCategory === "all" 
    ? avatarItems 
    : avatarItems.filter(item => item.type === selectedCategory);

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
  const unlockItem = (item: AvatarItem) => {
    if (userPoints >= item.cost && !item.isUnlocked) {
      setUserPoints(prev => prev - item.cost);
      // In a real app, this would update the database
      item.isUnlocked = true;
    }
  };

  // Equip item
  const equipItem = (item: AvatarItem) => {
    if (!item.isUnlocked) return;
    
    // Unequip other items of the same type
    avatarItems.forEach(otherItem => {
      if (otherItem.type === item.type && otherItem.isEquipped) {
        otherItem.isEquipped = false;
      }
    });
    
    // Equip the selected item
    item.isEquipped = true;
    
    // Update avatar state
    setAvatar(prev => ({
      ...prev,
      [item.type === "hair_style" ? "hairStyle" :
       item.type === "shirt" ? "shirt" :
       item.type === "pants" ? "pants" :
       item.type === "shoes" ? "shoes" :
       item.type === "accessory" ? "accessory" : "background"]: item.id
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
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
                <h1 className="text-2xl font-bold text-gray-800">Avatar Studio</h1>
                <p className="text-gray-600">Customize your look with earned rewards!</p>
              </div>
            </div>
          </div>
          
          {/* Points Display */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800">{userPoints}</span>
            <span className="text-sm text-gray-600">points</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Display */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">Your Avatar</CardTitle>
                <CardDescription className="text-gray-600">
                  Level 3 • 12 items unlocked
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Preview */}
                <div className="relative">
                  <div 
                    className="w-full h-64 rounded-lg flex items-center justify-center text-6xl transition-all duration-300"
                    style={{ backgroundColor: avatarItems.find(item => item.id === avatar.background)?.color || "#87CEEB" }}
                  >
                    <div className="relative">
                      {/* Base avatar */}
                      <div className="text-6xl">🧑</div>
                      
                      {/* Hair overlay */}
                      {avatar.hairStyle !== "default" && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-4xl">
                          {avatar.hairStyle === "hair2" && "👱‍♀️"}
                          {avatar.hairStyle === "hair3" && "👱‍♂️"}
                          {avatar.hairStyle === "hair4" && "🌈"}
                        </div>
                      )}
                      
                      {/* Accessory overlay */}
                      {avatar.accessory !== "none" && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl">
                          {avatar.accessory === "acc1" && "🤓"}
                          {avatar.accessory === "acc2" && <Crown className="w-6 h-6 text-yellow-500" />}
                          {avatar.accessory === "acc3" && <Sparkles className="w-6 h-6 text-pink-500" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Equipped Items */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Currently Wearing:</h4>
                  <div className="space-y-2">
                    {Object.entries(avatar).map(([key, value]) => {
                      if (value === "none" || value === "default") return null;
                      const item = avatarItems.find(i => i.id === value);
                      if (!item) return null;
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{getCategoryIcon(item.type)}</span>
                            <span className="text-sm font-medium">{item.name}</span>
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
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["all", "hair_style", "shirt", "pants", "shoes", "accessory", "background"].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category as any)}
                      className="flex items-center gap-2 border-purple-200"
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
                  className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    item.isEquipped ? "ring-2 ring-purple-400" : ""
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
                    <CardTitle className="text-lg text-gray-800">{item.name}</CardTitle>
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
                          className={`w-full ${item.isEquipped ? "bg-green-500 hover:bg-green-600" : "border-purple-200 text-purple-600 hover:bg-purple-50"}`}
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