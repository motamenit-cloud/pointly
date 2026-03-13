import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/amadeus";
import { transformAmadeusToFlightResults } from "@/lib/transformFlights";
import { mockFlights } from "@/components/search/mockFlights";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const cabin = searchParams.get("cabin") || "economy";
  const passengers = parseInt(searchParams.get("passengers") || "1", 10);

  if (!origin || !destination || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: origin, destination, date" },
      { status: 400 },
    );
  }

  // If no Amadeus credentials, return mock data
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    return NextResponse.json({
      flights: mockFlights,
      meta: { origin, destination, date, cabin, passengers, source: "mock" },
    });
  }

  try {
    const offers = await searchFlights({
      origin,
      destination,
      date,
      cabin,
      passengers,
    });

    if (offers.length === 0) {
      return NextResponse.json({
        flights: [],
        meta: {
          origin,
          destination,
          date,
          cabin,
          passengers,
          source: "amadeus",
          count: 0,
        },
      });
    }

    const flights = transformAmadeusToFlightResults(offers, cabin);

    return NextResponse.json({
      flights,
      meta: {
        origin,
        destination,
        date,
        cabin,
        passengers,
        source: "amadeus",
        count: flights.length,
      },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    // Graceful fallback to mock data
    return NextResponse.json({
      flights: mockFlights,
      meta: {
        origin,
        destination,
        date,
        cabin,
        passengers,
        source: "mock-fallback",
      },
    });
  }
}
