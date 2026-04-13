export interface ProgramBalance {
  programId: string;
  balance: number;
  lastSyncedAt?: string | null; // ISO date string, set whenever balance is saved
}

export interface TravelPreferences {
  preferredCabin: "economy" | "premium-economy" | "business" | "first";
  seatPreference: "window" | "aisle" | "no-preference";
  tripStyle: "leisure" | "business" | "mixed";
  tripsPerYear: "1-2" | "3-5" | "6-10" | "10+";
  preferredAirlines: string[];   // airline program IDs e.g. ["united", "delta"]
  preferredHotels: string[];     // hotel program IDs e.g. ["hyatt", "marriott"]
  wishlistDestinations: string[]; // free-text destination names
}

export interface UserProfile {
  homeAirport: string | null;
  programs: ProgramBalance[];
  preferences?: TravelPreferences;
}

export interface UserAccount {
  name: string;
  email: string;
  signedIn: boolean;
}

const STORAGE_KEY = "pointly-user-profile";
const ACCOUNT_KEY = "pointly-user-account";

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getUserAccount(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserAccount;
  } catch {
    return null;
  }
}

export function saveUserAccount(account: UserAccount): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCOUNT_KEY);
}

/** Get total points across all programs. */
export function getTotalPoints(): number {
  const profile = getUserProfile();
  if (!profile) return 0;
  return profile.programs.reduce((sum, p) => sum + p.balance, 0);
}

export const DEFAULT_PREFERENCES: TravelPreferences = {
  preferredCabin: "business",
  seatPreference: "window",
  tripStyle: "mixed",
  tripsPerYear: "3-5",
  preferredAirlines: [],
  preferredHotels: [],
  wishlistDestinations: [],
};
