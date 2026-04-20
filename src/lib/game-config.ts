export type AvatarItemType =
  | "hair_style"
  | "shirt"
  | "pants"
  | "shoes"
  | "accessory"
  | "background";

export type AvatarItemRarity = "common" | "rare" | "epic" | "legendary";

export interface AvatarItemDefinition {
  id: string;
  name: string;
  type: AvatarItemType;
  color: string;
  cost: number;
  rarity: AvatarItemRarity;
}

export interface RewardDefinition {
  id: string;
  type: "screen_time" | "roblox_credits";
  title: string;
  description: string;
  cost: number;
}

export const AVATAR_ITEMS: AvatarItemDefinition[] = [
  { id: "hair1", name: "Classic Cut", type: "hair_style", color: "#8B4513", cost: 0, rarity: "common" },
  { id: "hair2", name: "Curly Locks", type: "hair_style", color: "#FFD700", cost: 50, rarity: "common" },
  { id: "hair3", name: "Spiky Style", type: "hair_style", color: "#FF6347", cost: 100, rarity: "rare" },
  { id: "hair4", name: "Rainbow Hair", type: "hair_style", color: "#FF1493", cost: 200, rarity: "epic" },
  { id: "shirt1", name: "Blue Tee", type: "shirt", color: "#4169E1", cost: 0, rarity: "common" },
  { id: "shirt2", name: "Pink Shirt", type: "shirt", color: "#FF69B4", cost: 30, rarity: "common" },
  { id: "shirt3", name: "Cool Jacket", type: "shirt", color: "#000000", cost: 80, rarity: "rare" },
  { id: "shirt4", name: "Sparkly Top", type: "shirt", color: "#FFD700", cost: 150, rarity: "epic" },
  { id: "pants1", name: "Classic Jeans", type: "pants", color: "#4169E1", cost: 0, rarity: "common" },
  { id: "pants2", name: "Shorts", type: "pants", color: "#32CD32", cost: 25, rarity: "common" },
  { id: "pants3", name: "Cool Skirt", type: "pants", color: "#FF69B4", cost: 60, rarity: "rare" },
  { id: "shoes1", name: "Sneakers", type: "shoes", color: "#FFFFFF", cost: 0, rarity: "common" },
  { id: "shoes2", name: "Boots", type: "shoes", color: "#8B4513", cost: 40, rarity: "common" },
  { id: "shoes3", name: "Sparkly Shoes", type: "shoes", color: "#FFD700", cost: 120, rarity: "epic" },
  { id: "acc1", name: "Cool Glasses", type: "accessory", color: "#000000", cost: 35, rarity: "common" },
  { id: "acc2", name: "Crown", type: "accessory", color: "#FFD700", cost: 100, rarity: "rare" },
  { id: "acc3", name: "Magic Wand", type: "accessory", color: "#FF1493", cost: 180, rarity: "legendary" },
  { id: "bg1", name: "Default", type: "background", color: "#87CEEB", cost: 0, rarity: "common" },
  { id: "bg2", name: "Space", type: "background", color: "#191970", cost: 75, rarity: "rare" },
  { id: "bg3", name: "Rainbow", type: "background", color: "#FF1493", cost: 150, rarity: "epic" },
];

export const REWARD_CATALOG: RewardDefinition[] = [
  { id: "screen_15", type: "screen_time", title: "15 Minutes Screen Time", description: "Get 15 extra minutes of tablet time", cost: 50 },
  { id: "screen_30", type: "screen_time", title: "30 Minutes Screen Time", description: "Get 30 extra minutes of tablet time", cost: 90 },
  { id: "screen_60", type: "screen_time", title: "1 Hour Screen Time", description: "Get 1 hour of extra tablet time", cost: 150 },
  { id: "roblox_100", type: "roblox_credits", title: "100 Robux", description: "Get 100 Robux for your Roblox account", cost: 200 },
  { id: "roblox_400", type: "roblox_credits", title: "400 Robux", description: "Get 400 Robux for your Roblox account", cost: 700 },
  { id: "roblox_800", type: "roblox_credits", title: "800 Robux", description: "Get 800 Robux for your Roblox account", cost: 1200 },
];

export function getAvatarItemDefinition(itemId: string) {
  return AVATAR_ITEMS.find((item) => item.id === itemId) ?? null;
}

export function getRewardDefinition(rewardId: string) {
  return REWARD_CATALOG.find((reward) => reward.id === rewardId) ?? null;
}
