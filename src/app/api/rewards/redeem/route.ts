import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRewardDefinition } from "@/lib/game-config";
import { RewardType } from "@prisma/client";

async function getDefaultChildId() {
  const child = await db.child.findFirst({ orderBy: { createdAt: "asc" } });
  return child?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childId: bodyChildId, rewardId, quantity } = body;
    const childId = bodyChildId || (await getDefaultChildId());
    if (!childId) return NextResponse.json({ error: "No child found" }, { status: 400 });

    if (!rewardId || typeof rewardId !== "string") {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 });
    }

    const rewardDefinition = getRewardDefinition(rewardId);
    if (!rewardDefinition) {
      return NextResponse.json({ error: "Unknown reward" }, { status: 400 });
    }

    const normalizedQuantity = Number(quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 10) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const pointsToDeduct = rewardDefinition.cost * normalizedQuantity;
    const description =
      normalizedQuantity === 1
        ? rewardDefinition.title
        : `${rewardDefinition.title} x${normalizedQuantity}`;

    const child = await db.child.findUnique({ where: { id: childId } });
    if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });
    if (child.totalPoints < pointsToDeduct) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const updatedChild = await tx.child.update({
        where: { id: childId },
        data: { totalPoints: { decrement: pointsToDeduct } },
      });

      const reward = await tx.reward.create({
        data: {
          childId,
          type:
            rewardDefinition.type === "screen_time"
              ? RewardType.SCREEN_TIME_MINUTES
              : RewardType.ROBLOX_CREDITS,
          amount: pointsToDeduct,
          description,
          isRedeemed: false,
        },
      });

      return { reward, updatedChild };
    });

    return NextResponse.json({
      ok: true,
      reward: result.reward,
      newTotalPoints: result.updatedChild.totalPoints,
      pointsDeducted: pointsToDeduct,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to redeem" }, { status: 500 });
  }
} 
