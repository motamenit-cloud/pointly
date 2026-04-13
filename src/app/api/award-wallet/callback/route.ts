import { NextRequest, NextResponse } from "next/server";
import {
  getAWState,
  deleteAWState,
  setAWToken,
  type AWToken,
} from "@/lib/awardWallet";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // User denied access on AW's consent screen
  if (errorParam) {
    return NextResponse.redirect(new URL("/profile?error=aw_auth_denied", req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/profile?error=aw_auth_failed", req.url));
  }

  // Retrieve session ID from cookie
  const sessionId = req.cookies.get("aw_session")?.value;
  if (!sessionId) {
    return NextResponse.redirect(new URL("/profile?error=aw_session_missing", req.url));
  }

  // CSRF: verify state matches what we stored
  const expectedState = await getAWState(sessionId);
  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(new URL("/profile?error=aw_state_mismatch", req.url));
  }
  await deleteAWState(sessionId);

  const clientId = process.env.AWARD_WALLET_CLIENT_ID;
  const clientSecret = process.env.AWARD_WALLET_CLIENT_SECRET;
  const redirectUri = process.env.AWARD_WALLET_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL("/profile?error=aw_not_configured", req.url));
  }

  // Exchange authorization code for tokens
  let tokenData: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  try {
    const tokenRes = await fetch("https://api.awardsuite.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      console.error("[AW callback] Token exchange failed:", tokenRes.status, await tokenRes.text());
      return NextResponse.redirect(new URL("/profile?error=aw_token_exchange_failed", req.url));
    }

    tokenData = await tokenRes.json();
  } catch (err) {
    console.error("[AW callback] Token exchange error:", err);
    return NextResponse.redirect(new URL("/profile?error=aw_token_exchange_failed", req.url));
  }

  const token: AWToken = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
    lastSyncedAt: null,
  };

  await setAWToken(sessionId, token);

  // Extend the session cookie lifetime to match the stored token (90 days)
  const response = NextResponse.redirect(new URL("/profile?connected=1", req.url));
  response.cookies.set("aw_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60,
  });

  return response;
}
