import { NextRequest, NextResponse } from "next/server";
import { getValidAWToken, setAWToken, PROGRAM_NAME_MAP } from "@/lib/awardWallet";

interface AWAccount {
  id: string | number;
  program_name: string;
  balance: number;
  // AW may include other fields; we only care about these
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("aw_session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Not connected to Award Wallet." }, { status: 401 });
  }

  let token;
  try {
    token = await getValidAWToken(sessionId);
  } catch (err) {
    console.error("[AW sync] Token retrieval failed:", err);
    return NextResponse.json(
      { error: "Failed to retrieve Award Wallet token. Please reconnect." },
      { status: 401 }
    );
  }

  if (!token) {
    return NextResponse.json({ error: "Not connected to Award Wallet." }, { status: 401 });
  }

  // Fetch accounts from Award Wallet API
  let accounts: AWAccount[];
  try {
    const res = await fetch("https://api.awardsuite.com/v1/accounts", {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.error("[AW sync] Accounts fetch failed:", res.status, await res.text());
      return NextResponse.json(
        { error: `Award Wallet API error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    // AW may return { accounts: [...] } or directly an array
    accounts = Array.isArray(data) ? data : (data.accounts ?? []);
  } catch (err) {
    console.error("[AW sync] Accounts fetch error:", err);
    return NextResponse.json({ error: "Failed to reach Award Wallet API." }, { status: 502 });
  }

  const syncedAt = new Date().toISOString();
  const balances: { programId: string; balance: number; lastSyncedAt: string }[] = [];

  for (const account of accounts) {
    // Normalise program name: try exact match first, then case-insensitive
    let programId =
      PROGRAM_NAME_MAP[account.program_name] ??
      PROGRAM_NAME_MAP[
        Object.keys(PROGRAM_NAME_MAP).find(
          (k) => k.toLowerCase() === account.program_name?.toLowerCase()
        ) ?? ""
      ];

    if (!programId) continue; // Unknown program — skip

    const existingIdx = balances.findIndex((b) => b.programId === programId);
    if (existingIdx >= 0) {
      // Sum if the same program appears multiple times (e.g. multiple AW accounts)
      balances[existingIdx].balance += account.balance ?? 0;
    } else {
      balances.push({ programId, balance: account.balance ?? 0, lastSyncedAt: syncedAt });
    }
  }

  // Update lastSyncedAt on the stored token
  await setAWToken(sessionId, { ...token, lastSyncedAt: syncedAt });

  return NextResponse.json({ balances, syncedAt });
}
