import { NextRequest, NextResponse } from "next/server";
import { unauthorizedResponse, isParentAuthed } from "@/lib/auth";
import { db } from "@/lib/db";

async function getChildIdFromReq(req: NextRequest, bodyChildId?: string | null) {
  if (bodyChildId) return bodyChildId;
  const cookieId = req.cookies.get("active_child_id")?.value;
  if (cookieId) return cookieId;
  const child = await db.child.findFirst({ orderBy: { createdAt: "asc" } });
  return child?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    if (!isParentAuthed(req)) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { childId: bodyChildId, resetType = "all" } = body;
    
    const childId = await getChildIdFromReq(req, bodyChildId);
    if (!childId) {
      return NextResponse.json({ error: "No child ID provided" }, { status: 400 });
    }

    // Validate reset type
    const validResetTypes = ["all", "sessions", "progress", "rewards", "points"];
    if (!validResetTypes.includes(resetType)) {
      return NextResponse.json({ error: "Invalid reset type" }, { status: 400 });
    }

    let resetOperations: any[] = [];
    let resetMessage = "";

    switch (resetType) {
      case "sessions":
        resetOperations.push(db.learningSession.deleteMany({ where: { childId } }));
        resetMessage = "All learning sessions cleared";
        break;
      case "progress":
        resetOperations.push(db.progress.deleteMany({ where: { childId } }));
        resetMessage = "All progress data cleared";
        break;
      case "rewards":
        resetOperations.push(db.reward.deleteMany({ where: { childId } }));
        resetMessage = "All reward history cleared";
        break;
      case "points":
        resetOperations.push(db.child.update({ 
          where: { id: childId }, 
          data: { totalPoints: 0, currentStreak: 0 } 
        }));
        resetMessage = "Points and streak reset to 0";
        break;
      case "all":
        resetOperations = [
          db.learningSession.deleteMany({ where: { childId } }),
          db.progress.deleteMany({ where: { childId } }),
          db.reward.deleteMany({ where: { childId } }),
          db.child.update({ 
            where: { id: childId }, 
            data: { totalPoints: 0, currentStreak: 0 } 
          })
        ];
        resetMessage = "All child data completely reset";
        break;
    }

    if (resetOperations.length > 0) {
      await db.$transaction(resetOperations);
    }

    return NextResponse.json({ 
      ok: true, 
      message: resetMessage,
      resetType 
    });
  } catch (e: any) {
    console.error("Reset error:", e);
    return NextResponse.json({ 
      error: "Failed to reset data", 
      message: e?.message 
    }, { status: 500 });
  }
} 
