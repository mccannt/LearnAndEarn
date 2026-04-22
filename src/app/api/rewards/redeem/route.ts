import { NextRequest, NextResponse } from "next/server";

import { getActiveChildIdFromRequest } from "@/lib/active-child";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childId: bodyChildId, rewardId, quantity } = body;
    const childId = await getActiveChildIdFromRequest(req, bodyChildId);
    if (!childId) return NextResponse.json({ error: "No child found" }, { status: 400 });

    if (!rewardId || typeof rewardId !== "string") {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 });
    }

    const rewardDefinition = await db.rewardCatalog.findUnique({
      where: { id: rewardId },
    });

    if (!rewardDefinition) {
      return NextResponse.json({ error: "Unknown reward" }, { status: 400 });
    }
    if (!rewardDefinition.isActive) {
      return NextResponse.json({ error: "Reward is not available" }, { status: 400 });
    }

    const normalizedQuantity = Number(quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 10) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }
    if (
      rewardDefinition.stockRemaining !== null &&
      rewardDefinition.stockRemaining < normalizedQuantity
    ) {
      return NextResponse.json({ error: "Not enough stock remaining" }, { status: 400 });
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

      const updatedCatalog =
        rewardDefinition.stockRemaining === null
          ? null
          : await tx.rewardCatalog.update({
              where: { id: rewardDefinition.id },
              data: {
                stockRemaining: {
                  decrement: normalizedQuantity,
                },
              },
            });

      const reward = await tx.reward.create({
        data: {
          childId,
          catalogItemId: rewardDefinition.id,
          type: rewardDefinition.type,
          amount: pointsToDeduct,
          quantity: normalizedQuantity,
          rewardValue: rewardDefinition.rewardValue * normalizedQuantity,
          description,
          isRedeemed: false,
        },
      });

      return { reward, updatedChild, updatedCatalog };
    });

    return NextResponse.json({
      ok: true,
      reward: result.reward,
      rewardCatalog: result.updatedCatalog,
      newTotalPoints: result.updatedChild.totalPoints,
      pointsDeducted: pointsToDeduct,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to redeem" }, { status: 500 });
  }
} 
