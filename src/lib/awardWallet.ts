/**
 * Award Wallet OAuth token helpers (server-side only).
 * Tokens are stored in Upstash Redis keyed by session ID.
 */

import { Redis } from "@upstash/redis";

// Lazy-initialise Redis so that missing env vars only throw at runtime (not build time)
function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set to use Award Wallet sync."
    );
  }
  return new Redis({ url, token });
}

export interface AWToken {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp (ms) when the access token expires */
  expiresAt: number;
  /** ISO string — when we last successfully synced balances */
  lastSyncedAt?: string | null;
}

const TOKEN_PREFIX = "aw:token:";
const STATE_PREFIX = "aw:state:";
/** TTL for OAuth state nonce in Redis (10 minutes) */
const STATE_TTL_SECONDS = 600;
/** TTL for stored token (90 days; refresh keeps it alive) */
const TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

// ─── State (CSRF nonce) helpers ──────────────────────────────────────────────

export async function setAWState(sessionId: string, state: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`${STATE_PREFIX}${sessionId}`, state, { ex: STATE_TTL_SECONDS });
}

export async function getAWState(sessionId: string): Promise<string | null> {
  const redis = getRedis();
  return redis.get<string>(`${STATE_PREFIX}${sessionId}`);
}

export async function deleteAWState(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${STATE_PREFIX}${sessionId}`);
}

// ─── Token helpers ───────────────────────────────────────────────────────────

export async function getAWToken(sessionId: string): Promise<AWToken | null> {
  const redis = getRedis();
  return redis.get<AWToken>(`${TOKEN_PREFIX}${sessionId}`);
}

export async function setAWToken(sessionId: string, token: AWToken): Promise<void> {
  const redis = getRedis();
  await redis.set(`${TOKEN_PREFIX}${sessionId}`, token, { ex: TOKEN_TTL_SECONDS });
}

export async function deleteAWToken(sessionId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${TOKEN_PREFIX}${sessionId}`);
}

export async function isAWConnected(sessionId: string): Promise<boolean> {
  const token = await getAWToken(sessionId);
  return token !== null;
}

/**
 * Refresh an expired AW access token using the stored refresh token.
 * Updates Redis and returns the new token.
 */
export async function refreshAWToken(
  sessionId: string,
  token: AWToken
): Promise<AWToken> {
  const clientId = process.env.AWARD_WALLET_CLIENT_ID;
  const clientSecret = process.env.AWARD_WALLET_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("AWARD_WALLET_CLIENT_ID / AWARD_WALLET_CLIENT_SECRET not configured.");
  }

  const res = await fetch("https://api.awardsuite.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`AW token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const newToken: AWToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? token.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    lastSyncedAt: token.lastSyncedAt,
  };

  await setAWToken(sessionId, newToken);
  return newToken;
}

/**
 * Returns a valid (possibly freshly-refreshed) token, or null if not connected.
 */
export async function getValidAWToken(sessionId: string): Promise<AWToken | null> {
  const token = await getAWToken(sessionId);
  if (!token) return null;

  // Refresh if within 5 minutes of expiry
  if (Date.now() > token.expiresAt - 5 * 60 * 1000) {
    return refreshAWToken(sessionId, token);
  }
  return token;
}

// ─── Program name → programId mapping ───────────────────────────────────────

/** Maps Award Wallet program display names to our internal program IDs */
export const PROGRAM_NAME_MAP: Record<string, string> = {
  "Membership Rewards": "amex-mr",
  "American Express Membership Rewards": "amex-mr",
  "Ultimate Rewards": "chase-ur",
  "Chase Ultimate Rewards": "chase-ur",
  "ThankYou Points": "citi-ty",
  "Citi ThankYou": "citi-ty",
  "Capital One Miles": "cap1-miles",
  "Venture Miles": "cap1-miles",
  "Bilt Rewards": "bilt",
  "MileagePlus": "united-mp",
  "United MileagePlus": "united-mp",
  "AAdvantage": "aa-advantage",
  "American Airlines AAdvantage": "aa-advantage",
  "SkyMiles": "delta-sm",
  "Delta SkyMiles": "delta-sm",
  "Rapid Rewards": "sw-rr",
  "Southwest Rapid Rewards": "sw-rr",
  "Mileage Plan": "alaska-mp",
  "Alaska Mileage Plan": "alaska-mp",
  "Marriott Bonvoy": "marriott-bonvoy",
  "Hilton Honors": "hilton-honors",
  "World of Hyatt": "hyatt-woh",
  "Hyatt": "hyatt-woh",
  "IHG Rewards": "ihg-rewards",
  "IHG Rewards Club": "ihg-rewards",
  "IHG One Rewards": "ihg-rewards",
};
