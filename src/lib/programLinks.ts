/** Direct URLs to each loyalty program's balance / account page */
export const PROGRAM_BALANCE_URLS: Record<string, string> = {
  "amex-mr":         "https://www.americanexpress.com/en-us/rewards/membership-rewards/",
  "chase-ur":        "https://ultimaterewards.com",
  "citi-ty":         "https://www.thankyou.com",
  "cap1-miles":      "https://www.capitalone.com/credit-cards/rewards/",
  "bilt":            "https://www.biltrewards.com/points",
  "united-mp":       "https://www.united.com/en/us/fly/mileageplus.html",
  "aa-advantage":    "https://www.aa.com/loyalty/",
  "delta-sm":        "https://www.delta.com/us/en/skymiles/overview",
  "sw-rr":           "https://www.southwest.com/rapidrewards/",
  "alaska-mp":       "https://www.alaskaair.com/mileageplan/",
  "marriott-bonvoy": "https://www.marriott.com/loyalty/",
  "hilton-honors":   "https://www.hilton.com/en/hiltonhonors/",
  "hyatt-woh":       "https://world.hyatt.com/",
  "ihg-rewards":     "https://www.ihg.com/rewardsclub/",
};

/** ms before a balance is considered stale (7 days) */
export const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function isStale(lastSyncedAt?: string | null): boolean {
  if (!lastSyncedAt) return true;
  return Date.now() - new Date(lastSyncedAt).getTime() > STALE_THRESHOLD_MS;
}

export function formatLastSynced(lastSyncedAt?: string | null): string {
  if (!lastSyncedAt) return "Never synced";
  const diff = Date.now() - new Date(lastSyncedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}
