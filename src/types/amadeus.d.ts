declare module "amadeus" {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
  }

  interface AmadeusResponse {
    data: unknown[];
    result: unknown;
  }

  interface FlightOffersSearch {
    get(params: {
      originLocationCode: string;
      destinationLocationCode: string;
      departureDate: string;
      adults: number;
      travelClass?: string;
      max?: number;
      currencyCode?: string;
      nonStop?: boolean;
    }): Promise<AmadeusResponse>;
  }

  interface Shopping {
    flightOffersSearch: FlightOffersSearch;
  }

  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: Shopping;
  }

  export default Amadeus;
}
