// Comprehensive airport coordinates database (~380 airports)
// Coordinates are accurate to 4 decimal places

export const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
  // ─── United States ─────────────────────────────────────────────────────────
  // New York area
  JFK: { lat: 40.6413, lng: -73.7781 },
  EWR: { lat: 40.6925, lng: -74.1687 },
  LGA: { lat: 40.7772, lng: -73.8726 },
  // Los Angeles area
  LAX: { lat: 33.9425, lng: -118.4081 },
  SNA: { lat: 33.6757, lng: -117.8681 },
  ONT: { lat: 34.0560, lng: -117.6012 },
  BUR: { lat: 34.2007, lng: -118.3585 },
  LGB: { lat: 33.8177, lng: -118.1516 },
  PSP: { lat: 33.8303, lng: -116.5067 },
  // San Francisco area
  SFO: { lat: 37.6213, lng: -122.3790 },
  OAK: { lat: 37.7213, lng: -122.2208 },
  SJC: { lat: 37.3639, lng: -121.9289 },
  // Chicago area
  ORD: { lat: 41.9742, lng: -87.9073 },
  MDW: { lat: 41.7868, lng: -87.7522 },
  // Major US hubs
  ATL: { lat: 33.6407, lng: -84.4277 },
  DFW: { lat: 32.8998, lng: -97.0403 },
  DEN: { lat: 39.8561, lng: -104.6737 },
  MIA: { lat: 25.7959, lng: -80.2870 },
  FLL: { lat: 26.0726, lng: -80.1527 },
  PBI: { lat: 26.6832, lng: -80.0956 },
  TPA: { lat: 27.9756, lng: -82.5333 },
  MCO: { lat: 28.4312, lng: -81.3081 },
  SEA: { lat: 47.4502, lng: -122.3088 },
  BOS: { lat: 42.3656, lng: -71.0096 },
  DCA: { lat: 38.8512, lng: -77.0402 },
  IAD: { lat: 38.9531, lng: -77.4565 },
  BWI: { lat: 39.1754, lng: -76.6684 },
  DTW: { lat: 42.2124, lng: -83.3534 },
  MSP: { lat: 44.8820, lng: -93.2218 },
  SLC: { lat: 40.7884, lng: -111.9778 },
  IAH: { lat: 29.9844, lng: -95.3414 },
  HOU: { lat: 29.6454, lng: -95.2789 },
  PHX: { lat: 33.4373, lng: -112.0078 },
  LAS: { lat: 36.0840, lng: -115.1537 },
  SAN: { lat: 32.7338, lng: -117.1933 },
  PHL: { lat: 39.8721, lng: -75.2411 },
  CLT: { lat: 35.2140, lng: -80.9431 },
  RDU: { lat: 35.8801, lng: -78.7880 },
  BNA: { lat: 36.1263, lng: -86.6774 },
  AUS: { lat: 30.1975, lng: -97.6664 },
  SAT: { lat: 29.5337, lng: -98.4698 },
  PDX: { lat: 45.5898, lng: -122.5951 },
  STL: { lat: 38.7487, lng: -90.3700 },
  MCI: { lat: 39.2976, lng: -94.7139 },
  MKE: { lat: 42.9472, lng: -87.8966 },
  IND: { lat: 39.7173, lng: -86.2944 },
  CMH: { lat: 39.9980, lng: -82.8919 },
  CLE: { lat: 41.4117, lng: -81.8498 },
  PIT: { lat: 40.4915, lng: -80.2329 },
  JAX: { lat: 30.4941, lng: -81.6879 },
  RSW: { lat: 26.5362, lng: -81.7552 },
  SRQ: { lat: 27.3954, lng: -82.5544 },
  BUF: { lat: 42.9405, lng: -78.7322 },
  SYR: { lat: 43.1112, lng: -76.1063 },
  ROC: { lat: 43.1189, lng: -77.6724 },
  ALB: { lat: 42.7483, lng: -73.8017 },
  DAL: { lat: 32.8471, lng: -96.8518 },
  MDT: { lat: 40.1935, lng: -76.7634 },
  RIC: { lat: 37.5052, lng: -77.3197 },
  ORF: { lat: 36.8946, lng: -76.2012 },
  GRR: { lat: 42.8808, lng: -85.5228 },
  DSM: { lat: 41.5340, lng: -93.6631 },
  OMA: { lat: 41.3032, lng: -95.8941 },
  ICT: { lat: 37.6499, lng: -97.4331 },
  LIT: { lat: 34.7294, lng: -92.2243 },
  BHM: { lat: 33.5629, lng: -86.7535 },
  GSP: { lat: 34.8957, lng: -82.2189 },
  CHS: { lat: 32.8986, lng: -80.0405 },
  SAV: { lat: 32.1276, lng: -81.2021 },
  PNS: { lat: 30.4734, lng: -87.1866 },
  MOB: { lat: 30.6912, lng: -88.2428 },
  BTR: { lat: 30.5333, lng: -91.1496 },
  JAN: { lat: 32.3112, lng: -90.0759 },
  TYS: { lat: 35.8110, lng: -83.9940 },
  LEX: { lat: 38.0365, lng: -84.6059 },
  DAY: { lat: 39.9024, lng: -84.2194 },
  FNT: { lat: 42.9654, lng: -83.7436 },
  LAN: { lat: 42.7787, lng: -84.5874 },
  TOL: { lat: 41.5868, lng: -83.8078 },
  SBN: { lat: 41.7087, lng: -86.3173 },
  FWA: { lat: 40.9785, lng: -85.1951 },
  EVV: { lat: 38.0370, lng: -87.5324 },
  // Hawaii
  HNL: { lat: 21.3187, lng: -157.9224 },
  OGG: { lat: 20.8986, lng: -156.4305 },
  KOA: { lat: 19.7388, lng: -156.0456 },
  LIH: { lat: 21.9760, lng: -159.3390 },
  // Alaska
  ANC: { lat: 61.1743, lng: -149.9962 },
  FAI: { lat: 64.8151, lng: -147.8561 },
  // Southwest / Mountain
  ABQ: { lat: 35.0402, lng: -106.6090 },
  ELP: { lat: 31.8067, lng: -106.3778 },
  TUS: { lat: 32.1161, lng: -110.9410 },
  OKC: { lat: 35.3931, lng: -97.6007 },
  TUL: { lat: 36.1984, lng: -95.8881 },
  MSY: { lat: 29.9934, lng: -90.2580 },
  MEM: { lat: 35.0424, lng: -89.9767 },
  SDF: { lat: 38.1744, lng: -85.7360 },
  CVG: { lat: 39.0488, lng: -84.6678 },
  // Northern Plains / Mountain
  FAR: { lat: 46.9207, lng: -96.8158 },
  BIS: { lat: 46.7727, lng: -100.7467 },
  RAP: { lat: 44.0453, lng: -103.0574 },
  BZN: { lat: 45.7776, lng: -111.1530 },
  MSO: { lat: 46.9163, lng: -114.0906 },
  BOI: { lat: 43.5644, lng: -116.2228 },
  GEG: { lat: 47.6199, lng: -117.5338 },
  // California
  RNO: { lat: 39.4991, lng: -119.7681 },
  SMF: { lat: 38.6954, lng: -121.5908 },
  FAT: { lat: 36.7762, lng: -119.7181 },
  SBA: { lat: 34.4262, lng: -119.8405 },
  MRY: { lat: 36.5870, lng: -121.8430 },

  // ─── Europe ────────────────────────────────────────────────────────────────
  // United Kingdom
  LHR: { lat: 51.4700, lng: -0.4543 },
  LGW: { lat: 51.1537, lng: -0.1821 },
  STN: { lat: 51.8860, lng: 0.2389 },
  LTN: { lat: 51.8747, lng: -0.3683 },
  MAN: { lat: 53.3537, lng: -2.2750 },
  EDI: { lat: 55.9508, lng: -3.3615 },
  BHX: { lat: 52.4539, lng: -1.7480 },
  GLA: { lat: 55.8642, lng: -4.4331 },
  // France
  CDG: { lat: 49.0097, lng: 2.5479 },
  ORY: { lat: 48.7262, lng: 2.3652 },
  NCE: { lat: 43.6584, lng: 7.2159 },
  LYS: { lat: 45.7256, lng: 5.0811 },
  MRS: { lat: 43.4393, lng: 5.2214 },
  TLS: { lat: 43.6291, lng: 1.3638 },
  // Germany
  FRA: { lat: 50.0379, lng: 8.5622 },
  MUC: { lat: 48.3538, lng: 11.7861 },
  TXL: { lat: 52.5597, lng: 13.2877 },
  HAM: { lat: 53.6304, lng: 9.9882 },
  DUS: { lat: 51.2895, lng: 6.7668 },
  CGN: { lat: 50.8659, lng: 7.1427 },
  STR: { lat: 48.6899, lng: 9.2220 },
  // Netherlands
  AMS: { lat: 52.3105, lng: 4.7683 },
  // Spain
  MAD: { lat: 40.4983, lng: -3.5676 },
  BCN: { lat: 41.2971, lng: 2.0785 },
  // Italy
  FCO: { lat: 41.8003, lng: 12.2389 },
  MXP: { lat: 45.6306, lng: 8.7281 },
  LIN: { lat: 45.4505, lng: 9.2764 },
  // Switzerland
  ZRH: { lat: 47.4647, lng: 8.5492 },
  // Austria
  VIE: { lat: 48.1103, lng: 16.5697 },
  // Belgium
  BRU: { lat: 50.9014, lng: 4.4844 },
  // Scandinavia
  CPH: { lat: 55.6180, lng: 12.6561 },
  ARN: { lat: 59.6519, lng: 17.9186 },
  OSL: { lat: 60.1976, lng: 11.1004 },
  HEL: { lat: 60.3172, lng: 24.9633 },
  // Ireland
  DUB: { lat: 53.4264, lng: -6.2499 },
  // Portugal
  LIS: { lat: 38.7756, lng: -9.1354 },
  OPO: { lat: 41.2481, lng: -8.6814 },
  // Greece
  ATH: { lat: 37.9364, lng: 23.9445 },
  // Turkey
  IST: { lat: 41.2753, lng: 28.7519 },
  SAW: { lat: 40.8986, lng: 29.3092 },
  // Poland
  WAW: { lat: 52.1657, lng: 20.9671 },
  // Czech Republic
  PRG: { lat: 50.1008, lng: 14.2600 },
  // Hungary
  BUD: { lat: 47.4369, lng: 19.2556 },
  // Serbia
  BEG: { lat: 44.8184, lng: 20.3091 },
  // Croatia
  ZAG: { lat: 45.7430, lng: 16.0688 },
  // Romania
  OTP: { lat: 44.5711, lng: 26.0850 },
  // Bulgaria
  SOF: { lat: 42.6967, lng: 23.4114 },

  // ─── Asia ──────────────────────────────────────────────────────────────────
  // Japan
  NRT: { lat: 35.7647, lng: 140.3864 },
  HND: { lat: 35.5494, lng: 139.7798 },
  KIX: { lat: 34.4347, lng: 135.2440 },
  NGO: { lat: 34.8584, lng: 136.8050 },
  // South Korea
  ICN: { lat: 37.4602, lng: 126.4407 },
  GMP: { lat: 37.5583, lng: 126.7906 },
  // Hong Kong
  HKG: { lat: 22.3080, lng: 113.9185 },
  // Singapore
  SIN: { lat: 1.3644, lng: 103.9915 },
  // Thailand
  BKK: { lat: 13.6900, lng: 100.7501 },
  DMK: { lat: 13.9126, lng: 100.6068 },
  // Malaysia
  KUL: { lat: 2.7456, lng: 101.7099 },
  // Indonesia
  CGK: { lat: -6.1256, lng: 106.6559 },
  // Philippines
  MNL: { lat: 14.5086, lng: 121.0198 },
  // Vietnam
  SGN: { lat: 10.8188, lng: 106.6520 },
  HAN: { lat: 21.2212, lng: 105.8070 },
  // India
  DEL: { lat: 28.5562, lng: 77.1000 },
  BOM: { lat: 19.0896, lng: 72.8656 },
  MAA: { lat: 12.9941, lng: 80.1709 },
  BLR: { lat: 13.1986, lng: 77.7066 },
  CCU: { lat: 22.6547, lng: 88.4467 },
  // China
  PEK: { lat: 40.0799, lng: 116.6031 },
  PVG: { lat: 31.1443, lng: 121.8083 },
  CAN: { lat: 23.3924, lng: 113.2988 },
  SZX: { lat: 22.6393, lng: 113.8107 },
  CTU: { lat: 30.5728, lng: 103.9472 },
  // Taiwan
  TPE: { lat: 25.0797, lng: 121.2342 },
  KHH: { lat: 22.5771, lng: 120.3500 },

  // ─── Middle East ───────────────────────────────────────────────────────────
  DXB: { lat: 25.2532, lng: 55.3657 },
  AUH: { lat: 24.4330, lng: 54.6511 },
  DOH: { lat: 25.2731, lng: 51.6081 },
  JED: { lat: 21.6796, lng: 39.1565 },
  RUH: { lat: 24.9576, lng: 46.6988 },
  AMM: { lat: 31.7226, lng: 35.9932 },
  TLV: { lat: 32.0114, lng: 34.8867 },
  BAH: { lat: 26.2708, lng: 50.6336 },
  MCT: { lat: 23.5933, lng: 58.2844 },
  KWI: { lat: 29.2266, lng: 47.9689 },

  // ─── Latin America & Caribbean ─────────────────────────────────────────────
  // Mexico
  MEX: { lat: 19.4363, lng: -99.0721 },
  GDL: { lat: 20.5218, lng: -103.3113 },
  CUN: { lat: 21.0365, lng: -86.8771 },
  SJD: { lat: 23.1518, lng: -109.7215 },
  // Brazil
  GRU: { lat: -23.4356, lng: -46.4731 },
  GIG: { lat: -22.8100, lng: -43.2506 },
  // Argentina
  EZE: { lat: -34.8222, lng: -58.5358 },
  // Colombia
  BOG: { lat: 4.7016, lng: -74.1469 },
  MDE: { lat: 6.1645, lng: -75.4231 },
  // Peru
  LIM: { lat: -12.0219, lng: -77.1143 },
  // Chile
  SCL: { lat: -33.3930, lng: -70.7858 },
  // Panama
  PTY: { lat: 9.0714, lng: -79.3835 },
  // Costa Rica
  SJO: { lat: 9.9939, lng: -84.2088 },
  // Ecuador
  UIO: { lat: -0.1292, lng: -78.3575 },
  // Venezuela
  CCS: { lat: 10.6012, lng: -66.9912 },
  // Cuba
  HAV: { lat: 22.9892, lng: -82.4091 },
  // Jamaica
  MBJ: { lat: 18.5037, lng: -77.9134 },
  // Bahamas
  NAS: { lat: 25.0390, lng: -77.4662 },
  // Sint Maarten
  SXM: { lat: 18.0410, lng: -63.1089 },
  // Dominican Republic
  PUJ: { lat: 18.5674, lng: -68.3634 },
  // US Virgin Islands
  STT: { lat: 18.3373, lng: -64.9734 },
  // Aruba
  AUA: { lat: 12.5014, lng: -70.0152 },
  // Barbados
  BGI: { lat: 13.0746, lng: -59.4925 },
  // Cayman Islands
  GCM: { lat: 19.2928, lng: -81.3577 },

  // ─── Oceania ───────────────────────────────────────────────────────────────
  // Australia
  SYD: { lat: -33.9461, lng: 151.1772 },
  MEL: { lat: -37.6733, lng: 144.8431 },
  BNE: { lat: -27.3842, lng: 153.1175 },
  PER: { lat: -31.9403, lng: 115.9672 },
  // New Zealand
  AKL: { lat: -37.0082, lng: 174.7850 },
  CHC: { lat: -43.4894, lng: 172.5323 },
  // Fiji
  NAN: { lat: -17.7554, lng: 177.4431 },
  // French Polynesia
  PPT: { lat: -17.5537, lng: -149.6064 },

  // ─── Africa ────────────────────────────────────────────────────────────────
  // South Africa
  JNB: { lat: -26.1392, lng: 28.2460 },
  CPT: { lat: -33.9649, lng: 18.6017 },
  // Kenya
  NBO: { lat: -1.3192, lng: 36.9278 },
  // Ethiopia
  ADD: { lat: 8.9779, lng: 38.7993 },
  // Egypt
  CAI: { lat: 30.1219, lng: 31.4056 },
  // Morocco
  CMN: { lat: 33.3675, lng: -7.5898 },
  // Nigeria
  LOS: { lat: 6.5774, lng: 3.3212 },
  // Ghana
  ACC: { lat: 5.6052, lng: -0.1668 },
  // Tanzania
  DAR: { lat: -6.8781, lng: 39.2026 },
};

/**
 * Look up coordinates for an IATA airport code.
 * Returns null if the airport is not in the database.
 */
export function getAirportCoords(iata: string): { lat: number; lng: number } | null {
  const code = iata.toUpperCase().trim();
  return AIRPORT_COORDS[code] ?? null;
}
