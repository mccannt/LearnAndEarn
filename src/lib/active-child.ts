import type { NextRequest } from "next/server";

export const ACTIVE_CHILD_COOKIE = "active_child_id";
import { getScopedChildIdFromRequest } from "@/lib/parent-scope";

export async function getActiveChildIdFromRequest(
  req: NextRequest,
  explicitChildId?: string | null,
) {
  return getScopedChildIdFromRequest(
    req,
    explicitChildId ?? req.nextUrl.searchParams.get("childId"),
  );
}
