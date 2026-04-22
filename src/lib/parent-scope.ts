import type { NextRequest } from "next/server";

import { db } from "@/lib/db";

export async function getCurrentParent() {
  return db.parent.findFirst({
    orderBy: { createdAt: "asc" },
  });
}

export async function getCurrentParentId() {
  const parent = await getCurrentParent();
  return parent?.id ?? null;
}

export async function getChildForCurrentParent(childId: string) {
  const parentId = await getCurrentParentId();
  if (!parentId) {
    return null;
  }

  return db.child.findFirst({
    where: {
      id: childId,
      parentId,
    },
  });
}

export async function getFirstChildForCurrentParent() {
  const parentId = await getCurrentParentId();
  if (!parentId) {
    return null;
  }

  return db.child.findFirst({
    where: { parentId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getScopedChildIdFromRequest(
  req: NextRequest,
  explicitChildId?: string | null,
) {
  if (explicitChildId) {
    const child = await getChildForCurrentParent(explicitChildId);
    return child?.id ?? null;
  }

  const cookieChildId = req.cookies.get("active_child_id")?.value;
  if (cookieChildId) {
    const child = await getChildForCurrentParent(cookieChildId);
    if (child) {
      return child.id;
    }
  }

  const fallbackChild = await getFirstChildForCurrentParent();
  return fallbackChild?.id ?? null;
}
