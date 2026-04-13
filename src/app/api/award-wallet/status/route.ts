import { NextRequest, NextResponse } from "next/server";
import { getAWToken } from "@/lib/awardWallet";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("aw_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ connected: false, lastSyncedAt: null });
  }

  try {
    const token = await getAWToken(sessionId);
    if (!token) {
      return NextResponse.json({ connected: false, lastSyncedAt: null });
    }
    return NextResponse.json({
      connected: true,
      lastSyncedAt: token.lastSyncedAt ?? null,
    });
  } catch {
    // Redis not configured or unreachable — treat as not connected
    return NextResponse.json({ connected: false, lastSyncedAt: null });
  }
}
