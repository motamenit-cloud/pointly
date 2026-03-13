import type { FlightResult, TransferOption } from "@/components/search/FlightResultCard";
import type { UserProfile } from "./userProfile";
import { TRANSFER_PARTNERS } from "./transferPartners";
import { POINTS_PROGRAMS } from "@/components/onboarding/airports";

export interface PersonalizedFlight extends FlightResult {
  canAfford: boolean;
  bestUserOption: TransferOption | null;
  pointsGap: number;
  personalBadge?: "can-book" | "best-for-you" | "almost-there";
  userBalance?: number;
  userProgramName?: string;
  userProgramFullName?: string;
}

/**
 * Match a transfer option's transferFrom name to a user's program ID.
 */
function findUserBalance(
  opt: TransferOption,
  profile: UserProfile,
): { programId: string; balance: number } | null {
  for (const pb of profile.programs) {
    const program = POINTS_PROGRAMS.find((p) => p.id === pb.programId);
    if (!program) continue;
    // Match by program name in transferFrom
    if (
      opt.transferFrom &&
      (opt.transferFrom.includes(program.name) ||
        opt.transferFrom.includes(program.shortName) ||
        program.name.includes(opt.transferFrom))
    ) {
      return pb;
    }
    // Also match direct program name (for airline programs booked directly)
    if (
      opt.program.includes(program.name) ||
      opt.program.includes(program.shortName)
    ) {
      return pb;
    }
  }
  return null;
}

export function personalizeResults(
  flights: FlightResult[],
  profile: UserProfile | null,
): PersonalizedFlight[] {
  if (!profile || profile.programs.length === 0) {
    return flights.map((f) => ({
      ...f,
      canAfford: false,
      bestUserOption: null,
      pointsGap: 0,
    }));
  }

  // Get user's program IDs for matching
  const userProgramIds = new Set(profile.programs.map((p) => p.programId));

  // Also build a set of airline program keys the user can reach via transfers
  const reachablePrograms = new Set<string>();
  for (const pb of profile.programs) {
    // Direct airline/hotel programs
    reachablePrograms.add(pb.programId);
    // Credit card transfer partners
    const partners = TRANSFER_PARTNERS.filter(
      (tp) => tp.from === pb.programId,
    );
    for (const tp of partners) {
      reachablePrograms.add(tp.to);
    }
  }

  const personalized: PersonalizedFlight[] = flights.map((flight) => {
    let bestOption: TransferOption | null = null;
    let bestBalance = 0;
    let bestGap = Infinity;
    let bestProgramName = "";

    for (const opt of flight.transferOptions) {
      const userMatch = findUserBalance(opt, profile);
      if (!userMatch) continue;

      const gap = opt.points - userMatch.balance;
      // Prefer the option with the smallest gap (most affordable)
      if (gap < bestGap) {
        bestGap = gap;
        bestOption = opt;
        bestBalance = userMatch.balance;
        const prog = POINTS_PROGRAMS.find(
          (p) => p.id === userMatch.programId,
        );
        bestProgramName = prog?.shortName || userMatch.programId;
      }
    }

    const canAfford = bestOption !== null && bestGap <= 0;
    const pointsGap = bestOption ? Math.max(0, bestGap) : 0;

    let personalBadge: PersonalizedFlight["personalBadge"] = undefined;
    if (canAfford) {
      personalBadge = "can-book";
    } else if (bestOption && pointsGap > 0 && pointsGap <= bestOption.points * 0.2) {
      personalBadge = "almost-there";
    }

    // Get the full program name for matching in the UI
    const matchedProg = bestOption
      ? POINTS_PROGRAMS.find((p) => p.shortName === bestProgramName || p.id === bestProgramName)
      : null;

    return {
      ...flight,
      canAfford,
      bestUserOption: bestOption,
      pointsGap,
      personalBadge,
      userBalance: bestBalance,
      userProgramName: bestProgramName,
      userProgramFullName: matchedProg?.name || bestProgramName,
    };
  });

  // Sort: affordable first, then by points cost
  personalized.sort((a, b) => {
    if (a.canAfford && !b.canAfford) return -1;
    if (!a.canAfford && b.canAfford) return 1;
    // Among affordable: lowest points first
    if (a.canAfford && b.canAfford) {
      return (a.bestUserOption?.points ?? 0) - (b.bestUserOption?.points ?? 0);
    }
    // Among non-affordable: smallest gap first
    return a.pointsGap - b.pointsGap;
  });

  // Mark the first affordable flight as "best-for-you"
  const firstAffordable = personalized.find((f) => f.canAfford);
  if (firstAffordable) {
    firstAffordable.personalBadge = "best-for-you";
  }

  return personalized;
}

/**
 * Generate a personalized tip message from the results.
 */
export function getPersonalizedTip(
  flights: PersonalizedFlight[],
  profile: UserProfile | null,
): { title: string; subtitle: string } | null {
  if (!profile || profile.programs.length === 0) return null;

  const affordable = flights.filter((f) => f.canAfford);
  const bestFlight = flights.find((f) => f.personalBadge === "best-for-you");

  if (bestFlight?.bestUserOption && bestFlight.userProgramName) {
    const remaining =
      (bestFlight.userBalance ?? 0) - (bestFlight.bestUserOption.points ?? 0);
    return {
      title: `Best for you: Use ${bestFlight.userProgramName} → ${bestFlight.bestUserOption.program}`,
      subtitle: `${bestFlight.bestUserOption.points.toLocaleString()} points for ${bestFlight.stops === 0 ? "nonstop" : `${bestFlight.stops}-stop`} ${bestFlight.cabin}${affordable.length > 1 ? ` \u2014 you can afford ${affordable.length} of these flights` : ""}${remaining > 0 ? ` (${remaining.toLocaleString()} pts remaining)` : ""}`,
    };
  }

  if (affordable.length > 0) {
    return {
      title: `You can book ${affordable.length} flight${affordable.length !== 1 ? "s" : ""} with your points!`,
      subtitle: "Flights you can afford are shown first.",
    };
  }

  const closest = flights[0];
  if (closest?.pointsGap > 0 && closest.userProgramName) {
    return {
      title: `Almost there! Need ${closest.pointsGap.toLocaleString()} more ${closest.userProgramName} points`,
      subtitle: "Keep earning — you're close to your next award flight.",
    };
  }

  return null;
}
