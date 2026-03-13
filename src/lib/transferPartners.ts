export interface TransferPartner {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  ratio: number;
}

export const TRANSFER_PARTNERS: TransferPartner[] = [
  // Chase Ultimate Rewards
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "united", toName: "United MileagePlus", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "ba", toName: "British Airways Avios", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "virgin", toName: "Virgin Atlantic Flying Club", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "flying-blue", toName: "Air France-KLM Flying Blue", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "aeroplan", toName: "Air Canada Aeroplan", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "emirates", toName: "Emirates Skywards", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "iberia", toName: "Iberia Plus", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "jetblue", toName: "JetBlue TrueBlue", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "singapore", toName: "Singapore KrisFlyer", ratio: 1.0 },
  { from: "chase-ur", fromName: "Chase Ultimate Rewards", to: "southwest", toName: "Southwest Rapid Rewards", ratio: 1.0 },

  // Amex Membership Rewards
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "delta", toName: "Delta SkyMiles", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "flying-blue", toName: "Air France-KLM Flying Blue", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "ba", toName: "British Airways Avios", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "singapore", toName: "Singapore KrisFlyer", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "ana", toName: "ANA Mileage Club", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "cathay", toName: "Cathay Pacific Asia Miles", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "emirates", toName: "Emirates Skywards", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "virgin", toName: "Virgin Atlantic Flying Club", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "avianca", toName: "Avianca LifeMiles", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "aeroplan", toName: "Air Canada Aeroplan", ratio: 1.0 },
  { from: "amex-mr", fromName: "Amex Membership Rewards", to: "jetblue", toName: "JetBlue TrueBlue", ratio: 1.0 },

  // Citi ThankYou
  { from: "citi-ty", fromName: "Citi ThankYou", to: "aa", toName: "American Airlines AAdvantage", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "turkish", toName: "Turkish Airlines Miles&Smiles", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "flying-blue", toName: "Air France-KLM Flying Blue", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "singapore", toName: "Singapore KrisFlyer", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "virgin", toName: "Virgin Atlantic Flying Club", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "jetblue", toName: "JetBlue TrueBlue", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "qatar", toName: "Qatar Airways Privilege Club", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "etihad", toName: "Etihad Guest", ratio: 1.0 },
  { from: "citi-ty", fromName: "Citi ThankYou", to: "avianca", toName: "Avianca LifeMiles", ratio: 1.0 },

  // Capital One Miles
  { from: "cap1-miles", fromName: "Capital One Miles", to: "turkish", toName: "Turkish Airlines Miles&Smiles", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "ba", toName: "British Airways Avios", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "aeroplan", toName: "Air Canada Aeroplan", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "flying-blue", toName: "Air France-KLM Flying Blue", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "avianca", toName: "Avianca LifeMiles", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "emirates", toName: "Emirates Skywards", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "singapore", toName: "Singapore KrisFlyer", ratio: 1.0 },
  { from: "cap1-miles", fromName: "Capital One Miles", to: "cathay", toName: "Cathay Pacific Asia Miles", ratio: 1.0 },

  // Bilt Rewards
  { from: "bilt", fromName: "Bilt Rewards", to: "aa", toName: "American Airlines AAdvantage", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "united", toName: "United MileagePlus", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "alaska", toName: "Alaska Airlines Mileage Plan", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "flying-blue", toName: "Air France-KLM Flying Blue", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "ba", toName: "British Airways Avios", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "turkish", toName: "Turkish Airlines Miles&Smiles", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "virgin", toName: "Virgin Atlantic Flying Club", ratio: 1.0 },
  { from: "bilt", fromName: "Bilt Rewards", to: "aeroplan", toName: "Air Canada Aeroplan", ratio: 1.0 },
];

// Map IATA carrier codes to transfer partner program keys
export const CARRIER_TO_PROGRAM: Record<string, string> = {
  UA: "united",
  BA: "ba",
  VS: "virgin",
  AF: "flying-blue",
  KL: "flying-blue",
  AC: "aeroplan",
  EK: "emirates",
  IB: "iberia",
  B6: "jetblue",
  WN: "southwest",
  DL: "delta",
  SQ: "singapore",
  NH: "ana",
  CX: "cathay",
  EY: "etihad",
  AV: "avianca",
  AA: "aa",
  TK: "turkish",
  QR: "qatar",
  AS: "alaska",
};
