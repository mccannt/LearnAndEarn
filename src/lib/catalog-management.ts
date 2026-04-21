import { AvatarItemRarity, AvatarItemType, RewardType } from "@prisma/client";

function asTrimmedString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} is required.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} is required.`);
  }

  return trimmed;
}

function asNonNegativeInteger(value: unknown, field: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }

  return parsed;
}

function asOptionalStockValue(value: unknown, field: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return asNonNegativeInteger(value, field);
}

function asBoolean(value: unknown, field: string) {
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be true or false.`);
  }

  return value;
}

export function parseAvatarCatalogUpdate(payload: unknown) {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const type = asTrimmedString(data.type, "Type").toUpperCase();
  const rarity = asTrimmedString(data.rarity, "Rarity").toUpperCase();

  if (!Object.values(AvatarItemType).includes(type as AvatarItemType)) {
    throw new Error("Type is invalid.");
  }

  if (!Object.values(AvatarItemRarity).includes(rarity as AvatarItemRarity)) {
    throw new Error("Rarity is invalid.");
  }

  return {
    id: asTrimmedString(data.id, "ID"),
    name: asTrimmedString(data.name, "Name"),
    type: type as AvatarItemType,
    color: asTrimmedString(data.color, "Color"),
    cost: asNonNegativeInteger(data.cost, "Cost"),
    rarity: rarity as AvatarItemRarity,
    isDefault: asBoolean(data.isDefault, "Default flag"),
    isActive: asBoolean(data.isActive, "Active flag"),
    sortOrder: asNonNegativeInteger(data.sortOrder, "Sort order"),
  };
}

export function parseRewardCatalogUpdate(payload: unknown) {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const type = asTrimmedString(data.type, "Type").toUpperCase();

  if (!Object.values(RewardType).includes(type as RewardType) || type === RewardType.POINTS) {
    throw new Error("Type is invalid.");
  }

  const stockTotal = asOptionalStockValue(data.stockTotal, "Stock total");
  const stockRemaining = asOptionalStockValue(data.stockRemaining, "Stock remaining");

  if ((stockTotal === null) !== (stockRemaining === null)) {
    throw new Error("Stock total and stock remaining must both be set or both be blank.");
  }

  if (
    stockTotal !== null &&
    stockRemaining !== null &&
    stockRemaining > stockTotal
  ) {
    throw new Error("Stock remaining cannot exceed stock total.");
  }

  return {
    id: asTrimmedString(data.id, "ID"),
    title: asTrimmedString(data.title, "Title"),
    description: asTrimmedString(data.description, "Description"),
    type: type as RewardType,
    cost: asNonNegativeInteger(data.cost, "Cost"),
    rewardValue: asNonNegativeInteger(data.rewardValue, "Reward value"),
    isActive: asBoolean(data.isActive, "Active flag"),
    stockTotal,
    stockRemaining,
    sortOrder: asNonNegativeInteger(data.sortOrder, "Sort order"),
  };
}
