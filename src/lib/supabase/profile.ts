/**
 * Supabase profile helpers — async read/write for user_profiles and program_balances.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile, ProgramBalance, TravelPreferences } from "@/lib/userProfile";
import { DEFAULT_PREFERENCES } from "@/lib/userProfile";

export async function loadProfileFromSupabase(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const [profileRes, balancesRes] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", userId).single(),
    supabase.from("program_balances").select("*").eq("user_id", userId),
  ]);

  if (profileRes.error && profileRes.error.code !== "PGRST116") return null;

  const row = profileRes.data;
  const preferences: TravelPreferences = row
    ? {
        preferredCabin: row.preferred_cabin ?? DEFAULT_PREFERENCES.preferredCabin,
        seatPreference: row.seat_preference ?? DEFAULT_PREFERENCES.seatPreference,
        tripStyle: row.trip_style ?? DEFAULT_PREFERENCES.tripStyle,
        tripsPerYear: row.trips_per_year ?? DEFAULT_PREFERENCES.tripsPerYear,
        preferredAirlines: row.preferred_airlines ?? [],
        preferredHotels: [],
        wishlistDestinations: row.wishlist_destinations ?? [],
      }
    : DEFAULT_PREFERENCES;

  const programs: ProgramBalance[] = (balancesRes.data ?? []).map((b) => ({
    programId: b.program_id,
    balance: b.balance,
    lastSyncedAt: b.last_synced_at ?? null,
  }));

  return {
    homeAirport: row?.home_airport ?? null,
    programs,
    preferences,
  };
}

export async function saveProfileToSupabase(
  supabase: SupabaseClient,
  userId: string,
  profile: UserProfile,
): Promise<void> {
  const prefs = profile.preferences ?? DEFAULT_PREFERENCES;

  await supabase.from("user_profiles").upsert({
    id: userId,
    home_airport: profile.homeAirport,
    preferred_cabin: prefs.preferredCabin,
    seat_preference: prefs.seatPreference,
    trip_style: prefs.tripStyle,
    trips_per_year: prefs.tripsPerYear,
    preferred_airlines: prefs.preferredAirlines,
    wishlist_destinations: prefs.wishlistDestinations,
    updated_at: new Date().toISOString(),
  });

  // Upsert all program balances
  if (profile.programs.length > 0) {
    await supabase.from("program_balances").upsert(
      profile.programs.map((p) => ({
        user_id: userId,
        program_id: p.programId,
        balance: p.balance,
        last_synced_at: p.lastSyncedAt ?? null,
      })),
      { onConflict: "user_id,program_id" },
    );
  }
}

export async function saveSearchHistory(
  supabase: SupabaseClient,
  userId: string,
  search: { origin: string; destination: string; date: string; cabin: string; passengers: number },
): Promise<void> {
  await supabase.from("search_history").insert({
    user_id: userId,
    ...search,
  });
}
