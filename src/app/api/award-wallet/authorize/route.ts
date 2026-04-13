import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setAWState } from "@/lib/awardWallet";

export async function GET() {
  const clientId = process.env.AWARD_WALLET_CLIENT_ID;
  const redirectUri = process.env.AWARD_WALLET_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "Award Wallet credentials not configured.",
        hint: "Set AWARD_WALLET_CLIENT_ID and AWARD_WALLET_REDIRECT_URI in .env.local",
      },
      { status: 503 }
    );
  }

  // Generate a random session ID (used to look up this OAuth attempt later)
  const sessionId = randomBytes(16).toString("hex");
  // Generate a random CSRF state nonce
  const state = randomBytes(16).toString("hex");

  // Store the state in Redis (TTL 10 minutes) so callback can verify it
  await setAWState(sessionId, state);

  // Build AW authorization URL
  const authUrl = new URL("https://api.awardsuite.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "accounts");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());

  // Store sessionId in an httpOnly cookie so callback can retrieve the state
  response.cookies.set("aw_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes — just long enough for the OAuth round-trip
  });

  return response;
}
