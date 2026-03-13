export interface ProgramBalance {
  programId: string;
  balance: number;
}

export interface UserProfile {
  homeAirport: string | null;
  programs: ProgramBalance[];
}

const STORAGE_KEY = "pointly-user-profile";

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
