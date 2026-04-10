export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "US" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "US" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "US" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "US" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "US" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "US" },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "US" },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "US" },
  { code: "BOS", name: "Boston Logan International", city: "Boston", country: "US" },
  { code: "DEN", name: "Denver International", city: "Denver", country: "US" },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "US" },
  { code: "EWR", name: "Newark Liberty International", city: "Newark", country: "US" },
  { code: "LGA", name: "LaGuardia", city: "New York", country: "US" },
  { code: "IAD", name: "Washington Dulles International", city: "Washington DC", country: "US" },
  { code: "DCA", name: "Ronald Reagan Washington National", city: "Washington DC", country: "US" },
  { code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "US" },
  { code: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "US" },
  { code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "US" },
  { code: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "US" },
  { code: "CLT", name: "Charlotte Douglas International", city: "Charlotte", country: "US" },
  { code: "SAN", name: "San Diego International", city: "San Diego", country: "US" },
  { code: "TPA", name: "Tampa International", city: "Tampa", country: "US" },
  { code: "PDX", name: "Portland International", city: "Portland", country: "US" },
  { code: "HNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "US" },
  { code: "AUS", name: "Austin-Bergstrom International", city: "Austin", country: "US" },
  { code: "LHR", name: "Heathrow", city: "London", country: "UK" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "FR" },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "JP" },
  { code: "HND", name: "Haneda", city: "Tokyo", country: "JP" },
  { code: "ICN", name: "Incheon International", city: "Seoul", country: "KR" },
  { code: "SIN", name: "Changi", city: "Singapore", country: "SG" },
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "HK" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "AE" },
  { code: "FRA", name: "Frankfurt am Main", city: "Frankfurt", country: "DE" },
  { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "NL" },
  { code: "SYD", name: "Kingsford Smith", city: "Sydney", country: "AU" },
  { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "CA" },
  { code: "MEX", name: "Benito Juarez International", city: "Mexico City", country: "MX" },
  { code: "CUN", name: "Cancun International", city: "Cancun", country: "MX" },
  { code: "FCO", name: "Leonardo da Vinci-Fiumicino", city: "Rome", country: "IT" },
  { code: "BCN", name: "Barcelona-El Prat", city: "Barcelona", country: "ES" },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "TH" },
  { code: "DOH", name: "Hamad International", city: "Doha", country: "QA" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR" },
  { code: "GRU", name: "Guarulhos International", city: "Sao Paulo", country: "BR" },
  { code: "BOG", name: "El Dorado International", city: "Bogota", country: "CO" },
  { code: "LIS", name: "Humberto Delgado", city: "Lisbon", country: "PT" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "DK" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "CH" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "DE" },
];

export interface PointsProgram {
  id: string;
  name: string;
  shortName: string;
  category: "credit-card" | "airline" | "hotel";
  color: string;
  iconLetter: string;
  /** IATA code for airlines (used by avs.io CDN), or logo URL for non-airlines. */
  logoCode?: string;
  logoUrl?: string;
}

export const POINTS_PROGRAMS: PointsProgram[] = [
  // Credit card programs (most popular first)
  { id: "amex-mr", name: "Amex Membership Rewards", shortName: "Amex Platinum", category: "credit-card", color: "#006FCF", iconLetter: "A", logoUrl: "/images/programs/amex.svg" },
  { id: "cap1-miles", name: "Capital One Miles", shortName: "Capital One", category: "credit-card", color: "#D03027", iconLetter: "C", logoUrl: "/images/programs/capitalone.svg" },
  { id: "bilt", name: "Bilt Rewards", shortName: "Bilt", category: "credit-card", color: "#000000", iconLetter: "B", logoUrl: "/images/programs/bilt.svg" },
  { id: "chase-ur", name: "Chase Ultimate Rewards", shortName: "Chase UR", category: "credit-card", color: "#0A3D91", iconLetter: "C", logoUrl: "/images/programs/chase.svg" },
  { id: "citi-ty", name: "Citi ThankYou Points", shortName: "Citi TY", category: "credit-card", color: "#003B70", iconLetter: "C", logoUrl: "/images/programs/citi.svg" },
  // Airline programs (use IATA code for avs.io CDN)
  { id: "united-mp", name: "United MileagePlus", shortName: "United", category: "airline", color: "#002244", iconLetter: "U", logoCode: "UA" },
  { id: "aa-advantage", name: "American AAdvantage", shortName: "AAdvantage", category: "airline", color: "#B6322D", iconLetter: "A", logoCode: "AA" },
  { id: "delta-sm", name: "Delta SkyMiles", shortName: "Delta", category: "airline", color: "#003366", iconLetter: "D", logoCode: "DL" },
  { id: "sw-rr", name: "Southwest Rapid Rewards", shortName: "Southwest", category: "airline", color: "#304CB2", iconLetter: "S", logoCode: "WN" },
  { id: "alaska-mp", name: "Alaska Mileage Plan", shortName: "Alaska", category: "airline", color: "#01426A", iconLetter: "A", logoCode: "AS" },
  // Hotel programs
  { id: "marriott-bonvoy", name: "Marriott Bonvoy", shortName: "Marriott", category: "hotel", color: "#862633", iconLetter: "M", logoUrl: "/images/programs/marriott.svg" },
  { id: "hilton-honors", name: "Hilton Honors", shortName: "Hilton", category: "hotel", color: "#104C97", iconLetter: "H", logoUrl: "/images/programs/hilton.svg" },
  { id: "hyatt-woh", name: "World of Hyatt", shortName: "Hyatt", category: "hotel", color: "#C7A259", iconLetter: "H", logoUrl: "/images/programs/hyatt.svg" },
  { id: "ihg-rewards", name: "IHG One Rewards", shortName: "IHG", category: "hotel", color: "#006341", iconLetter: "I", logoUrl: "/images/programs/ihg.svg" },
];
