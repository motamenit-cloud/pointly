import { NextRequest, NextResponse } from "next/server";
import { deleteAWToken } from "@/lib/awardWallet";

export async function DELETE(req: NextRequest) {
  const sessionId = req.cookies.get("aw_session")?.value;

  if (sessionId) {
    try {
      await deleteAWToken(sessionId);
    } catch {
      // Silently ignore — token may already be gone or Redis unavailable
    }
  }

  const response = NextResponse.json({ disconnected: true });

  // Clear the session cookie
  response.cookies.set("aw_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
