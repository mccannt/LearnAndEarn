import type {
  AvatarItemCatalog,
  AvatarItemRarity as PrismaAvatarItemRarity,
  AvatarItemType as PrismaAvatarItemType,
  RewardCatalog,
  RewardType,
} from "@prisma/client";

export type AvatarItemType =
  | "hair_style"
  | "shirt"
  | "pants"
  | "shoes"
  | "accessory"
  | "background";

export type AvatarItemRarity = "common" | "rare" | "epic" | "legendary";

export type RewardCatalogType = "screen_time" | "roblox_credits";

export interface AvatarCatalogItemDto {
  id: string;
  name: string;
  type: AvatarItemType;
  color: string;
  cost: number;
  rarity: AvatarItemRarity;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface RewardCatalogItemDto {
  id: string;
  type: RewardCatalogType;
  title: string;
  description: string;
  cost: number;
  rewardValue: number;
  stockTotal: number | null;
  stockRemaining: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AvatarState {
  hairStyle: string | null;
  shirt: string | null;
  pants: string | null;
  shoes: string | null;
  accessory: string | null;
  background: string | null;
}

const avatarTypeMap: Record<PrismaAvatarItemType, AvatarItemType> = {
  HAIR_STYLE: "hair_style",
  SHIRT: "shirt",
  PANTS: "pants",
  SHOES: "shoes",
  ACCESSORY: "accessory",
  BACKGROUND: "background",
};

const avatarRarityMap: Record<PrismaAvatarItemRarity, AvatarItemRarity> = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

const rewardTypeMap: Record<RewardType, RewardCatalogType> = {
  POINTS: "screen_time",
  SCREEN_TIME_MINUTES: "screen_time",
  ROBLOX_CREDITS: "roblox_credits",
};

export const avatarSlotByType: Record<AvatarItemType, keyof AvatarState> = {
  hair_style: "hairStyle",
  shirt: "shirt",
  pants: "pants",
  shoes: "shoes",
  accessory: "accessory",
  background: "background",
};

export function toAvatarCatalogItemDto(item: AvatarItemCatalog): AvatarCatalogItemDto {
  return {
    id: item.id,
    name: item.name,
    type: avatarTypeMap[item.type],
    color: item.color,
    cost: item.cost,
    rarity: avatarRarityMap[item.rarity],
    isDefault: item.isDefault,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
  };
}

export function toRewardCatalogItemDto(item: RewardCatalog): RewardCatalogItemDto {
  return {
    id: item.id,
    type: rewardTypeMap[item.type],
    title: item.title,
    description: item.description,
    cost: item.cost,
    rewardValue: item.rewardValue,
    stockTotal: item.stockTotal,
    stockRemaining: item.stockRemaining,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
  };
}
